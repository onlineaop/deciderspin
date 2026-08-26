"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CoinFlip.module.css";

const FLIP_DURATION_MS = 1100;
const SCORE_KEY = "deciderspin_coin_score";

type Face = "heads" | "tails";

interface Score {
  heads: number;
  tails: number;
}

export default function CoinFlip() {
  const [score, setScore] = useState<Score>({ heads: 0, tails: 0 });
  const [flipping, setFlipping] = useState(false);
  const [displayFace, setDisplayFace] = useState<Face>("heads");
  const [result, setResult] = useState<Face | null>(null);

  const coinRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);

  // Load persisted score after mount (avoids SSR/localStorage mismatch —
  // localStorage doesn't exist during the static export's server render).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SCORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.heads === "number" && typeof parsed?.tails === "number") {
          setScore(parsed);
        }
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  const persistScore = (next: Score) => {
    try {
      localStorage.setItem(SCORE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota/private-mode errors
    }
  };

  const flip = () => {
    if (flipping) return;
    const coin = coinRef.current;
    if (!coin) return;

    setFlipping(true);
    setResult(null);

    const outcome: Face = Math.random() < 0.5 ? "heads" : "tails";
    const extraTurns = 5 + Math.floor(Math.random() * 3); // 5-7 full spins
    const currentMod = ((rotationRef.current % 360) + 360) % 360;
    const targetMod = outcome === "tails" ? 180 : 0;
    const delta = (targetMod - currentMod + 360) % 360;
    const newRotation = rotationRef.current + extraTurns * 360 + delta;

    rotationRef.current = newRotation;
    coin.style.transform = `rotateY(${newRotation}deg)`;

    // Swap the visible letter partway through — the coin is edge-on and
    // near-invisible at that point, same trick a real coin flip relies on.
    window.setTimeout(() => {
      setDisplayFace(outcome);
    }, FLIP_DURATION_MS * 0.5);

    window.setTimeout(() => {
      setFlipping(false);
      setResult(outcome);
      setScore((prev) => {
        const next: Score = {
          heads: prev.heads + (outcome === "heads" ? 1 : 0),
          tails: prev.tails + (outcome === "tails" ? 1 : 0),
        };
        persistScore(next);
        return next;
      });
    }, FLIP_DURATION_MS);
  };

  const resetScore = () => {
    const next = { heads: 0, tails: 0 };
    setScore(next);
    persistScore(next);
  };

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>Coin Flip</h1>
      <p className={styles.subtitle}>Heads or tails? Let the coin decide.</p>

      <div className={styles.scorebar}>
        <div className={styles.scoreRow}>
          <div className={styles.statPill}>
            <span className={styles.statValue}>{score.heads}</span>
            <span className={styles.statLabel}>Heads</span>
          </div>
          <div className={styles.statPill}>
            <span className={styles.statValue}>{score.tails}</span>
            <span className={styles.statLabel}>Tails</span>
          </div>
        </div>
        <button className={styles.resetScoreBtn} onClick={resetScore}>
          Reset score
        </button>
      </div>

      <div className={styles.coinStage}>
        <div
          ref={coinRef}
          className={styles.coin}
          onClick={flip}
          role="button"
          aria-label="Flip the coin"
        >
          <span className={styles.coinLetter}>
            {displayFace === "heads" ? "H" : "T"}
          </span>
        </div>
      </div>

      <button className={styles.flipBtn} onClick={flip} disabled={flipping}>
        {flipping ? "Flipping…" : "Flip the Coin"}
      </button>

      {result !== null && (
        <div
          className={styles.resultOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setResult(null);
          }}
        >
          <div className={styles.resultCard}>
            <p className={styles.resultLabel}>The coin has spoken</p>
            <p className={styles.resultText}>
              {result === "heads" ? "Heads!" : "Tails!"}
            </p>
            <button onClick={() => setResult(null)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
