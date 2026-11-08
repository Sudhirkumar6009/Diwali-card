import React, { useEffect, useRef } from "react";

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  type: "spark" | "glitter" | "trail" | "ring";
  life: number;        // 0–1 progress (increases each frame)
  decay: number;       // how fast alpha fades
  gravity: number;
}

interface Rocket {
  x: number;         // current x
  y: number;         // current y
  targetY: number;   // height at which it explodes
  vx: number;
  vy: number;        // upward velocity (negative)
  color: string;     // primary hue
  trailColor: string;
  exploded: boolean;
  dead: boolean;
  trailTimer: number; // counter for emitting trail particles
  launchDelay: number; // ms before this rocket launches
  launchTimer: number; // counts up
}

/* ─────────────────────────────────────────
   PALETTE  — 10 vivid Diwali palettes
───────────────────────────────────────── */
const PALETTES: [string, string, string[]][] = [
  // [primary, trail, burst-colors]
  ["#FFD700", "#FF8C00", ["#FFD700","#FFF0A0","#FFAB40","#FF8C00","#ffffff"]],
  ["#FF4500", "#FF6347", ["#FF4500","#FF6347","#FF8C00","#FFF0A0","#FFAB40"]],
  ["#E040FB", "#7B1FA2", ["#E040FB","#F48FB1","#CE93D8","#ffffff","#FFD700"]],
  ["#00E5FF", "#0288D1", ["#00E5FF","#80DEEA","#4DD0E1","#ffffff","#E0F7FA"]],
  ["#76FF03", "#33691E", ["#76FF03","#CCFF90","#B2FF59","#ffffff","#FFD700"]],
  ["#FF1744", "#B71C1C", ["#FF1744","#FF8A80","#FF6D00","#FFD740","#ffffff"]],
  ["#FFEA00", "#F9A825", ["#FFEA00","#FFF176","#FFD600","#FF8F00","#ffffff"]],
  ["#F50057", "#880E4F", ["#F50057","#FF80AB","#EA80FC","#FFD740","#ffffff"]],
  ["#1DE9B6", "#004D40", ["#1DE9B6","#64FFDA","#00BFA5","#ffffff","#CCFF90"]],
  ["#FF6D00", "#E65100", ["#FF6D00","#FFAB40","#FFD740","#FF1744","#ffffff"]],
];

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const rnd  = (min: number, max: number) => Math.random() * (max - min) + min;
const rndI = (min: number, max: number) => Math.floor(rnd(min, max + 1));
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function makeBurst(particles: Particle[], x: number, y: number, colors: string[]) {
  const count = rndI(55, 90);

  /* ── Radial sparks ── */
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + rnd(-0.1, 0.1);
    const speed = rnd(2.5, 7.5);
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      color: pick(colors),
      size: rnd(1.5, 4),
      type: "spark",
      life: 0,
      decay: rnd(0.012, 0.022),
      gravity: rnd(0.06, 0.12),
    });
  }

  /* ── Glitter pops — tiny bright dots ── */
  const glitterCount = rndI(20, 35);
  for (let i = 0; i < glitterCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = rnd(0.5, 3.5);
    particles.push({
      x: x + rnd(-8, 8),
      y: y + rnd(-8, 8),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      color: "#ffffff",
      size: rnd(1, 2.5),
      type: "glitter",
      life: 0,
      decay: rnd(0.025, 0.045),
      gravity: rnd(0.02, 0.06),
    });
  }

  /* ── Expanding ring ── */
  for (let i = 0; i < 3; i++) {
    particles.push({
      x, y,
      vx: 0, vy: 0,
      alpha: 0.7,
      color: pick(colors),
      size: 4 + i * 6,       // ring radius — grows via "life"
      type: "ring",
      life: 0,
      decay: 0.04,
      gravity: 0,
    });
  }
}

