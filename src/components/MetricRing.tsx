/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";

interface MetricRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function MetricRing({
  score,
  size = 120,
  strokeWidth = 10,
  className = "",
}: MetricRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  // Health color mapping
  const getColor = (s: number) => {
    if (s >= 80) return "stroke-emerald-400";
    if (s >= 60) return "stroke-idbi-green";
    if (s >= 45) return "stroke-amber-400";
    return "stroke-rose-400";
  };

  const getBgColor = (s: number) => {
    if (s >= 80) return "text-emerald-500/10";
    if (s >= 60) return "text-idbi-green/10";
    if (s >= 45) return "text-amber-500/10";
    return "text-rose-500/10";
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background track */}
        <circle
          className="stroke-slate-800"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Fill track */}
        <motion.circle
          className={`${getColor(score)}`}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      {/* Centered percentage */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold font-sans text-white tracking-tighter">
          {score}
        </span>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
          Score
        </span>
      </div>
    </div>
  );
}
