"use client";

import { useEffect, useState } from "react";
import styles from "./TeamPicker.module.css";

const DEFAULT_NAMES: string[] = [];
const NAMES_KEY = "deciderspin_team_names";
const TEAM_COUNT_KEY = "deciderspin_team_count";
const MAX_TEAMS = 6;
const MAX_NAMES = 60;

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function TeamPicker() {
  const [names, setNames] = useState<string[]>(DEFAULT_NAMES);
  const [inputValue, setInputValue] = useState("");
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const rawNames = localStorage.getItem(NAMES_KEY);
      if (rawNames) {
        const parsed = JSON.parse(rawNames);
        if (Array.isArray(parsed)) setNames(parsed);
      }
      const rawCount = localStorage.getItem(TEAM_COUNT_KEY);
      if (rawCount) {
        const n = parseInt(rawCount, 10);
        if (n >= 2 && n <= MAX_TEAMS) setTeamCount(n);
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  const persistNames = (next: string[]) => {
    try {
      localStorage.setItem(NAMES_KEY, JSON.stringify(next));
    } catch {
      // ignore quota/private-mode errors
    }
  };

  const addName = () => {
    const val = inputValue.trim();
    if (!val) return;
    if (names.length >= MAX_NAMES) {
      setError(`You've reached the ${MAX_NAMES}-name limit.`);
      setInputValue("");
      return;
    }
    const next = [...names, val];
    setNames(next);
    persistNames(next);
    setInputValue("");
    setError(null);
    setTeams(null);
  };

  const removeName = (index: number) => {
    const next = names.filter((_, i) => i !== index);
    setNames(next);
    persistNames(next);
    setError(null);
    setTeams(null);
  };

  const deleteAllNames = () => {
    setNames([]);
    persistNames([]);
    setError(null);
    setTeams(null);
  };

  const changeTeamCount = (n: number) => {
    setTeamCount(n);
    try {
      localStorage.setItem(TEAM_COUNT_KEY, String(n));
    } catch {
      // ignore quota/private-mode errors
    }
    setTeams(null);
  };

  const splitTeams = () => {
    if (names.length < teamCount) {
      setError(
        `Add at least ${teamCount} names to split into ${teamCount} teams.`
      );
      return;
    }
    setError(null);
    const shuffledNames = shuffled(names);
    const result: string[][] = Array.from({ length: teamCount }, () => []);
    shuffledNames.forEach((name, i) => {
      result[i % teamCount].push(name);
    });
    setTeams(result);
  };

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>Team Picker</h1>
      <p className={styles.subtitle}>
        Add names, pick a number of teams, and split them up fairly.
      </p>

      <div className={styles.panel}>
        <div className={styles.addRow}>
          <input
            type="text"
            maxLength={30}
            placeholder="Add a name…"
            autoComplete="off"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addName();
              }
            }}
          />
          <button aria-label="Add name" onClick={addName}>
            +
          </button>
        </div>

        <div className={styles.namesList}>
          {names.map((name, i) => (
            <div className={styles.chip} key={`${name}-${i}`}>
              <span>{name}</span>
              <button
                aria-label={`Remove ${name}`}
                onClick={() => removeName(i)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className={styles.actionsRow}>
          <span className={styles.hint}>
            {names.length} {names.length === 1 ? "name" : "names"}
          </span>
          <button
            className={styles.resetBtn}
            onClick={deleteAllNames}
            disabled={names.length === 0}
          >
            Delete all
          </button>
        </div>
      </div>

      <div className={styles.teamCountRow}>
        <span className={styles.teamCountLabel}>Teams:</span>
        <div className={styles.teamCountButtons}>
          {[2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              className={`${styles.countBtn} ${teamCount === n ? styles.countBtnActive : ""}`}
              onClick={() => changeTeamCount(n)}
              aria-label={`${n} teams`}
              aria-pressed={teamCount === n}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.splitBtn} onClick={splitTeams}>
        {teams ? "Shuffle Again" : "Split into Teams"}
      </button>

      {teams && (
        <div className={styles.teamsGrid}>
          {teams.map((team, i) => (
            <div className={styles.teamCard} key={i}>
              <p className={styles.teamName}>Team {i + 1}</p>
              <ul className={styles.teamMembers}>
                {team.map((name, j) => (
                  <li key={j}>{name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
