"use client";

import React from "react";

/**
 * ScoreGauge
 * -----------
 * A circular progress ring for the VIS Score that pulses gently like a
 * heartbeat — a subtle glowing "tun-tun" so the panel feels alive
 * instead of static. Pure SVG + CSS, no chart library needed.
 */
export default function ScoreGauge({
  score,
  size = 168,
}: {
  score: number;
  size?: number;
}) {
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score));
  const offset = circumference - (progress / 100) * circumference;

  const color =
    progress >= 70 ? "#10b981" : progress >= 40 ? "#f59e0b" : "#ef4444";
  const glow =
    progress >= 70
      ? "rgba(16,185,129,0.45)"
      : progress >= 40
      ? "rgba(245,158,11,0.45)"
      : "rgba(239,68,68,0.45)";

  return (
    <div
      className="relative inline-flex items-center justify-center rounded-full animate-heartbeat-glow"
      style={
        {
          width: size,
          height: size,
          "--glow-color": glow,
        } as React.CSSProperties
      }
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90 animate-heartbeat-scale"
        style={{ transformOrigin: "50% 50%" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-slate-900 leading-none">
          {progress}
        </span>
        <span className="text-xs text-slate-400 mt-1">/100</span>
      </div>
    </div>
  );
}
