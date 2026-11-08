import React, { useMemo } from "react";

const COLORS = ["#FF6B35", "#FFD700", "#FF8C42", "#FF5252"];
const PETAL_COUNT = 7; // lightweight count for smooth mobile rendering

export const FloatingPetals: React.FC = () => {
  const petals = useMemo(
    () =>
      Array.from({ length: PETAL_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 10 + 8,
        delay: Math.random() * 8,
        duration: Math.random() * 6 + 9,
        drift: (Math.random() - 0.5) * 80,
        spin: Math.random() * 360 - 180,
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
            transform: "translateZ(0)",
            "--drift": `${p.drift}px`,
            "--spin": `${p.spin}deg`,
          } as React.CSSProperties}
        >
          <svg viewBox="0 0 24 24" fill={p.color} opacity={0.75}>
            <ellipse cx="12" cy="8" rx="5" ry="9" />
            <ellipse cx="12" cy="8" rx="5" ry="9" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="8" rx="5" ry="9" transform="rotate(120 12 12)" />
          </svg>
        </div>
      ))}
    </div>
  );
};
