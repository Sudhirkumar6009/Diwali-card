import React, { useMemo } from "react";

const STAR_COUNT = 55;

export const StarField: React.FC = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 3,
        duration: Math.random() * 2 + 1.2,
        gold: Math.random() > 0.5,
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
            background: s.gold ? "#FFD700" : "#ffffff",
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            boxShadow: s.gold ? `0 0 ${s.size * 3}px #FFD70088` : `0 0 ${s.size * 2}px #ffffff88`,
          }}
        />
      ))}
    </div>
  );
};
