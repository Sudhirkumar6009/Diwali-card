import React from "react";

interface RangoliProps {
  size?: number;
  className?: string;
  spin?: boolean;
}

export const Rangoli: React.FC<RangoliProps> = ({ size = 300, className = "", spin = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 300 300"
    className={`${className} ${spin ? "animate-spin-slow" : ""}`}
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="rg1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#DAA520" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#0d1b6e" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="rg2" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#1a2f8a" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#FFD700" stopOpacity="0.3" />
      </radialGradient>
    </defs>

    {/* Outer ring petals */}
    {Array.from({ length: 16 }).map((_, i) => (
      <ellipse
        key={i}
        cx="150" cy="40"
        rx="10" ry="30"
        fill={i % 2 === 0 ? "#DAA520" : "#1a2f8a"}
        opacity={i % 2 === 0 ? 0.7 : 0.5}
        transform={`rotate(${i * 22.5} 150 150)`}
      />
    ))}

    {/* Outer geometric ring */}
    <circle cx="150" cy="150" r="120" fill="none" stroke="#DAA520" strokeWidth="1" opacity="0.5" />
    <circle cx="150" cy="150" r="110" fill="none" stroke="#FFD700" strokeWidth="0.5" opacity="0.3" />

    {/* Mid ring petals */}
    {Array.from({ length: 12 }).map((_, i) => (
      <ellipse
        key={i}
        cx="150" cy="70"
        rx="8" ry="22"
        fill={i % 2 === 0 ? "#FFD700" : "#0d1b6e"}
        opacity={i % 2 === 0 ? 0.6 : 0.5}
        transform={`rotate(${i * 30} 150 150)`}
      />
    ))}

    <circle cx="150" cy="150" r="78" fill="none" stroke="#DAA520" strokeWidth="1.5" opacity="0.4" />

    {/* Inner petals */}
    {Array.from({ length: 8 }).map((_, i) => (
      <ellipse
        key={i}
        cx="150" cy="105"
        rx="6" ry="16"
        fill="#FFD700"
        opacity="0.65"
        transform={`rotate(${i * 45} 150 150)`}
      />
    ))}

    <circle cx="150" cy="150" r="50" fill="url(#rg2)" />
    <circle cx="150" cy="150" r="38" fill="none" stroke="#FFD700" strokeWidth="1" opacity="0.5" />

    {/* Dot ring */}
    {Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const r = 90;
      return (
        <circle
          key={i}
          cx={150 + r * Math.cos(angle)}
          cy={150 + r * Math.sin(angle)}
          r="3"
          fill="#FFD700"
          opacity="0.7"
        />
      );
    })}

    {/* Inner dot ring */}
    {Array.from({ length: 8 }).map((_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const r = 56;
      return (
        <circle
          key={i}
          cx={150 + r * Math.cos(angle)}
          cy={150 + r * Math.sin(angle)}
          r="2.5"
          fill="#DAA520"
          opacity="0.6"
        />
      );
    })}

    {/* Center lotus */}
    {Array.from({ length: 6 }).map((_, i) => (
      <ellipse
        key={i}
        cx="150" cy="130"
        rx="5" ry="12"
        fill="#FFD700"
        opacity="0.8"
        transform={`rotate(${i * 60} 150 150)`}
      />
    ))}
    <circle cx="150" cy="150" r="14" fill="url(#rg1)" />
    <circle cx="150" cy="150" r="8" fill="#FFD700" opacity="0.9" />
  </svg>
);
