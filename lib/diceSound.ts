// Synthesized dice-rattle sound via the Web Audio API — no audio file to
// ship or host. Two phases, chosen after listening to several candidates:
// a short (~250ms) purely-chaotic rattle with no smooth deceleration curve
// (a smooth widening-gap pattern reads as a wheel/ratchet, not dice), then
// a handful of discrete bounces that settle into one deeper thud. Reuses a
// single AudioContext/noise buffer across rolls.

let audioCtx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextCtor) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextCtor();
  }
  if (audioCtx.state === "suspended") {
    // Safari/iOS suspend contexts until a user gesture resumes them; the
    // roll button click is that gesture, so this resolves synchronously
    // enough for the sound to still land on time.
    void audioCtx.resume();
  }
  return audioCtx;
}

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const duration = 0.05;
  const size = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buffer;
  return buffer;
}

function clack(
  ctx: AudioContext,
  time: number,
  freq: number,
  q: number,
  peak: number,
  attack: number,
  decay: number
) {
  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer(ctx);

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = q;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(peak, time + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + attack + decay);

  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(time);
  src.stop(time + attack + decay + 0.02);
}

/**
 * Plays a synthesized dice-rattle-and-settle sound. `diceCount` is accepted
 * for future tuning but the current sequence (tuned against real playback,
 * not just theory) is deliberately fixed length rather than scaled per die.
 */
export function playDiceRollSound(diceCount: number) {
  void diceCount;
  const ctx = getAudioContext();
  if (!ctx) return;

  let t = ctx.currentTime + 0.02;

  // Short, purely chaotic rattle — every gap is freshly randomized, no
  // widening/narrowing trend, so it doesn't read as a decelerating wheel.
  const rattleEnd = t + 0.26;
  while (t < rattleEnd) {
    const freq = 1600 + Math.random() * 2600;
    const q = 2.5 + Math.random() * 1.5;
    const peak = 0.22 + Math.random() * 0.22;
    const decay = 0.01 + Math.random() * 0.012;
    clack(ctx, t, freq, q, peak, 0.001, decay);
    t += 0.008 + Math.random() * 0.02;
  }

  // A few discrete bounces as the dice land, decreasing in intensity.
  const bounceGaps = [0.09, 0.15, 0.12, 0.1];
  for (let i = 0; i < bounceGaps.length; i++) {
    t += bounceGaps[i];
    const freq = 500 + Math.random() * 500;
    const peak = 0.6 - i * 0.08;
    clack(ctx, t, freq, 2.5, peak, 0.001, 0.05 + i * 0.01);
  }

  // Final, deeper settle thud.
  clack(ctx, t + 0.15, 220, 2, 0.4, 0.002, 0.12);
}
