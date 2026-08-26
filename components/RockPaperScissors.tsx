"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./RockPaperScissors.module.css";

type ChoiceId = "rock" | "paper" | "scissors";

const CHOICES: { id: ChoiceId; emoji: string; label: string }[] = [
  { id: "rock", emoji: "✊", label: "Rock" },
  { id: "paper", emoji: "✋", label: "Paper" },
  { id: "scissors", emoji: "✌️", label: "Scissors" },
];

const BEATS: Record<ChoiceId, ChoiceId> = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

const REVEAL_DELAY_MS = 700;
const SCORE_KEY = "deciderspin_rps_score";

type Result = "win" | "lose" | "tie";

interface Score {
  wins: number;
  losses: number;
  ties: number;
}

function choiceById(id: ChoiceId) {
  return CHOICES.find((c) => c.id === id)!;
}

function resultText(result: Result): string {
  if (result === "win") return "You win!";
  if (result === "lose") return "You lose!";
  return "It's a tie!";
}

function resultDetail(player: ChoiceId, computer: ChoiceId, result: Result): string {
  if (result === "tie") {
    return `Both picked ${choiceById(player).label.toLowerCase()}.`;
  }
  const winner = result === "win" ? player : computer;
  const loser = result === "win" ? computer : player;
  return `${choiceById(winner).label} beats ${choiceById(loser).label.toLowerCase()}.`;
}

export default function RockPaperScissors() {
  const [score, setScore] = useState<Score>({ wins: 0, losses: 0, ties: 0 });
  const [thinking, setThinking] = useState(false);
  const [playerChoice, setPlayerChoice] = useState<ChoiceId | null>(null);
  const [computerChoice, setComputerChoice] = useState<ChoiceId | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SCORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          typeof parsed?.wins === "number" &&
          typeof parsed?.losses === "number" &&
          typeof parsed?.ties === "number"
        ) {
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

  const play = (choice: ChoiceId) => {
    if (thinking) return;
    setThinking(true);
    setPlayerChoice(choice);
    setComputerChoice(null);
    setResult(null);

    window.setTimeout(() => {
      const computer = CHOICES[Math.floor(Math.random() * CHOICES.length)].id;
      const outcome: Result =
        choice === computer ? "tie" : BEATS[choice] === computer ? "win" : "lose";

      setComputerChoice(computer);
      setResult(outcome);
      setThinking(false);

      setScore((prev) => {
        const next: Score = {
          wins: prev.wins + (outcome === "win" ? 1 : 0),
          losses: prev.losses + (outcome === "lose" ? 1 : 0),
          ties: prev.ties + (outcome === "tie" ? 1 : 0),
        };
        persistScore(next);
        return next;
      });
    }, REVEAL_DELAY_MS);
  };

  const resetScore = () => {
    const next = { wins: 0, losses: 0, ties: 0 };
    setScore(next);
    persistScore(next);
  };

  const closeResult = () => {
    setResult(null);
    setPlayerChoice(null);
    setComputerChoice(null);
  };

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>Rock Paper Scissors</h1>
      <p className={styles.subtitle}>Best two of three? Just pick one.</p>

      <div className={styles.scorebar}>
        <div className={styles.scoreRow}>
          <div className={styles.statPill}>
            <span className={styles.statValue}>{score.wins}</span>
            <span className={styles.statLabel}>Wins</span>
          </div>
          <div className={styles.statPill}>
            <span className={styles.statValue}>{score.ties}</span>
            <span className={styles.statLabel}>Ties</span>
          </div>
          <div className={styles.statPill}>
            <span className={styles.statValue}>{score.losses}</span>
            <span className={styles.statLabel}>Losses</span>
          </div>
        </div>
        <button className={styles.resetScoreBtn} onClick={resetScore}>
          Reset score
        </button>
      </div>

      <div className={styles.arena}>
        <div className={styles.arenaSide}>
          <div
            className={`${styles.arenaEmoji} ${thinking ? styles.thinking : ""}`}
          >
            {playerChoice ? choiceById(playerChoice).emoji : "❔"}
          </div>
          <span className={styles.arenaLabel}>You</span>
        </div>
        <span className={styles.arenaVs}>VS</span>
        <div className={styles.arenaSide}>
          <div
            className={`${styles.arenaEmoji} ${thinking ? styles.thinking : ""}`}
          >
            {thinking ? "🤔" : computerChoice ? choiceById(computerChoice).emoji : "❔"}
          </div>
          <span className={styles.arenaLabel}>DeciderSpin</span>
        </div>
      </div>

      <div className={styles.choices}>
        {CHOICES.map((choice) => (
          <button
            key={choice.id}
            className={styles.choiceBtn}
            onClick={() => play(choice.id)}
            disabled={thinking}
            aria-label={`Play ${choice.label}`}
          >
            <span className={styles.choiceEmoji}>{choice.emoji}</span>
            <span className={styles.choiceLabel}>{choice.label}</span>
          </button>
        ))}
      </div>

      <Link className={styles.crosslink} href="/">
        🎡 Still can&apos;t decide? Spin the wheel for answers!
      </Link>

      {result !== null && playerChoice !== null && computerChoice !== null && (
        <div
          className={styles.resultOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeResult();
          }}
        >
          <div className={styles.resultCard}>
            <div className={styles.resultEmojis}>
              <span>{choiceById(playerChoice).emoji}</span>
              <span className={styles.resultVs}>VS</span>
              <span>{choiceById(computerChoice).emoji}</span>
            </div>
            <p className={styles.resultText}>{resultText(result)}</p>
            <p className={styles.resultDetail}>
              {resultDetail(playerChoice, computerChoice, result)}
            </p>
            <button onClick={closeResult}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
