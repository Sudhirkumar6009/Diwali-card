import React, { useEffect, useRef } from "react";
import { playCrackerBlast } from "../utils/sound";

/* ──────────────────────────────────────────────────────────
   TYPES & PALETTES
────────────────────────────────────────────────────────── */
interface CrackerSpark {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  decay: number;
  gravity: number;
  drag: number;
  isCrackle: boolean;
  age: number;
  popAt?: number;
}

interface CrackerRocket {
  x: number;
  y: number;
  targetY: number;
  vx: number;
  vy: number;
  color: string;
  sparkColor: string;
  exploded: boolean;
  dead: boolean;
  trailTimer: number;
}

interface CrackerPalette {
  name: string;
  head: string;
  trail: string;
  burst: string[];
}

const CRACKER_PALETTES: CrackerPalette[] = [
  {
    name: "Golden Zari",
    head: "#FFF9C4",
    trail: "#FFB300",
    burst: ["#FFF9C4", "#FFD700", "#FFB300", "#FF8F00", "#FFFFFF"],
  },
  {
    name: "Saffron Royal",
    head: "#FFE082",
    trail: "#FF6D00",
    burst: ["#FFD54F", "#FF9100", "#FF5722", "#FFA726", "#FFFFFF"],
  },
  {
    name: "Ruby Crimson",
    head: "#FF8A80",
    trail: "#D50000",
    burst: ["#FF5252", "#FF1744", "#FF8A80", "#FFD700", "#FFFFFF"],
  },
  {
    name: "Emerald Patakha",
    head: "#B9F6CA",
    trail: "#00C853",
    burst: ["#69F0AE", "#00E676", "#00C853", "#FFF59D", "#FFFFFF"],
  },
  {
    name: "Magnesium Diamond",
    head: "#FFFFFF",
    trail: "#80D8FF",
    burst: ["#FFFFFF", "#E0F7FA", "#B2EBF2", "#FFECB3", "#FFFFFF"],
  },
];

