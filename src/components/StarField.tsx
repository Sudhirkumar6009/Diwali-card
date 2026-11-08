import React, { useMemo } from "react";

const STAR_COUNT = 18; // lightweight for 60fps mobile performance

export const StarField: React.FC = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 1,
        delay: Math.random() * 3,
        duration: Math.random() * 2 + 1.5,
        gold: Math.random() > 0.4,
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full animate-twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            backgroundColor: s.gold ? "#FFD700" : "#ffffff",
            opacity: s.gold ? 0.8 : 0.6,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            transform: "translateZ(0)",
          }}
        />
      ))}
    </div>
  );
};
