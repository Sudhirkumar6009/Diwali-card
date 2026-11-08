import React from "react";

export const Toran: React.FC = () => (
  <div className="w-full flex items-end justify-center" style={{ height: 90 }} aria-hidden="true">
    <svg viewBox="0 0 1200 90" preserveAspectRatio="xMidYMax meet" className="w-full">
      <defs>
        <linearGradient id="toranRope" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#B8860B" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>

      {/* Rope */}
      <path
        d="M0 10 Q300 50 600 10 Q900 50 1200 10"
        fill="none"
        stroke="url(#toranRope)"
        strokeWidth="2.5"
      />

      {/* Hanging ornaments */}
      {Array.from({ length: 13 }, (_, i) => {
        const x = (i / 12) * 1200;
        const ropeY = i % 2 === 0 ? 10 : 50;
        const dropY = ropeY + 12;
        const isGold = i % 3 !== 1;
        const fill = isGold ? "#FFD700" : "#1a2f8a";
        const stroke = "#DAA520";
        return (
          <g key={i} style={{ animation: `toran-sway ${3 + (i % 3) * 0.5}s ease-in-out ${i * 0.2}s infinite`, transformOrigin: `${x}px ${ropeY}px` }}>
            {/* Hanging thread */}
            <line x1={x} y1={ropeY} x2={x} y2={dropY} stroke="#DAA520" strokeWidth="1.2" />
            {/* Mango hanging ornament */}
            <ellipse cx={x} cy={dropY + 12} rx="7" ry="11" fill={fill} stroke={stroke} strokeWidth="1" />
            {/* Leaf */}
            <ellipse cx={x - 8} cy={dropY + 5} rx="5" ry="8" fill={isGold ? "#1a6e2a" : "#2a8a2a"} opacity="0.85" transform={`rotate(-30 ${x - 8} ${dropY + 5})`} />
            <ellipse cx={x + 8} cy={dropY + 5} rx="5" ry="8" fill="#1a6e2a" opacity="0.85" transform={`rotate(30 ${x + 8} ${dropY + 5})`} />
          </g>
        );
      })}

      {/* Bells/flowers at intervals */}
      {[150, 450, 750, 1050].map((bx, i) => (
        <g key={i}>
          <circle cx={bx} cy={i % 2 === 0 ? 30 : 50} r="10" fill="#DAA520" opacity="0.6" />
          <circle cx={bx} cy={i % 2 === 0 ? 30 : 50} r="5" fill="#FFD700" />
        </g>
      ))}
    </svg>
  </div>
);
