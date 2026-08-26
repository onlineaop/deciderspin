"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./DiceRoller.module.css";

// Pip layout per face value, drawn as real dots in a 3x3 grid instead of
// relying on the Unicode dice-face glyphs (⚀-⚅) — those render as a solid
// black square with white dots baked into the glyph itself in most fonts,
// which looked like a black square sitting inside the white die.
const PIP_LAYOUTS: Record<number, string[]> = {
  1: ["c"],
  2: ["tl", "br"],
  3: ["tl", "c", "br"],
  4: ["tl", "tr", "bl", "br"],
  5: ["tl", "tr", "c", "bl", "br"],
  6: ["tl", "tr", "ml", "mr", "bl", "br"],
};
const MAX_DICE = 4;
const ROLL_DURATION_MS = 700;
const STAGGER_MS = 90;
const COUNT_KEY = "deciderspin_dice_count";

function randomFace(): number {
  return 1 + Math.floor(Math.random() * 6);
}

export default function DiceRoller() {
  const [diceCount, setDiceCount] = useState(2);
  const [values, setValues] = useState<number[]>([3, 5]);
  const [rolling, setRolling] = useState(false);

  const diceRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Load persisted dice count after mount (avoids SSR/localStorage mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(COUNT_KEY);
      if (raw) {
        const n = parseInt(raw, 10);
        if (n >= 1 && n <= MAX_DICE) {
          setDiceCount(n);
          setValues(Array.from({ length: n }, randomFace));
        }
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  const changeDiceCount = (n: number) => {
    if (rolling) return;
    setDiceCount(n);
    setValues((prev) => {
      const next = prev.slice(0, n);
      while (next.length < n) next.push(randomFace());
      return next;
    });
    try {
      localStorage.setItem(COUNT_KEY, String(n));
    } catch {
      // ignore quota/private-mode errors
    }
  };

  const roll = () => {
    if (rolling) return;
    setRolling(true);

    const newValues = Array.from({ length: diceCount }, randomFace);

    diceRefs.current.slice(0, diceCount).forEach((el, i) => {
      if (!el) return;
      el.classList.remove(styles.rolling);
      // Force a reflow so re-adding the class restarts the animation.
      void el.offsetWidth;
      el.style.animationDelay = `${i * STAGGER_MS}ms`;
      el.classList.add(styles.rolling);
    });

    for (let i = 0; i < diceCount; i++) {
      window.setTimeout(
        () => {
          setValues((prev) => {
            const next = [...prev];
            next[i] = newValues[i];
            return next;
          });
        },
        ROLL_DURATION_MS * 0.55 + i * STAGGER_MS
      );
    }

    const totalDuration = ROLL_DURATION_MS + (diceCount - 1) * STAGGER_MS + 150;
    window.setTimeout(() => {
      setRolling(false);
    }, totalDuration);
  };

  const total = values.slice(0, diceCount).reduce((sum, v) => sum + v, 0);

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>Dice Roller</h1>
      <p className={styles.subtitle}>Roll up to four dice and let them decide.</p>

      <div className={styles.countRow}>
        <span className={styles.countLabel}>Dice:</span>
        <div className={styles.countButtons}>
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              className={`${styles.countBtn} ${diceCount === n ? styles.countBtnActive : ""}`}
              onClick={() => changeDiceCount(n)}
              disabled={rolling}
              aria-label={`Use ${n} ${n === 1 ? "die" : "dice"}`}
              aria-pressed={diceCount === n}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.diceTray}>
        {Array.from({ length: diceCount }, (_, i) => (
          <div
            key={i}
            ref={(el) => {
              diceRefs.current[i] = el;
            }}
            className={styles.die}
          >
            <div className={styles.pipGrid}>
              {PIP_LAYOUTS[values[i] ?? 1].map((pos) => (
                <span key={pos} className={`${styles.pip} ${styles["pip-" + pos]}`} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className={styles.total}>
        Total: <span>{total}</span>
      </p>

      <button className={styles.rollBtn} onClick={roll} disabled={rolling}>
        {rolling ? "Rolling…" : "Roll the Dice"}
      </button>
    </div>
  );
}
