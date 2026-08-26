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

export default function Wheel() {
  const [options, setOptions] = useState<string[]>(DEFAULTS);
  const [inputValue, setInputValue] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const optionsRef = useRef(options);
  optionsRef.current = options;

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
    const newRotation = rotationRef.current + extraTurns * 360 + delta;

    rotationRef.current = newRotation;
    canvas.style.transform = `rotate(${newRotation}deg)`;

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
            <button onClick={() => setResult(null)}>Spin Again</button>
          </div>
        </div>
      )}
    </div>
  );
}
