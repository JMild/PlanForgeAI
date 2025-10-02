// src/components/ProgressRing.tsx
import React from "react";

type ProgressRingProps = {
  radius: number;       // รัศมีวงกลม
  stroke: number;       // ความหนาของเส้น
  progress: number;     // % 0-100
  color: string;        // สีเส้น progress
  trackColor?: string;  // สี background เส้น
};

export default function ProgressRing({
  radius,
  stroke,
  progress,
  color,
  trackColor = "#e5e7eb",
}: ProgressRingProps) {
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="progress-ring">
      <circle
        stroke={trackColor}
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        className="progress-ring-circle"
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
}
