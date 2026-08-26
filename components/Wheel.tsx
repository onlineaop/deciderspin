"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./Wheel.module.css";

const COLORS = [
  "#ff5da2",
  "#ffd479",
  "#7c5cff",
  "#4fd6e0",
  "#ff8657",
  "#8bd450",
  "#ff6bd1",
  "#5f9dff",
];

const DEFAULTS = ["Yes", "No", "Maybe", "I don't know"];
const STORAGE_KEY = "deciderspin_wheel_options";
const SPIN_DURATION_MS = 5300;
// Must match the canvas's CSS transition duration exactly (Wheel.module.css
// .canvas { transition: transform 5.2s cubic-bezier(.17,.67,.1,1); }) so
// the synthesized clicks land on the same instants the wheel visually
// crosses each slice boundary, not just approximately.
const SPIN_TRANSITION_SEC = 5.2;
const EASE_P1X = 0.17;
const EASE_P1Y = 0.67;
const EASE_P2X = 0.1;
const EASE_P2Y = 1;

// Same "solve x for t, then evaluate y" approach browsers use internally
// for CSS cubic-bezier() timing functions.
function bezierA(a1: number, a2: number) {
  return 1 - 3 * a2 + 3 * a1;
}
function bezierB(a1: number, a2: number) {
  return 3 * a2 - 6 * a1;
}
function bezierC(a1: number) {
  return 3 * a1;
}
function bezierValue(t: number, a1: number, a2: number) {
  return ((bezierA(a1, a2) * t + bezierB(a1, a2)) * t + bezierC(a1)) * t;
}
function bezierSlope(t: number, a1: number, a2: number) {
  return 3 * bezierA(a1, a2) * t * t + 2 * bezierB(a1, a2) * t + bezierC(a1);
}
function tForX(x: number) {
  let t = x;
  for (let i = 0; i < 8; i++) {
    const slope = bezierSlope(t, EASE_P1X, EASE_P2X);
    if (slope === 0) return t;
    const currentX = bezierValue(t, EASE_P1X, EASE_P2X) - x;
    t -= currentX / slope;
  }
  return t;
}
// progress (0-1, how far through the rotation) at time-fraction t (0-1)
function easeProgress(t: number) {
  return bezierValue(tForX(t), EASE_P1Y, EASE_P2Y);
}
// Inverse: at what time-fraction does the eased progress hit `target`?
// easeProgress is monotonic here, so binary search is exact enough.
function timeForProgress(target: number) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (easeProgress(mid) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export default function Wheel() {
  const [options, setOptions] = useState<string[]>(DEFAULTS);
  const [inputValue, setInputValue] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);

  // AudioContext must be created inside a user-gesture handler (the SPIN
  // click) or browsers refuse to let it produce sound — lazily built once
  // and reused for every future spin.
  const ensureAudio = (): AudioContext | null => {
    type WindowWithWebkitAudio = typeof window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioCtx =
      window.AudioContext ||
      (window as WindowWithWebkitAudio).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!audioCtxRef.current) {
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const length = Math.floor(ctx.sampleRate * 0.03);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noiseBufferRef.current = buffer;
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  };

  // The "clack" — a short filtered noise burst, like a plastic peg
  // flicking past the pointer.
  const playClick = (ctx: AudioContext, when: number, volume: number) => {
    const buffer = noiseBufferRef.current;
    if (!buffer) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 3000 + Math.random() * 600;
    filter.Q.value = 1.1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.035);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(when);
    source.stop(when + 0.05);
  };

  // The soft "thunk" when the wheel settles on its result.
  const playLanding = (ctx: AudioContext, when: number) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, when);
    osc.frequency.exponentialRampToValueAtTime(90, when + 0.12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.28, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(when);
    osc.stop(when + 0.25);
  };

  // Schedules every slice-boundary click for this spin, timed against the
  // exact same easing curve the CSS transform transition uses, so the
  // audio and the visual wheel cross each boundary at the same instant.
  const scheduleSpinSound = (
    startRotationDeg: number,
    endRotationDeg: number,
    sliceDeg: number
  ) => {
    const ctx = ensureAudio();
    if (!ctx) return;

    const totalDeg = endRotationDeg - startRotationDeg;
    const firstK = Math.ceil(startRotationDeg / sliceDeg + 1e-6);
    const lastK = Math.floor(endRotationDeg / sliceDeg);
    const baseTime = ctx.currentTime + 0.015;

    for (let k = firstK; k <= lastK; k++) {
      const progress = (k * sliceDeg - startRotationDeg) / totalDeg;
      const t = timeForProgress(progress);
      const when = baseTime + t * SPIN_TRANSITION_SEC;
      // Softer as the wheel slows down near the end (t closer to 1).
      const volume = 0.32 - 0.16 * t;
      playClick(ctx, when, Math.max(volume, 0.08));
    }

    playLanding(ctx, baseTime + SPIN_TRANSITION_SEC);
  };

  // Load persisted options after mount (avoids SSR/localStorage mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setOptions(parsed);
        }
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  const persist = (next: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota/private-mode errors
    }
  };

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 4;
    ctx.clearRect(0, 0, size, size);

    const n = options.length;
    if (n === 0) return;
    const slice = (2 * Math.PI) / n;

    for (let i = 0; i < n; i++) {
      const start = i * slice - Math.PI / 2;
      const end = start + slice;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();

      const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
      grad.addColorStop(0, "rgba(255,255,255,0.18)");
      grad.addColorStop(1, "rgba(0,0,0,0.08)");
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      const fontSize = Math.max(13, Math.min(22, 220 / n));
      ctx.font = `700 ${fontSize}px -apple-system,Segoe UI,Roboto,sans-serif`;
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 4;
      let label = options[i];
      const maxLen = 18;
      if (label.length > maxLen) label = label.slice(0, maxLen - 1) + "…";
      ctx.fillText(label, r - 18, 0);
      ctx.restore();
    }
  };

  useEffect(() => {
    drawWheel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const addOption = () => {
    const val = inputValue.trim();
    if (!val) return;
    if (options.length >= 24) {
      setInputValue("");
      return;
    }
    const next = [...options, val];
    setOptions(next);
    persist(next);
    setInputValue("");
  };

  const removeOption = (index: number) => {
    const next = options.filter((_, i) => i !== index);
    setOptions(next);
    persist(next);
  };

  const resetOptions = () => {
    setOptions(DEFAULTS);
    persist(DEFAULTS);
  };

  const deleteAllOptions = () => {
    setOptions([]);
    persist([]);
  };

  const spin = () => {
    if (spinning || options.length < 2) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSpinning(true);

    const n = options.length;
    const slice = 360 / n;
    const winnerIndex = Math.floor(Math.random() * n);
    const winnerCenterAngle = winnerIndex * slice + slice / 2;
    const jitter = (Math.random() - 0.5) * (slice * 0.6);
    const targetMod = (360 - winnerCenterAngle - jitter + 360) % 360;

    const extraTurns = 6 + Math.floor(Math.random() * 3);
    const currentMod = ((rotationRef.current % 360) + 360) % 360;
    const delta = (targetMod - currentMod + 360) % 360;
    const startRotation = rotationRef.current;
    const newRotation = startRotation + extraTurns * 360 + delta;

    rotationRef.current = newRotation;
    canvas.style.transform = `rotate(${newRotation}deg)`;
    scheduleSpinSound(startRotation, newRotation, slice);

    window.setTimeout(() => {
      setSpinning(false);
      setResult(optionsRef.current[winnerIndex]);
    }, SPIN_DURATION_MS);
  };

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>Spin the Wheel</h1>
      <p className={styles.subtitle}>Add your options and let fate decide.</p>

      <div className={styles.wheelWrap}>
        <svg
          className={styles.pointer}
          viewBox="0 0 44 52"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22 52 L2 14 A22 22 0 0 1 42 14 Z"
            fill="#ffffff"
            stroke="#00000022"
            strokeWidth="1"
          />
        </svg>
        <div className={styles.wheelRing} />
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={600}
          height={600}
        />
        <button
          className={styles.hub}
          onClick={spin}
          disabled={spinning || options.length < 2}
        >
          {spinning ? "…" : "SPIN"}
        </button>
      </div>

      <div className={styles.panel}>
        <div className={styles.addRow}>
          <input
            type="text"
            maxLength={30}
            placeholder="Add an option…"
            autoComplete="off"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addOption();
              }
            }}
          />
          <button aria-label="Add option" onClick={addOption}>
            +
          </button>
        </div>

        <div className={styles.optionsList}>
          {options.map((opt, i) => (
            <div className={styles.chip} key={`${opt}-${i}`}>
              <div
                className={styles.swatch}
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span>{opt}</span>
              <button
                aria-label={`Remove ${opt}`}
                onClick={() => removeOption(i)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className={styles.actionsRow}>
          <span className={styles.hint}>
            {options.length} {options.length === 1 ? "option" : "options"}
            {options.length < 2 ? " — add at least 2 to spin" : ""}
          </span>
          <div className={styles.actionButtons}>
            <button
              className={styles.resetBtn}
              onClick={deleteAllOptions}
              disabled={options.length === 0}
            >
              Delete all
            </button>
            <button className={styles.resetBtn} onClick={resetOptions}>
              Reset to defaults
            </button>
          </div>
        </div>
      </div>

      <Link className={styles.crosslink} href="/8ball/">
        🎱 Need a second opinion? Try the Magic 8 Ball!
      </Link>

      {result !== null && (
        <div
          className={styles.resultOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setResult(null);
          }}
        >
          <div className={styles.resultCard}>
            <p className={styles.resultLabel}>The wheel has spoken</p>
            <p className={styles.resultText}>{result}</p>
            <button onClick={() => setResult(null)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
