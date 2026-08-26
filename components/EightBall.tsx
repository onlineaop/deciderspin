"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./EightBall.module.css";

const ANSWERS = [
  "It is certain",
  "It is decidedly so",
  "Without a doubt",
  "Yes, definitely",
  "You may rely on it",
  "As I see it, yes",
  "Most likely",
  "Outlook good",
  "Yes",
  "Signs point to yes",
  "Reply hazy, try again",
  "Ask again later",
  "Better not tell you now",
  "Cannot predict now",
  "Concentrate and ask again",
  "Don't count on it",
  "My reply is no",
  "My sources say no",
  "Outlook not so good",
  "Very doubtful",
];

const SHAKE_THRESHOLD = 16;

type DeviceMotionEventWithPermission = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

export default function EightBall() {
  const [question, setQuestion] = useState("");
  const [shaking, setShaking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [flip, setFlip] = useState(false);
  const [hint, setHint] = useState("Tap the ball for your answer");
  const [needsShakePermission, setNeedsShakePermission] = useState(false);

  const busyRef = useRef(busy);
  busyRef.current = busy;
  const lastMotion = useRef<{ x: number; y: number; z: number } | null>(null);
  const lastMotionTime = useRef(0);

  const reveal = () => {
    if (busyRef.current) return;
    setBusy(true);
    setShaking(true);
    setHint("Shaking…");

    window.setTimeout(() => {
      const next = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
      setAnswer(next);
      setFlip(false);
      // Force a reflow-equivalent restart of the flip animation.
      window.requestAnimationFrame(() => setFlip(true));
      setHint("Tap again to ask another question");
      setShaking(false);
      setBusy(false);
    }, 480);
  };

  useEffect(() => {
    function handleMotion(evt: DeviceMotionEvent) {
      const acc = evt.accelerationIncludingGravity || evt.acceleration;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;
      const now = Date.now();
      if (now - lastMotionTime.current < 120) return;

      if (lastMotion.current) {
        const dx = Math.abs(acc.x - lastMotion.current.x);
        const dy = Math.abs(acc.y - lastMotion.current.y);
        const dz = Math.abs(acc.z - lastMotion.current.z);
        if (dx + dy + dz > SHAKE_THRESHOLD) {
          lastMotionTime.current = now;
          reveal();
        }
      }
      lastMotion.current = { x: acc.x, y: acc.y, z: acc.z };
    }

    const DME = window.DeviceMotionEvent as
      | DeviceMotionEventWithPermission
      | undefined;

    if (DME && typeof DME.requestPermission === "function") {
      setNeedsShakePermission(true);
      return;
    }
    if (typeof window.DeviceMotionEvent !== "undefined") {
      window.addEventListener("devicemotion", handleMotion);
      return () => window.removeEventListener("devicemotion", handleMotion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enableShake = () => {
    const DME = window.DeviceMotionEvent as
      | DeviceMotionEventWithPermission
      | undefined;
    if (!DME?.requestPermission) return;
    DME.requestPermission()
      .then((state) => {
        if (state === "granted") {
          setNeedsShakePermission(false);
        }
      })
      .catch(() => {});
  };

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>Magic 8 Ball</h1>
      <p className={styles.subtitle}>
        Ask a yes-or-no question, then tap or shake.
      </p>

      <div className={styles.questionRow}>
        <input
          type="text"
          maxLength={120}
          placeholder="Type your question… (optional)"
          autoComplete="off"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              reveal();
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
      </div>

      <div className={styles.ballStage}>
        <div
          className={`${styles.ball} ${shaking ? styles.shaking : ""}`}
          onClick={reveal}
        >
          <div className={styles.ballHighlight} />
          <div className={styles.window}>
            <div className={`${styles.die} ${flip ? styles.flip : ""}`}>
              <div
                className={`${styles.dieFace} ${styles.idleFace} ${
                  answer !== null ? styles.hide : ""
                }`}
              >
                <span className={styles.eight}>8</span>
              </div>
              <div
                className={`${styles.dieFace} ${styles.answerFace} ${
                  answer !== null ? styles.show : ""
                }`}
              >
                {answer}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className={styles.tapHint}>{hint}</p>

      <div className={styles.btnRow}>
        <button className={styles.primaryBtn} onClick={reveal} disabled={busy}>
          Ask the Ball
        </button>
        {needsShakePermission && (
          <button className={styles.shakeEnableBtn} onClick={enableShake}>
            Enable Shake
          </button>
        )}
      </div>
    </div>
  );
}
