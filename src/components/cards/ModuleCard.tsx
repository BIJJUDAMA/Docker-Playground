"use client";

import Link from "next/link";
import { Module } from "@/data/modules";
import * as Icons from "lucide-react";
import { ChevronRight } from "lucide-react";

interface ModuleCardProps {
  module: Module;
}

export default function ModuleCard({ module }: ModuleCardProps) {
  // Dynamic Lucide icon lookup with safe casting
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[module.icon] || Icons.HelpCircle;

  return (
    <Link 
      href={`/modules/${module.slug}`}
      className="group relative flex flex-col justify-between p-6 rounded-[12px] border border-[#2A2A2A] bg-[#111111] hover:border-[#3A3A3A] hover:bg-[#151515] hover:scale-[1.01] transition-all duration-[160ms] overflow-hidden select-none"
    >
      <div>
        {/* Top bar: Module index */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <span className="text-[10px] font-bold text-[#71717A] tracking-widest uppercase font-mono">
            Module 0{module.id}
          </span>
          <span className="text-[#52525B] text-[9px] font-bold font-mono border border-[#232323] px-2 py-0.5 rounded-[8px] bg-[#171717]">
            Playground
          </span>
        </div>

        {/* Icon & Title */}
        <div className="flex items-center gap-3.5 mb-3 relative z-10">
          <div className="p-2.5 rounded-[8px] bg-[#171717] border border-[#2A2A2A] text-[#A1A1AA] transition-all duration-150">
            <IconComponent className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-[#FAFAFA] tracking-tight group-hover:text-white transition-colors">
            {module.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs text-[#A1A1AA] font-normal leading-relaxed mb-6 line-clamp-2 relative z-10 font-sans">
          {module.description}
        </p>
      </div>

      {/* Footer link trigger */}
      <div className="flex items-center justify-between border-t border-[#232323] pt-4 mt-auto relative z-10">
        <span className="text-[10px] text-[#71717A] font-medium font-mono">
          {module.visualizationCount} interactive simulations
        </span>
        
        <span className="text-xs text-[#FAFAFA] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform duration-150">
          Start Exploring
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
