/* ──────────────────────────────────────────────────────────
   SYNTHESIZED DIWALI CRACKER AUDIO ENGINE (Web Audio API)
   Generates a realistic patakha blast (shockwave thump +
   sharp ignition crack + sparkling micro-pops) without
   needing external audio files.
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
export function playCrackerBlast() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== "running") return;

  const now = ctx.currentTime;

  /* 1. Low Thump / Sub-bass Shockwave */
  try {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.28);

    oscGain.gain.setValueAtTime(0.7, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (_) {}

  /* 2. Sharp "CRACK" (High-pressure flash powder ignition snap) */
  try {
    const bufferSize = Math.floor(ctx.sampleRate * 0.2);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(2.2, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.85, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.2);
  } catch (_) {}

  /* 3. Trailing Micro-Crackles ("Patakha Pop" sparks) */
  const crackleCount = Math.floor(Math.random() * 4) + 4; // 4 to 7 pops
  for (let k = 0; k < crackleCount; k++) {
    const delay = 0.08 + Math.random() * 0.38; // 80ms to 460ms after blast
    const popTime = now + delay;

    try {
      const popOsc = ctx.createOscillator();
      const popGain = ctx.createGain();

      popOsc.type = "triangle";
      const startFreq = 800 + Math.random() * 1200;
      popOsc.frequency.setValueAtTime(startFreq, popTime);
      popOsc.frequency.exponentialRampToValueAtTime(120, popTime + 0.04);

      const popVol = 0.18 + Math.random() * 0.22;
      popGain.gain.setValueAtTime(popVol, popTime);
      popGain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.04);

      popOsc.connect(popGain);
      popGain.connect(ctx.destination);

      popOsc.start(popTime);
      popOsc.stop(popTime + 0.05);
    } catch (_) {}
  }
}
