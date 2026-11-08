import React, { useMemo } from "react";

const COLORS = ["#FF6B35","#FFD700","#FF8C42","#FFC107","#FF5252","#FFAB40"];
const PETAL_COUNT = 18;

export const FloatingPetals: React.FC = () => {
  const petals = useMemo(
    () =>
      Array.from({ length: PETAL_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 14 + 8,
        delay: Math.random() * 12,
        duration: Math.random() * 8 + 10,
        drift: (Math.random() - 0.5) * 120,
        spin: Math.random() * 720 - 360,
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {petals.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "-5%",
            width: p.size,
            height: p.size,
            animation: `petal-fall ${p.duration}s ${p.delay}s ease-in infinite`,
            "--drift": `${p.drift}px`,
            "--spin": `${p.spin}deg`,
          } as React.CSSProperties}
        >
          {/* Petal SVG */}
          <svg viewBox="0 0 24 24" fill={p.color} opacity={0.85}>
            <ellipse cx="12" cy="8" rx="5" ry="9" transform="rotate(0 12 12)" />
            <ellipse cx="12" cy="8" rx="5" ry="9" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="8" rx="5" ry="9" transform="rotate(120 12 12)" />
            <ellipse cx="12" cy="8" rx="5" ry="9" transform="rotate(180 12 12)" />
            <ellipse cx="12" cy="8" rx="5" ry="9" transform="rotate(240 12 12)" />
            <ellipse cx="12" cy="8" rx="5" ry="9" transform="rotate(300 12 12)" />
          </svg>
        </div>
      ))}
    </div>
  );
};