function makeRocket(canvasW: number, canvasH: number, delay: number, seed: number): Rocket {
  const paletteIdx = (seed) % PALETTES.length;
  const [primary, trail] = PALETTES[paletteIdx];

  /* Spread rockets across the width in zones so they don't all overlap */
  const zone = (seed % 7) / 7;
  const x = canvasW * (0.08 + zone * 0.84);

  /* Vary explosion height — upper 20–55 % of card */
  const targetY = canvasH * rnd(0.08, 0.42);

  /* Slight horizontal drift */
  const vx = rnd(-0.6, 0.6);

  /* Upward speed — tuned so it reaches targetY in a natural arc */
  const dist = canvasH - targetY;
  const vy = -Math.sqrt(2 * 0.18 * dist) * rnd(0.88, 1.12); // gravity = 0.18

  return {
    x, y: canvasH + 10,
    targetY,
    vx, vy,
    color: primary,
    trailColor: trail,
    exploded: false,
    dead: false,
    trailTimer: 0,
    launchDelay: delay,
    launchTimer: 0,
  };
}

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export const Fireworks: React.FC<{ trigger?: number }> = ({ trigger }) => {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef<number>(0);
  const particles   = useRef<Particle[]>([]);
  const rockets     = useRef<Rocket[]>([]);
  const frameRef    = useRef<number>(0);  // frame counter for determinism

  /* ── Infinite loop: continuously spawn new rockets ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    let seed = 0;
    let running = true;

    /* ── Scheduler: queue bursts of 5–10 rockets every ~3 s ── */
    let nextWaveMs = 0;      // ms timestamp for next wave
    let elapsedMs  = 0;      // accumulated ms

    const spawnWave = (now: number) => {
      const count = rndI(5, 10);
      const w = canvas.width;
      const h = canvas.height;
      /* Shuffle palette order per wave so colors feel fresh */
      const paletteOrder = Array.from({ length: PALETTES.length }, (_, i) => i)
        .sort(() => Math.random() - 0.5);

      for (let i = 0; i < count; i++) {
        const delay = i * rnd(220, 540);   // ms stagger within the wave
        rockets.current.push(makeRocket(w, h, delay, paletteOrder[i % paletteOrder.length]));
        seed++;
      }
      nextWaveMs = now + rnd(2800, 4200);  // next wave in 2.8–4.2 s
    };

    let lastTs = 0;

    const animate = (ts: number) => {
      if (!running) return;
      if (!lastTs) lastTs = ts;
      const dt = Math.min(ts - lastTs, 50);   // cap delta to avoid spiral
      lastTs = ts;
      elapsedMs += dt;
      frameRef.current++;

      /* Spawn first / subsequent waves */
      if (elapsedMs >= nextWaveMs) {
        spawnWave(elapsedMs);
      }

      /* ── Draw ── */
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* ── Update & draw rockets ── */
      rockets.current = rockets.current.filter(r => !r.dead);
      for (const r of rockets.current) {
        r.launchTimer += dt;
        if (r.launchTimer < r.launchDelay) continue; // waiting

        /* Gravity on rocket */
        r.vy += 0.18;
        r.x  += r.vx;
        r.y  += r.vy;

        /* Emit rocket trail */
        r.trailTimer += dt;
        if (r.trailTimer > 16) {
          r.trailTimer = 0;
          for (let t = 0; t < 3; t++) {
            particles.current.push({
              x: r.x + rnd(-2, 2),
              y: r.y + rnd(-2, 2),
              vx: rnd(-0.4, 0.4),
              vy: rnd(0.5, 1.8),
              alpha: rnd(0.6, 1),
              color: r.trailColor,
              size: rnd(1.5, 3.5),
              type: "trail",
              life: 0,
              decay: rnd(0.04, 0.07),
              gravity: 0.04,
            });
          }
        }

        /* Draw rocket body */
        const rocketLen = 9;
        const angle = Math.atan2(r.vy, r.vx);
        ctx.save();
        ctx.shadowBlur  = 14;
        ctx.shadowColor = r.color;

        /* Rocket cylinder */
        ctx.strokeStyle = r.color;
        ctx.lineWidth   = 4;
        ctx.lineCap     = "round";
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(
          r.x - Math.cos(angle) * rocketLen,
          r.y - Math.sin(angle) * rocketLen,
        );
        ctx.stroke();

        /* Rocket nose cone (small triangle) */
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        /* ── Explosion condition: rocket slows to near zero vy or passes targetY ── */
        if (!r.exploded && r.y <= r.targetY) {
          r.exploded = true;
          r.dead     = true;
          const pIdx = (seed % PALETTES.length);
          makeBurst(particles.current, r.x, r.y, PALETTES[pIdx][2]);
          seed++;
        }
      }

      /* ── Update & draw particles ── */
      particles.current = particles.current.filter(p => p.alpha > 0.015);

      for (const p of particles.current) {
        p.vy    += p.gravity;
        p.vx    *= 0.97;
        p.x     += p.vx;
        p.y     += p.vy;
        p.alpha -= p.decay;
        p.life  += 0.03;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);

        if (p.type === "ring") {
          /* Expanding glowing ring */
          const radius = p.size + p.life * 28;
          ctx.strokeStyle = p.color;
          ctx.lineWidth   = Math.max(0.5, 2.5 * (1 - p.life));
          ctx.shadowBlur  = 12;
          ctx.shadowColor = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.stroke();

        } else if (p.type === "glitter") {
          /* Tiny star twinkle */
          ctx.shadowBlur  = 8;
          ctx.shadowColor = "#ffffff";
          ctx.fillStyle   = p.color;
          const s = p.size * (1 + Math.sin(p.life * 20) * 0.4);
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.1, s), 0, Math.PI * 2);
          ctx.fill();

        } else if (p.type === "trail") {
          /* Fading smoke/fire trail */
          ctx.shadowBlur  = 5;
          ctx.shadowColor = p.color;
          ctx.fillStyle   = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.1, p.size * (1 - p.life * 0.5)), 0, Math.PI * 2);
          ctx.fill();

        } else {
          /* "spark" — bright elongated dot with glow */
          ctx.shadowBlur  = 10;
          ctx.shadowColor = p.color;
          ctx.fillStyle   = p.color;

          /* Draw a tiny elongated spark */
          const len = p.size * 2.5;
          const sparkAngle = Math.atan2(p.vy, p.vx);
          ctx.translate(p.x, p.y);
          ctx.rotate(sparkAngle);
          ctx.beginPath();
          ctx.ellipse(0, 0, len, Math.max(0.5, p.size * 0.5), 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      particles.current = [];
      rockets.current   = [];
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // runs once on mount — infinite

  /* ── Extra burst when user clicks "Celebrate" ── */
  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width  || canvas.offsetWidth;
    const h = canvas.height || canvas.offsetHeight;

    /* Instantly spawn 5–8 bonus rockets on click */
    const count = rndI(5, 8);
    const paletteOrder = Array.from({ length: PALETTES.length }, (_, i) => i)
      .sort(() => Math.random() - 0.5);
    for (let i = 0; i < count; i++) {
      const delay = i * rnd(80, 280);
      rockets.current.push(makeRocket(w, h, delay, paletteOrder[i % paletteOrder.length]));
    }
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
};
