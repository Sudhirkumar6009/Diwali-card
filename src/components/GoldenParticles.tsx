import React, { useMemo } from "react";

const COUNT = 10; // low count for silky 60fps on mobile

export const GoldenParticles: React.FC = () => {
  const particles = useMemo(() =>
    Array.from({ length: COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3.5 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 5,
      opacity: Math.random() * 0.4 + 0.25,
    })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: "radial-gradient(circle, #FFD700 30%, rgba(218,165,32,0) 70%)",
            opacity: p.opacity,
            animation: `float ${p.duration}s ${p.delay}s ease-in-out infinite`,
            transform: "translateZ(0)",
          }}
        />
      ))}
    </div>
  );
};
