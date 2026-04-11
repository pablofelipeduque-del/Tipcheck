"use client";
import { useMemo } from "react";

const FOOD_EMOJIS = [
  "🍕","🍣","☕","🥐","🍔","🍰","🌮","🍜","🥗","🍱",
  "🍷","🥩","🍛","🍝","🥘","🧁","🍩","🌯","🥙","🍤",
];

// Deterministic pseudo-random so values are stable across renders
function pr(i, offset) {
  return ((i * 2654 + offset * 1013) % 10000) / 10000;
}

export default function FloatingParticles({ count = 20, opacity = 1 }) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      emoji:    FOOD_EMOJIS[i % FOOD_EMOJIS.length],
      left:     `${pr(i, 0) * 94 + 1}%`,
      size:     `${0.85 + pr(i, 1) * 0.9}rem`,
      baseOp:   (0.04 + pr(i, 2) * 0.045) * opacity,
      duration: `${16 + pr(i, 3) * 22}s`,
      delay:    `-${pr(i, 4) * 24}s`,
      swayPx:   Math.round(-28 + pr(i, 5) * 56),
      rotate:   Math.round(pr(i, 6) * 360),
    }))
  , [count, opacity]);

  return (
    <>
      <style>{`
        @keyframes tcFloat {
          0%   { transform: translateY(105vh) rotate(0deg)   translateX(0px);        opacity: 0; }
          6%   { opacity: 1; }
          94%  { opacity: 1; }
          100% { transform: translateY(-12vh) rotate(var(--tc-rot)) translateX(var(--tc-sway)); opacity: 0; }
        }
      `}</style>
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {particles.map((p, i) => (
          <span key={i} style={{
            position: "absolute",
            left: p.left,
            bottom: "-8%",
            fontSize: p.size,
            opacity: p.baseOp,
            "--tc-sway": `${p.swayPx}px`,
            "--tc-rot":  `${p.rotate}deg`,
            animation: `tcFloat ${p.duration} linear ${p.delay} infinite`,
            userSelect: "none",
            display: "block",
          }}>{p.emoji}</span>
        ))}
      </div>
    </>
  );
}
