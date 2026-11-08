import React from "react";

interface DiyaProps {
  size?: number;
  glowColor?: string;
  className?: string;
  interactive?: boolean;
}

export const Diya: React.FC<DiyaProps> = ({
  size = 100,
  glowColor = "#FFD700",
  className = "",
  interactive = false,
}) => {
  const [glowing, setGlowing] = React.useState(false);

  return (
    <svg
      width={size}
      height={size * 1.1}
      viewBox="0 0 100 110"
      className={`${className} ${interactive ? "cursor-pointer select-none" : ""}`}
      onClick={() => interactive && setGlowing((g) => !g)}
      style={
        glowing
          ? { filter: `drop-shadow(0 0 24px ${glowColor}) drop-shadow(0 0 48px ${glowColor})` }
          : { filter: `drop-shadow(0 0 10px ${glowColor}88)` }
      }
    >
      {/* Diya base */}
      <ellipse cx="50" cy="88" rx="30" ry="7" fill="#8B4513" opacity="0.35" />
      <path
        d="M16 70 Q50 80 84 70 Q80 90 50 94 Q20 90 16 70 Z"
        fill="url(#diyaBase)"
      />
      <path
        d="M20 68 Q50 76 80 68 Q76 86 50 90 Q24 86 20 68 Z"
        fill="url(#diyaInner)"
      />
      {/* Wick */}
      <ellipse cx="50" cy="67" rx="24" ry="6" fill="#DAA520" opacity="0.9" />
      <rect x="47" y="42" width="6" height="26" rx="3" fill="#CD853F" />
      {/* Flame outer */}
      <ellipse
        cx="50"
        cy="40"
        rx="9"
        ry="15"
        fill="url(#flameOuter)"
        className="animate-flicker"
        style={{ transformOrigin: "50% 55%" }}
      />
      {/* Flame mid */}
      <ellipse
        cx="50"
        cy="36"
        rx="6"
        ry="11"
        fill="url(#flameMid)"
        className="animate-flicker"
        style={{ animationDelay: ".15s", transformOrigin: "50% 55%" }}
      />
      {/* Flame core */}
      <ellipse
        cx="50"
        cy="32"
        rx="3.5"
        ry="7"
        fill="url(#flameCore)"
        className="animate-flicker"
        style={{ animationDelay: ".3s", transformOrigin: "50% 55%" }}
      />
      {/* Flame tip */}
      <ellipse cx="50" cy="27" rx="1.8" ry="4" fill="white" opacity="0.85" />

      <defs>
        <linearGradient id="diyaBase" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CD7F32" />
          <stop offset="100%" stopColor="#8B4513" />
        </linearGradient>
        <linearGradient id="diyaInner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="40%" stopColor="#DAA520" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <radialGradient id="flameOuter" cx="50%" cy="70%" r="50%">
          <stop offset="0%" stopColor="#FF8C00" />
          <stop offset="60%" stopColor="#FF4500" />
          <stop offset="100%" stopColor="#8B0000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="flameMid" cx="50%" cy="65%" r="50%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="70%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#FF4500" stopOpacity="0.2" />
        </radialGradient>
        <radialGradient id="flameCore" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="white" />
          <stop offset="50%" stopColor="#FFFF88" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0.5" />
        </radialGradient>
      </defs>
    </svg>
  );
};
