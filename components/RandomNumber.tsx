"use client";

import { useRef, useState } from "react";
import styles from "./RandomNumber.module.css";

const SHUFFLE_INTERVAL_MS = 55;
const SHUFFLE_DURATION_MS = 550;

export default function RandomNumber() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [display, setDisplay] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);

  const intervalRef = useRef<number | null>(null);

  const generate = () => {
    if (rolling) return;

    const minN = parseInt(min, 10);
    const maxN = parseInt(max, 10);

    if (!Number.isFinite(minN) || !Number.isFinite(maxN)) {
      setError("Enter whole numbers for both min and max.");
      return;
    }
    if (minN >= maxN) {
      setError("Min must be smaller than max.");
      return;
    }

    setError(null);
    setRolling(true);

    const final = minN + Math.floor(Math.random() * (maxN - minN + 1));

    intervalRef.current = window.setInterval(() => {
      setDisplay(minN + Math.floor(Math.random() * (maxN - minN + 1)));
    }, SHUFFLE_INTERVAL_MS);

    window.setTimeout(() => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setDisplay(final);
      setRolling(false);
    }, SHUFFLE_DURATION_MS);
  };

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>Random Number</h1>
      <p className={styles.subtitle}>Pick a range and let DeciderSpin choose.</p>

      <div className={styles.rangeRow}>
        <div className={styles.field}>
          <label htmlFor="min">Min</label>
          <input
            id="min"
            type="number"
            inputMode="numeric"
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />
        </div>
        <span className={styles.rangeDash}>–</span>
        <div className={styles.field}>
          <label htmlFor="max">Max</label>
          <input
            id="max"
            type="number"
            inputMode="numeric"
            value={max}
            onChange={(e) => setMax(e.target.value)}
          />
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.display}>
        <span className={styles.displayValue}>{display ?? "?"}</span>
      </div>

      <button className={styles.generateBtn} onClick={generate} disabled={rolling}>
        {rolling ? "Picking…" : "Generate Number"}
      </button>
    </div>
  );
}
