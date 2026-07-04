"use client";

import React, { forwardRef } from "react";
import { Laptop, Server, Database, Network, Box, RefreshCw, Terminal, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NodePrimitiveProps {
  label: string;
  type?: "laptop" | "server" | "database" | "network" | "container" | "registry" | "terminal" | "default";
  status?: "running" | "healthy" | "crashed" | "idle" | "booting";
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  subtitle?: string;
}

export const NodePrimitive = forwardRef<HTMLDivElement, NodePrimitiveProps>(
  ({ label, type = "default", status = "idle", icon, children, className, subtitle }, ref) => {
    // Determine icon component based on type
    const renderIcon = () => {
      if (icon) return icon;
      switch (type) {
        case "laptop":
          return <Laptop className="w-4 h-4" />;
        case "server":
          return <Server className="w-4 h-4" />;
        case "database":
          return <Database className="w-4 h-4" />;
        case "network":
          return <Network className="w-4 h-4" />;
        case "container":
          return <Box className="w-4 h-4" />;
        case "terminal":
          return <Terminal className="w-4 h-4" />;
        default:
          return <Box className="w-4 h-4" />;
      }
    };

    const statusStyles = {
      healthy: "bg-[#111111] text-[#FAFAFA] border border-[#2A2A2A] border-l-4 border-l-[#FAFAFA]",
      running: "bg-[#111111] text-[#FAFAFA] border border-[#2A2A2A] border-l-4 border-l-[#FAFAFA]",
      crashed: "bg-[#111111] text-[#FAFAFA] border border-[#2A2A2A] border-l-4 border-l-[#EF4444]",
      booting: "bg-[#111111] text-[#FAFAFA] border border-[#2A2A2A] border-l-4 border-l-zinc-500",
      idle: "bg-[#111111] text-[#A1A1AA] border border-[#2A2A2A]",
    };

    const badgeStyles = {
      healthy: "bg-white/10 text-white border border-white/20",
      running: "bg-white/10 text-white border border-white/20",
      crashed: "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20",
      booting: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 animate-pulse",
      idle: "bg-[#171717] text-[#71717A] border border-transparent",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "p-4 rounded-[12px] bg-[#111111] shadow-sm flex flex-col gap-2.5 hover:border-[#3A3A3A] hover:bg-[#151515] hover:scale-[1.01] transition-all duration-[160ms] select-text",
          statusStyles[status],
          className
        )}
      >
        {/* Node header bar */}
        <div className="flex items-center justify-between gap-4 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-[6px] bg-[#171717] border border-[#232323] text-[#A1A1AA]")}>
              {renderIcon()}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#FAFAFA] truncate max-w-[150px]">
                {label}
              </span>
              {subtitle && (
                <span className="text-[9px] font-mono text-[#71717A] truncate max-w-[150px]">
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={cn(
              "text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-[6px] select-none",
              badgeStyles[status]
            )}
          >
            {status}
          </span>
        </div>

        {/* Nested Content (Logs / Terminal lines) */}
        {children && <div className="mt-1 flex flex-col gap-1 w-full">{children}</div>}
      </div>
    );
  }
);

NodePrimitive.displayName = "NodePrimitive";
