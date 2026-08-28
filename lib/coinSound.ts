// Plays the real coin-flip recording at /public/sounds/coin-flip.mp3 (the
// synthesized Web Audio version didn't read as a coin, per feedback — a
// real recording replaced it). A fresh Audio instance per flip so rapid
// re-flips before the previous sound finishes don't get cut off or queue.

let audio: HTMLAudioElement | null = null;

export function playCoinFlipSound() {
  if (typeof window === "undefined") return;
  try {
    const el = new Audio("/sounds/coin-flip.mp3");
    audio = el;
    void el.play().catch(() => {
      // Autoplay can be blocked before any user gesture on some browsers;
      // the flip button click is a gesture, so this should normally
      // succeed. Fail silently either way — the coin still flips.
    });
  } catch {
    // ignore
  }
}
