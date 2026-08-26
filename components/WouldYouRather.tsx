"use client";

import { useEffect, useState } from "react";
import styles from "./WouldYouRather.module.css";
import { WOULD_YOU_RATHER_QUESTIONS } from "@/lib/would-you-rather-questions";

const AFFIRMATIONS = [
  "Bold choice!",
  "Solid pick!",
  "Interesting…",
  "Respect.",
  "Now that's a decision.",
  "Living your truth.",
];

function randomIndexExcluding(length: number, exclude: number): number {
  if (length <= 1) return 0;
  let index = Math.floor(Math.random() * length);
  while (index === exclude) {
    index = Math.floor(Math.random() * length);
  }
  return index;
}

export default function WouldYouRather() {
  // Fixed index 0 on first render so the static export's server-side
  // render and the client's initial hydration render produce identical
  // HTML — Math.random() here would pick a different question on each
  // pass and cause a hydration mismatch. The real random pick happens in
  // the effect below, which only ever runs client-side, after hydration.
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<0 | 1 | null>(null);
  const [affirmation, setAffirmation] = useState("");

  useEffect(() => {
    setIndex(Math.floor(Math.random() * WOULD_YOU_RATHER_QUESTIONS.length));
  }, []);

  const [optionA, optionB] = WOULD_YOU_RATHER_QUESTIONS[index];

  const pick = (side: 0 | 1) => {
    if (picked !== null) return;
    setPicked(side);
    setAffirmation(
      AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]
    );
  };

  const next = () => {
    setIndex((prev) =>
      randomIndexExcluding(WOULD_YOU_RATHER_QUESTIONS.length, prev)
    );
    setPicked(null);
    setAffirmation("");
  };

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>Would You Rather</h1>
      <p className={styles.subtitle}>Pick a side. There are no wrong answers.</p>

      <p className={styles.prompt}>Would you rather…</p>

      <div className={styles.options}>
        <button
          className={`${styles.optionBtn} ${picked === 0 ? styles.picked : ""}`}
          onClick={() => pick(0)}
          disabled={picked !== null}
        >
          {optionA}
        </button>
        <span className={styles.orDivider}>OR</span>
        <button
          className={`${styles.optionBtn} ${picked === 1 ? styles.picked : ""}`}
          onClick={() => pick(1)}
          disabled={picked !== null}
        >
          {optionB}
        </button>
      </div>

      <p className={styles.affirmation}>{affirmation}</p>

      {picked !== null && (
        <button className={styles.nextBtn} onClick={next}>
          Next Question
        </button>
      )}
    </div>
  );
}
