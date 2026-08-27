"use client";

import { useEffect, useState } from "react";
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
const FRIEND_SCORE_KEY = "deciderspin_rps_friend_score";

type Result = "win" | "lose" | "tie";
type Mode = "friend" | "computer";
type FriendStage = "p1" | "handoff" | "p2" | "revealing" | "result";
type FriendResult = "p1" | "p2" | "tie";

interface Score {
  wins: number;
  losses: number;
  ties: number;
}

interface FriendScore {
  p1: number;
  p2: number;
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

function friendResultText(result: FriendResult): string {
  if (result === "p1") return "Player 1 wins!";
  if (result === "p2") return "Player 2 wins!";
  return "It's a tie!";
}

function friendResultDetail(p1: ChoiceId, p2: ChoiceId, result: FriendResult): string {
  if (result === "tie") {
    return `Both picked ${choiceById(p1).label.toLowerCase()}.`;
  }
  const winner = result === "p1" ? p1 : p2;
  const loser = result === "p1" ? p2 : p1;
  return `${choiceById(winner).label} beats ${choiceById(loser).label.toLowerCase()}.`;
}

export default function RockPaperScissors() {
  const [mode, setMode] = useState<Mode>("friend");

  const [score, setScore] = useState<Score>({ wins: 0, losses: 0, ties: 0 });
  const [thinking, setThinking] = useState(false);
  const [playerChoice, setPlayerChoice] = useState<ChoiceId | null>(null);
  const [computerChoice, setComputerChoice] = useState<ChoiceId | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const [friendScore, setFriendScore] = useState<FriendScore>({ p1: 0, p2: 0, ties: 0 });
  const [friendStage, setFriendStage] = useState<FriendStage>("p1");
  const [p1Choice, setP1Choice] = useState<ChoiceId | null>(null);
  const [p2Choice, setP2Choice] = useState<ChoiceId | null>(null);
  const [friendResult, setFriendResult] = useState<FriendResult | null>(null);

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
      const rawFriend = localStorage.getItem(FRIEND_SCORE_KEY);
      if (rawFriend) {
        const parsedFriend = JSON.parse(rawFriend);
        if (
          typeof parsedFriend?.p1 === "number" &&
          typeof parsedFriend?.p2 === "number" &&
          typeof parsedFriend?.ties === "number"
        ) {
          setFriendScore(parsedFriend);
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

  const persistFriendScore = (next: FriendScore) => {
    try {
      localStorage.setItem(FRIEND_SCORE_KEY, JSON.stringify(next));
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

  const switchMode = (next: Mode) => {
    setMode(next);
    // Reset any in-progress round in both modes so switching tabs never
    // leaves a stale overlay or half-finished hand-off lingering.
    setThinking(false);
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setFriendStage("p1");
    setP1Choice(null);
    setP2Choice(null);
    setFriendResult(null);
  };

  const pickP1 = (choice: ChoiceId) => {
    if (friendStage !== "p1") return;
    setP1Choice(choice);
    setFriendStage("handoff");
  };

  const readyForP2 = () => {
    setFriendStage("p2");
  };

  const pickP2 = (choice: ChoiceId) => {
    if (friendStage !== "p2" || p1Choice === null) return;
    setP2Choice(choice);
    setFriendStage("revealing");

    window.setTimeout(() => {
      const outcome: FriendResult =
        p1Choice === choice ? "tie" : BEATS[p1Choice] === choice ? "p1" : "p2";

      setFriendResult(outcome);
      setFriendStage("result");
      setFriendScore((prev) => {
        const next: FriendScore = {
          p1: prev.p1 + (outcome === "p1" ? 1 : 0),
          p2: prev.p2 + (outcome === "p2" ? 1 : 0),
          ties: prev.ties + (outcome === "tie" ? 1 : 0),
        };
        persistFriendScore(next);
        return next;
      });
    }, REVEAL_DELAY_MS);
  };

  const resetFriendScore = () => {
    const next = { p1: 0, p2: 0, ties: 0 };
    setFriendScore(next);
    persistFriendScore(next);
  };

  const playAgainFriend = () => {
    setFriendStage("p1");
    setP1Choice(null);
    setP2Choice(null);
    setFriendResult(null);
  };

  return (
    <div className={styles.app}>
      <h1 className={styles.title}>Rock Paper Scissors</h1>
      <p className={styles.subtitle}>
        {mode === "friend"
          ? "Pass the device and settle it face to face."
          : "Best two of three? Just pick one."}
      </p>

      <div className={styles.modeTabs}>
        <button
          className={`${styles.modeTab} ${mode === "friend" ? styles.modeTabActive : ""}`}
          onClick={() => switchMode("friend")}
          aria-pressed={mode === "friend"}
        >
          <span aria-hidden="true">👫</span> Play with a Friend
        </button>
        <button
          className={`${styles.modeTab} ${mode === "computer" ? styles.modeTabActive : ""}`}
          onClick={() => switchMode("computer")}
          aria-pressed={mode === "computer"}
        >
          <span aria-hidden="true">🤖</span> Play vs Computer
        </button>
      </div>

      {mode === "friend" ? (
        <>
          <div className={styles.scorebar}>
            <div className={styles.scoreRow}>
              <div className={styles.statPill}>
                <span className={styles.statValue}>{friendScore.p1}</span>
                <span className={styles.statLabel}>Player 1</span>
              </div>
              <div className={styles.statPill}>
                <span className={styles.statValue}>{friendScore.ties}</span>
                <span className={styles.statLabel}>Ties</span>
              </div>
              <div className={styles.statPill}>
                <span className={styles.statValue}>{friendScore.p2}</span>
                <span className={styles.statLabel}>Player 2</span>
              </div>
            </div>
            <button className={styles.resetScoreBtn} onClick={resetFriendScore}>
              Reset score
            </button>
          </div>

          <div className={styles.arena}>
            <div className={styles.arenaSide}>
              <div
                className={`${styles.arenaEmoji} ${friendStage === "revealing" ? styles.thinking : ""}`}
              >
                {friendStage === "result" && p1Choice ? choiceById(p1Choice).emoji : "❔"}
              </div>
              <span className={styles.arenaLabel}>Player 1</span>
            </div>
            <span className={styles.arenaVs}>VS</span>
            <div className={styles.arenaSide}>
              <div
                className={`${styles.arenaEmoji} ${friendStage === "revealing" ? styles.thinking : ""}`}
              >
                {friendStage === "result" && p2Choice ? choiceById(p2Choice).emoji : "❔"}
              </div>
              <span className={styles.arenaLabel}>Player 2</span>
            </div>
          </div>

          {friendStage === "handoff" ? (
            <div className={styles.handoff}>
              <p className={styles.handoffText}>Player 1 has locked in a move.</p>
              <p className={styles.handoffSubtext}>
                Player 1&rsquo;s pick stays hidden. Pass the device to Player 2, then continue.
              </p>
              <button className={styles.handoffBtn} onClick={readyForP2}>
                I&rsquo;m Player 2 — Let&rsquo;s Go
              </button>
            </div>
          ) : (
            <>
              <p className={styles.turnLabel}>
                {friendStage === "p1" && "Player 1: choose your move"}
                {friendStage === "p2" && "Player 2: choose your move"}
                {friendStage === "revealing" && "Revealing…"}
                {friendStage === "result" && "Round over — play again?"}
              </p>
              <div className={styles.choices}>
                {CHOICES.map((choice) => (
                  <button
                    key={choice.id}
                    className={styles.choiceBtn}
                    onClick={() => {
                      if (friendStage === "p1") pickP1(choice.id);
                      else if (friendStage === "p2") pickP2(choice.id);
                    }}
                    disabled={friendStage !== "p1" && friendStage !== "p2"}
                    aria-label={`Play ${choice.label}`}
                  >
                    <span className={styles.choiceEmoji}>{choice.emoji}</span>
                    <span className={styles.choiceLabel}>{choice.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {friendResult !== null && p1Choice !== null && p2Choice !== null && friendStage === "result" && (
            <div
              className={styles.resultOverlay}
              onClick={(e) => {
                if (e.target === e.currentTarget) playAgainFriend();
              }}
            >
              <div className={styles.resultCard}>
                <div className={styles.resultEmojis}>
                  <span>{choiceById(p1Choice).emoji}</span>
                  <span className={styles.resultVs}>VS</span>
                  <span>{choiceById(p2Choice).emoji}</span>
                </div>
                <p className={styles.resultText}>{friendResultText(friendResult)}</p>
                <p className={styles.resultDetail}>
                  {friendResultDetail(p1Choice, p2Choice, friendResult)}
                </p>
                <button onClick={playAgainFriend}>Play Again</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
