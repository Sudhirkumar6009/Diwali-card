import React, { useEffect, useRef } from "react";
import { playCrackerBlast } from "../utils/sound";

/* ──────────────────────────────────────────────────────────
   TYPES & PALETTES
────────────────────────────────────────────────────────── */
type BurstVariant = "big" | "small" | "medium";

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

interface CrackerFlash {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface CrackerRocket {
  id: number;
  x: number;
  y: number;
  startY: number;
  targetY: number;
  vx: number;
  initialVy: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  color: string;
  sparkColor: string;
  burstType: BurstVariant;
  palette: CrackerPalette;
  exploded: boolean;
  dead: boolean;
  trailTimer: number;
  age: number;
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
  {
    name: "Purple Blossom",
    head: "#EA80FC",
    trail: "#AA00FF",
    burst: ["#E040FB", "#D500F9", "#FF80AB", "#FFD700", "#FFFFFF"],
  },
];

const rnd = (min: number, max: number) => Math.random() * (max - min) + min;
const rndI = (min: number, max: number) => Math.floor(rnd(min, max + 1));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const Fireworks: React.FC<{ trigger?: number }> = ({ trigger }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const sparks = useRef<CrackerSpark[]>([]);
  const flashes = useRef<CrackerFlash[]>([]);
  const activeRockets = useRef<CrackerRocket[]>([]);
  const rocketIdCounter = useRef<number>(0);

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
    let nextRocketTime = performance.now() + 600; // Launch first rocket after 0.6s

    /* ── Launch Single Rocket Factory (Slow Ascent + Varied Sparkles) ── */
    const createRocket = (
      customStartX?: number,
      customTargetX?: number,
      customTargetY?: number,
      forcedVariant?: BurstVariant
    ): CrackerRocket => {
      seed++;
      const pal = CRACKER_PALETTES[seed % CRACKER_PALETTES.length];

      // Alternate between big sparkles, small sparkles, and medium sparkles
      let burstType: BurstVariant;
      if (forcedVariant) {
        burstType = forcedVariant;
      } else {
        const roll = Math.random();
        if (roll < 0.42) {
          burstType = "big"; // 42% Big Sparkles
        } else if (roll < 0.78) {
          burstType = "small"; // 36% Small Sparkles
        } else {
          burstType = "medium"; // 22% Balanced Sparkles
        }
      }

      // Launch positions distributed across flanks and mid-sides
      const sideRoll = seed % 4;
      let startX: number;
      let targetX: number;

      if (customStartX !== undefined && customTargetX !== undefined) {
        startX = customStartX;
        targetX = customTargetX;
      } else if (sideRoll === 0) {
        // Far Left flank
        startX = width * rnd(0.08, 0.18);
        targetX = width * rnd(0.18, 0.35);
      } else if (sideRoll === 1) {
        // Far Right flank
        startX = width * rnd(0.82, 0.92);
        targetX = width * rnd(0.65, 0.82);
      } else if (sideRoll === 2) {
        // Center Left
        startX = width * rnd(0.24, 0.36);
        targetX = width * rnd(0.30, 0.48);
      } else {
        // Center Right
        startX = width * rnd(0.64, 0.76);
        targetX = width * rnd(0.52, 0.70);
      }

      // High sky clearance (well above deities and central text)
      const targetY = customTargetY !== undefined ? customTargetY : height * rnd(0.11, 0.23);
      const startY = height + 10;

      // Rocket goes slowly to sky: gentle initial vy between -3.8 and -4.8
      // Total ascent takes ~1.8 to 2.5 seconds of majestic gliding
      const distY = startY - targetY;
      const initialVy = rnd(-3.8, -4.8);
      const estimatedFrames = distY / Math.abs(initialVy * 0.78);
      const vx = (targetX - startX) / estimatedFrames;

      return {
        id: ++rocketIdCounter.current,
        x: startX,
        y: startY,
        startY,
        targetY,
        vx,
        initialVy,
        wobbleSpeed: rnd(0.08, 0.14),
        wobbleAmp: rnd(0.3, 0.55),
        color: pal.head,
        sparkColor: pal.trail,
        burstType,
        palette: pal,
        exploded: false,
        dead: false,
        trailTimer: 0,
        age: 0,
      };
    };

    const launchRocket = (forcedVariant?: BurstVariant) => {
      // Allow up to 3 active rockets simultaneously
      if (activeRockets.current.length >= 3) return;

      // Occasionally launch a dual salvo (two rockets from opposite sides)
      const isDual = Math.random() < 0.22 && activeRockets.current.length <= 1;

      if (isDual) {
        // Rocket 1 from left (Big Sparkles)
        activeRockets.current.push(
          createRocket(
            width * rnd(0.1, 0.2),
            width * rnd(0.22, 0.38),
            height * rnd(0.12, 0.22),
            "big"
          )
        );
        // Rocket 2 from right (Small Sparkles)
        activeRockets.current.push(
          createRocket(
            width * rnd(0.8, 0.9),
            width * rnd(0.62, 0.78),
            height * rnd(0.14, 0.24),
            "small"
          )
        );
      } else {
        activeRockets.current.push(createRocket(undefined, undefined, undefined, forcedVariant));
      }
    };

    /* ── Explosions Factory: Big Sparkles vs Small Sparkles ── */
    const explodeRocket = (
      rx: number,
      ry: number,
      palette: CrackerPalette,
      variant: BurstVariant
    ) => {
      // 1. Initial Blast Flash Flare
      const flashRadius = variant === "big" ? 42 : variant === "small" ? 20 : 30;
      flashes.current.push({
        x: rx,
        y: ry,
        radius: 6,
        maxRadius: flashRadius,
        alpha: 0.9,
        color: palette.head,
      });

      if (variant === "big") {
        /* ── BIG SPARKLES: Grand Brocade / Kamuro Golden Cascade ── */
        // 65 to 80 large glittering stars expanding far into the sky
        const starCount = rndI(65, 80);
        for (let i = 0; i < starCount; i++) {
          const angle = (i / starCount) * Math.PI * 2 + rnd(-0.08, 0.08);
          // High speed spread with low drag produces large majestic dome
          const speed = rnd(3.8, 7.4);
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
            size: rnd(3.2, 5.0), // BIG visible sparkles!
            decay: rnd(0.012, 0.02), // Slower decay (lingers 1.6s - 2.2s like golden rain)
            gravity: rnd(0.07, 0.11), // Graceful willow droop
            drag: rnd(0.965, 0.975), // Extended air glide
            isCrackle: Math.random() > 0.35,
            age: 0,
            popAt: rndI(22, 38), // Secondary delayed crackle
          });
        }

        // 16 Micro sparkling diamond flecks
        for (let j = 0; j < 16; j++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = rnd(1.5, 4.2);
          sparks.current.push({
            x: rx + rnd(-3, 3),
            y: ry + rnd(-3, 3),
            prevX: rx,
            prevY: ry,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            color: "#FFFFFF",
            size: rnd(1.6, 2.4),
            decay: rnd(0.035, 0.055),
            gravity: 0.05,
            drag: 0.94,
            isCrackle: true,
            age: 0,
          });
        }
      } else if (variant === "small") {
        /* ── SMALL SPARKLES: Snappy Peony / Chatai Pop ── */
        // 22 to 30 compact, sharp, rapid sparkling stars
        const starCount = rndI(22, 30);
        for (let i = 0; i < starCount; i++) {
          const angle = (i / starCount) * Math.PI * 2 + rnd(-0.15, 0.15);
          const speed = rnd(2.0, 4.2);
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
            size: rnd(1.0, 1.8), // SMALL compact sparkles!
            decay: rnd(0.038, 0.058), // Rapid crisp snap (0.5s - 0.7s)
            gravity: 0.06,
            drag: rnd(0.92, 0.94),
            isCrackle: Math.random() > 0.45,
            age: 0,
            popAt: rndI(10, 18),
          });
        }

        // 6 rapid pop sparks
        for (let j = 0; j < 6; j++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = rnd(1.0, 2.5);
          sparks.current.push({
            x: rx,
            y: ry,
            prevX: rx,
            prevY: ry,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            color: "#FFF9C4",
            size: rnd(0.9, 1.4),
            decay: 0.065,
            gravity: 0.04,
            drag: 0.9,
            isCrackle: true,
            age: 0,
          });
        }
      } else {
        /* ── MEDIUM SPARKLER: Balanced Festive Burst ── */
        const starCount = rndI(38, 48);
        for (let i = 0; i < starCount; i++) {
          const angle = (i / starCount) * Math.PI * 2 + rnd(-0.1, 0.1);
          const speed = rnd(2.8, 5.6);
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
            size: rnd(1.8, 3.2),
            decay: rnd(0.022, 0.034),
            gravity: rnd(0.07, 0.11),
            drag: rnd(0.95, 0.965),
            isCrackle: Math.random() > 0.4,
            age: 0,
            popAt: rndI(14, 24),
          });
        }
      }
    };

    /* ── Main Animation Loop ── */
    const animate = (now: number) => {
      if (!running) return;
      if (!lastTs) lastTs = now;
      const dt = Math.min(now - lastTs, 50);
      lastTs = now;

      // Rocket scheduler: Frequent, steady cadence (~1.6s to 2.4s)
      if (now >= nextRocketTime && activeRockets.current.length < 3) {
        launchRocket();
        nextRocketTime = now + rnd(1600, 2400);
      }

      ctx.clearRect(0, 0, width, height);

      // Fast hardware-accelerated additive blending
      ctx.globalCompositeOperation = "lighter";

      /* ── 1. Update Rockets (Slow, smooth ascent to sky + blasts) ── */
      for (let idx = activeRockets.current.length - 1; idx >= 0; idx--) {
        const r = activeRockets.current[idx];
        if (r.dead) {
          activeRockets.current.splice(idx, 1);
          continue;
        }

        r.age++;

        // Smooth ascent velocity calculation
        // Progress from bottom to target height
        const progress = Math.max(0, Math.min(1, (r.startY - r.y) / (r.startY - r.targetY)));

        // Rocket glides steadily up, gently slowing down near apogee
        const currentVy = r.initialVy * (1 - progress * 0.4);
        r.y += currentVy;

        // Subtle aerodynamic sway
        r.x += r.vx + Math.sin(r.age * r.wobbleSpeed) * r.wobbleAmp;

        // Rocket nozzle ember trail: sparks dropping downward as rocket climbs
        r.trailTimer += dt;
        if (r.trailTimer > 18) {
          r.trailTimer = 0;
          const isBig = r.burstType === "big";
          const sparkCount = isBig ? 2 : 1;

          for (let s = 0; s < sparkCount; s++) {
            sparks.current.push({
              x: r.x + rnd(-1.5, 1.5),
              y: r.y + rnd(2, 6),
              prevX: r.x,
              prevY: r.y,
              vx: rnd(-0.6, 0.6) - r.vx * 0.15,
              vy: rnd(1.2, 2.6), // downward nozzle exhaust
              alpha: 0.9,
              color: Math.random() > 0.4 ? "#FFF9C4" : r.sparkColor,
              size: isBig ? rnd(1.8, 2.6) : rnd(1.1, 1.9),
              decay: rnd(0.045, 0.075),
              gravity: 0.08,
              drag: 0.94,
              isCrackle: Math.random() > 0.7,
              age: 0,
            });
          }
        }

        // Draw Rocket Head: Outer glowing flare + luminous white tip
        const headingAngle = Math.atan2(currentVy, r.vx);
        const rocketLength = r.burstType === "big" ? 9 : 7;

        // Outer glow streak
        ctx.strokeStyle = r.sparkColor;
        ctx.lineWidth = r.burstType === "big" ? 4.5 : 3.2;
        ctx.lineCap = "round";
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(
          r.x - Math.cos(headingAngle) * rocketLength,
          r.y - Math.sin(headingAngle) * rocketLength
        );
        ctx.stroke();

        // Inner bright rocket core
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = r.burstType === "big" ? 2.2 : 1.6;
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(
          r.x - Math.cos(headingAngle) * (rocketLength * 0.7),
          r.y - Math.sin(headingAngle) * (rocketLength * 0.7)
        );
        ctx.stroke();

        // Explosion trigger: reached target altitude in the sky
        if (!r.exploded && (r.y <= r.targetY || r.y <= height * 0.09)) {
          r.exploded = true;
          r.dead = true;
          playCrackerBlast(r.burstType);
          explodeRocket(r.x, r.y, r.palette, r.burstType);
        }
      }

      /* ── 2. Update Explosion Flash Rings ── */
      for (let f = flashes.current.length - 1; f >= 0; f--) {
        const fl = flashes.current[f];
        fl.radius += (fl.maxRadius - fl.radius) * 0.35 + 1.2;
        fl.alpha *= 0.65;

        if (fl.alpha < 0.03 || fl.radius >= fl.maxRadius) {
          flashes.current.splice(f, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = fl.alpha;
        const grad = ctx.createRadialGradient(fl.x, fl.y, 0, fl.x, fl.y, fl.radius);
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(0.4, fl.color);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(fl.x, fl.y, fl.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      /* ── 3. Update Sparks (Big, Small & Medium) ── */
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
          p.size = Math.min(p.size * 1.4, 4.8);
          p.isCrackle = true;
        }

        if (p.alpha <= 0) continue;

        let a = p.alpha;
        if (p.isCrackle) {
          a = a * (0.6 + 0.4 * Math.sin(p.age * 2.2));
        }

        // Outer glow pass
        ctx.globalAlpha = Math.max(0, a * 0.5);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 2.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.prevX, p.prevY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // Inner hot core pass
        ctx.globalAlpha = Math.max(0, a);
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = p.size * 0.8;
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

    // Interactive card click/tap to shoot an on-demand rocket
    const parentCard = canvas.closest(".diwali-card");
    const onCardClick = (e: MouseEvent | TouchEvent) => {
      // Don't intercept clicks on sound button or language toggles
      const target = e.target as HTMLElement | null;
      if (target?.closest("button")) return;

      let clientX = 0;
      let clientY = 0;
      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect = canvas.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const clickY = clientY - rect.top;

      // Launch rocket towards clicked position
      const fromLeft = clickX < width * 0.5;
      const startX = fromLeft ? width * rnd(0.08, 0.22) : width * rnd(0.78, 0.92);
      const targetY = Math.max(height * 0.1, Math.min(clickY, height * 0.35));

      if (activeRockets.current.length < 3) {
        activeRockets.current.push(
          createRocket(
            startX,
            clickX,
            targetY,
            Math.random() > 0.5 ? "big" : "small"
          )
        );
      }
    };

    if (parentCard) {
      parentCard.addEventListener("click", onCardClick as EventListener);
    }

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (parentCard) {
        parentCard.removeEventListener("click", onCardClick as EventListener);
      }
      clearTimeout(resizeTimer);
      sparks.current = [];
      flashes.current = [];
      activeRockets.current = [];
    };
  }, []);

  // External trigger (if fired)
  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Launch an extra celebratory rocket
    if (activeRockets.current.length < 3) {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const pal = pick(CRACKER_PALETTES);
      activeRockets.current.push({
        id: ++rocketIdCounter.current,
        x: width * 0.5,
        y: height + 10,
        startY: height + 10,
        targetY: height * 0.16,
        vx: 0,
        initialVy: -4.5,
        wobbleSpeed: 0.1,
        wobbleAmp: 0.4,
        color: pal.head,
        sparkColor: pal.trail,
        burstType: "big",
        palette: pal,
        exploded: false,
        dead: false,
        trailTimer: 0,
        age: 0,
      });
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
