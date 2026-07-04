"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface PacketPrimitiveProps {
  color?: string;
  size?: number;
  className?: string;
}

export const PacketPrimitive = forwardRef<HTMLDivElement, PacketPrimitiveProps>(
  ({ color = "#FAFAFA", size = 8, className }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
        }}
        className={cn("rounded-full absolute z-30 pointer-events-none opacity-0 scale-0", className)}
      />
    );
  }
);

PacketPrimitive.displayName = "PacketPrimitive";
