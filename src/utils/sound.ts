/* ──────────────────────────────────────────────────────────
   SYNTHESIZED DIWALI CRACKER AUDIO ENGINE (Web Audio API)
   Generates realistic patakha blast audio without external files.
   Supports 'big' (heavy booming willow/kamuro), 'small' (crisp
   peony snap), and 'medium' cracker blast variants.
────────────────────────────────────────────────────────── */

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Global unlock on first user gesture
if (typeof window !== "undefined") {
  const unlockAudio = () => {
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
  };
  window.addEventListener("pointerdown", unlockAudio, { once: true });
  window.addEventListener("touchstart", unlockAudio, { once: true });
  window.addEventListener("click", unlockAudio, { once: true });
}

export function setSoundMuted(muted: boolean) {
  isMuted = muted;
}

export function getSoundMuted(): boolean {
  return isMuted;
}

export function toggleSound(): boolean {
  isMuted = !isMuted;
  if (!isMuted) {
    getAudioContext();
  }
  return isMuted;
}

/* ── Play Authentic Cracker Blast Sound ── */
export function playCrackerBlast(variant: "big" | "small" | "medium" = "medium") {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== "running") return;

  const now = ctx.currentTime;

  /* 1. Low Thump / Sub-bass Shockwave */
  try {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = "sine";
    if (variant === "big") {
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(22, now + 0.42);
      oscGain.gain.setValueAtTime(0.85, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.48);
    } else if (variant === "small") {
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.2);
      oscGain.gain.setValueAtTime(0.45, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.28);
      oscGain.gain.setValueAtTime(0.7, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (_) {}

  /* 2. Sharp "CRACK" (High-pressure flash powder ignition snap) */
  try {
    const bufferDuration = variant === "big" ? 0.25 : variant === "small" ? 0.12 : 0.2;
    const bufferSize = Math.floor(ctx.sampleRate * bufferDuration);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    const centerFreq = variant === "big" ? 950 : variant === "small" ? 1800 : 1200;
    const qVal = variant === "big" ? 1.8 : variant === "small" ? 3.0 : 2.2;
    filter.frequency.setValueAtTime(centerFreq, now);
    filter.Q.setValueAtTime(qVal, now);

    const noiseGain = ctx.createGain();
    const noiseVol = variant === "big" ? 0.95 : variant === "small" ? 0.6 : 0.85;
    const fadeTime = variant === "big" ? 0.22 : variant === "small" ? 0.1 : 0.16;
    noiseGain.gain.setValueAtTime(noiseVol, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + fadeTime);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + bufferDuration);
  } catch (_) {}

  /* 3. Trailing Micro-Crackles ("Patakha Pop" sparks) */
  const crackleCount =
    variant === "big"
      ? Math.floor(Math.random() * 5) + 8 // 8 to 12 pops for big sparkles
      : variant === "small"
      ? Math.floor(Math.random() * 3) + 3 // 3 to 5 snappy pops for small sparkles
      : Math.floor(Math.random() * 4) + 4; // 4 to 7 pops for medium

  for (let k = 0; k < crackleCount; k++) {
    const maxDelay = variant === "big" ? 0.6 : variant === "small" ? 0.25 : 0.38;
    const delay = 0.06 + Math.random() * maxDelay;
    const popTime = now + delay;

    try {
      const popOsc = ctx.createOscillator();
      const popGain = ctx.createGain();

      popOsc.type = "triangle";
      const baseFreq = variant === "big" ? 650 : variant === "small" ? 1200 : 800;
      const startFreq = baseFreq + Math.random() * 1000;
      popOsc.frequency.setValueAtTime(startFreq, popTime);
      popOsc.frequency.exponentialRampToValueAtTime(100, popTime + 0.045);

      const popVol =
        variant === "big"
          ? 0.25 + Math.random() * 0.25
          : variant === "small"
          ? 0.12 + Math.random() * 0.14
          : 0.18 + Math.random() * 0.22;
      popGain.gain.setValueAtTime(popVol, popTime);
      popGain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.045);

      popOsc.connect(popGain);
      popGain.connect(ctx.destination);

      popOsc.start(popTime);
      popOsc.stop(popTime + 0.05);
    } catch (_) {}
  }
}