const rnd = (min: number, max: number) => Math.random() * (max - min) + min;
const rndI = (min: number, max: number) => Math.floor(rnd(min, max + 1));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const Fireworks: React.FC<{ trigger?: number }> = ({ trigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const sparks = useRef<CrackerSpark[]>([]);
  const activeRocket = useRef<CrackerRocket | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // High performance DPR scaling (max 2 to preserve mobile battery & GPU)
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    let resizeTimer: number;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    };
    window.addEventListener("resize", handleResize);

    let seed = 0;
    let running = true;
    let lastTs = 0;
    let nextRocketTime = performance.now() + 1000; // launch first rocket after 1s

    /* ── Single Skyshot Factory (Left/Right alternating flanks for max clearance) ── */
    const launchSingleRocket = () => {
      if (activeRocket.current) return; // exactly one rocket in the air at any time
      const pal = CRACKER_PALETTES[seed % CRACKER_PALETTES.length];
      seed++;

      // Alternating flanks (left 10-18% or right 82-90%)
      const fromLeft = seed % 2 === 0;
      const startX = fromLeft ? width * rnd(0.1, 0.18) : width * rnd(0.82, 0.9);
      const targetX = fromLeft ? width * rnd(0.18, 0.35) : width * rnd(0.65, 0.82);
      const targetY = height * rnd(0.12, 0.22); // High sky clearance (well above deities and greetings)

      const gravity = 0.16;
      const distY = height - targetY;
      const vy = -Math.sqrt(2 * gravity * distY) * rnd(0.97, 1.03);
      const time = Math.abs(vy) / gravity;
      const vx = (targetX - startX) / time;

      activeRocket.current = {
        x: startX,
        y: height + 6,
        targetY,
        vx,
        vy,
        color: pal.head,
        sparkColor: pal.trail,
        exploded: false,
        dead: false,
        trailTimer: 0,
      };
    };

    /* ── Crackling Burst Factory (Low count: 24-28 crisp sparks) ── */
    const explodeRocket = (rx: number, ry: number, palette: CrackerPalette) => {
      const starCount = rndI(24, 28);
      for (let i = 0; i < starCount; i++) {
        const angle = (i / starCount) * Math.PI * 2 + rnd(-0.12, 0.12);
        const speed = rnd(3.0, 5.8);
        const col = pick(palette.burst);

        sparks.current.push({
          x: rx,
          y: ry,
          prevX: rx,
          prevY: ry,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: col,
          size: rnd(1.8, 2.6),
          decay: rnd(0.02, 0.032), // crisp clean fade (0.8s - 1.2s)
          gravity: rnd(0.08, 0.13), // gentle willow droop
          drag: rnd(0.95, 0.965),   // realistic air drag
          isCrackle: Math.random() > 0.4,
          age: 0,
          popAt: rndI(14, 22),
        });
      }

      // 8 micro popping sparks
      for (let j = 0; j < 8; j++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = rnd(1.2, 3.2);
        sparks.current.push({
          x: rx + rnd(-2, 2),
          y: ry + rnd(-2, 2),
          prevX: rx,
          prevY: ry,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: "#FFFFFF",
          size: rnd(1.2, 1.8),
          decay: rnd(0.045, 0.065),
          gravity: 0.05,
          drag: 0.92,
          isCrackle: true,
          age: 0,
        });
      }
    };

    /* ── Main Animation Loop ── */
    const animate = (now: number) => {
      if (!running) return;
      if (!lastTs) lastTs = now;
      const dt = Math.min(now - lastTs, 50);
      lastTs = now;

      // Check if it's time to launch the next rocket (3.6s to 4.8s cadence)
      if (now >= nextRocketTime && !activeRocket.current) {
        launchSingleRocket();
        nextRocketTime = now + rnd(3600, 4800);
      }

      ctx.clearRect(0, 0, width, height);

      // Fast hardware-accelerated additive blending (no costly shadowBlur!)
      ctx.globalCompositeOperation = "lighter";

      /* ── 1. Update Rocket ── */
      const r = activeRocket.current;
      if (r && !r.dead) {
        r.vy += 0.16;
        r.x += r.vx;
        r.y += r.vy;

        // Rocket fizzy ember trail
        r.trailTimer += dt;
        if (r.trailTimer > 20) {
          r.trailTimer = 0;
          sparks.current.push({
            x: r.x + rnd(-1, 1),
            y: r.y + rnd(1, 3),
            prevX: r.x,
            prevY: r.y,
            vx: rnd(-0.5, 0.5),
            vy: rnd(0.8, 2.0),
            alpha: 0.85,
            color: Math.random() > 0.4 ? "#FFF9C4" : r.sparkColor,
            size: rnd(1.2, 2.0),
            decay: 0.065, // rapid fade
            gravity: 0.06,
            drag: 0.94,
            isCrackle: false,
            age: 0,
          });
        }

        // Rocket head (streak + tip)
        const angle = Math.atan2(r.vy, r.vx);
        const len = 7;

        // Outer soft glow
        ctx.strokeStyle = r.sparkColor;
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - Math.cos(angle) * len, r.y - Math.sin(angle) * len);
        ctx.stroke();

        // Inner bright core
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - Math.cos(angle) * (len * 0.7), r.y - Math.sin(angle) * (len * 0.7));
        ctx.stroke();

        // Explosion trigger
        if (!r.exploded && (r.y <= r.targetY || r.vy >= -0.5)) {
          r.exploded = true;
          r.dead = true;
          activeRocket.current = null;
          playCrackerBlast();
          const pal = CRACKER_PALETTES[(seed - 1) % CRACKER_PALETTES.length];
          explodeRocket(r.x, r.y, pal);
        }
      }

      /* ── 2. Update Sparks ── */
      sparks.current = sparks.current.filter((p) => p.alpha > 0.02);

      for (let i = 0; i < sparks.current.length; i++) {
        const p = sparks.current[i];
        p.age++;
        p.prevX = p.x;
        p.prevY = p.y;

        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        // Crackle micro-pop
        if (p.popAt && p.age === p.popAt) {
          p.color = "#FFFFFF";
          p.size = Math.min(p.size * 1.5, 3.2);
          p.isCrackle = true;
        }

        if (p.alpha <= 0) continue;

        let a = p.alpha;
        if (p.isCrackle) {
          a = a * (0.6 + 0.4 * Math.sin(p.age * 2.2));
        }

        // Outer glow pass
        ctx.globalAlpha = a * 0.45;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 2.0;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.prevX, p.prevY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // Inner hot core pass
        ctx.globalAlpha = a;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = p.size * 0.75;
        ctx.beginPath();
        ctx.moveTo(p.prevX, p.prevY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      // Reset composite operation
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    // Pause animation when tab or screen is hidden to conserve mobile battery
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        lastTs = performance.now();
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearTimeout(resizeTimer);
      sparks.current = [];
      activeRocket.current = null;
    };
  }, []);

  // On-demand celebration launch if user clicks
  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    activeRocket.current = null; // force launch immediately
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
};
