"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface EdgePrimitiveProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  dashed?: boolean;
  active?: boolean;
  className?: string;
  color?: string;
  curveType?: "straight" | "bezier" | "step";
}

export default function EdgePrimitive({
  x1,
  y1,
  x2,
  y2,
  label,
  dashed = false,
  active = false,
  className,
  color,
  curveType = "bezier",
}: EdgePrimitiveProps) {
  // Generate path coordinates
  const getPathData = () => {
    if (curveType === "straight") {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }

    if (curveType === "step") {
      const midX = x1 + (x2 - x1) / 2;
      return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
    }

    // Bezier curve calculations (default)
    const controlOffset = Math.min(100, Math.abs(x2 - x1) * 0.5);
    return `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;
  };

  const defaultColor = active ? "#FAFAFA" : "#232323";
  const strokeColor = color || defaultColor;

  // Center coordinate for label placement
  const labelX = x1 + (x2 - x1) / 2;
  const labelY = y1 + (y2 - y1) / 2;

  return (
    <g className={cn("select-none pointer-events-none", className)}>
      {/* Glow path if active */}
      {active && (
        <path
          d={getPathData()}
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          className="opacity-20 blur-sm"
        />
      )}

      {/* Main vector path */}
      <path
        d={getPathData()}
        fill="none"
        stroke={strokeColor}
        strokeWidth={active ? "2" : "1.5"}
        strokeDasharray={dashed ? "5, 5" : undefined}
        strokeLinecap="round"
        className="transition-all duration-300"
      />

      {/* Optional Label rendering in SVG workspace */}
      {label && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x={-(label.length * 3) - 6}
            y="-8"
            width={label.length * 6 + 12}
            height="16"
            rx="4"
            fill="#111111"
            className="stroke-[#2A2A2A] stroke-[1px]"
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#A1A1AA"
            className="text-[8px] font-mono font-bold"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
}
