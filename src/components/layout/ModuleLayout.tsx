"use client";

import React, { useState, useEffect } from "react";
import { Module, getNextModule, getPrevModule } from "@/data/modules";
import { cn } from "@/lib/utils";
import { GraduationCap, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useAnimationStore } from "@/stores/animationStore";

interface ModuleLayoutProps {
  module: Module;
  children: React.ReactNode;
}

export default function ModuleLayout({ module, children }: ModuleLayoutProps) {
  const prevModule = getPrevModule(module.slug);
  const nextModule = getNextModule(module.slug);
  const { activeExplanation, setNavigation } = useAnimationStore();
  const [isExplExpanded, setIsExplExpanded] = useState(true);

  // Register pagination routes globally
  useEffect(() => {
    setNavigation(prevModule?.slug || null, nextModule?.slug || null);
  }, [prevModule?.slug, nextModule?.slug, setNavigation]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0 bg-[#0D0D0D] relative z-10">
      
      {/* Left Area: Visual Playground (Main Content) - Edge-to-Edge */}
      <div className="flex-1 flex flex-col min-w-0 border-b lg:border-b-0 lg:border-r border-[#232323] h-full relative">
        <div className="flex-1 min-h-0 relative flex flex-col h-full bg-[#0D0D0D]">
          {children}
        </div>
      </div>

      {/* Right Area: Sidebar Explanations & Objectives */}
      <div className="w-full lg:w-[380px] p-6 flex flex-col justify-between gap-6 overflow-y-auto max-h-[50vh] lg:max-h-none shrink-0 bg-[#090909] border-t lg:border-t-0 border-[#232323] custom-scrollbar">
        
        <div className="flex flex-col gap-6">
          {/* Module Title Header Panel */}
          <div className="pb-4 border-b border-[#232323]">
            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block mb-1">
              Module 0{module.id}
            </span>
            <h2 className="text-xl font-extrabold text-[#FAFAFA] tracking-tight font-sans">
              {module.title}
            </h2>
          </div>

          {/* Active Explanation Panel (moved here!) */}
          {activeExplanation && (
            <div className="rounded-[12px] border border-[#2A2A2A] bg-[#111111] overflow-hidden flex flex-col shadow-sm">
              <button
                onClick={() => setIsExplExpanded(!isExplExpanded)}
                className="w-full flex items-center justify-between px-5 py-3.5 bg-[#171717]/50 text-xs font-bold text-[#FAFAFA] uppercase tracking-wider cursor-pointer hover:bg-[#171717] transition-colors"
              >
                <span className="flex items-center gap-1.5 font-mono">
                  <Info className="w-4 h-4 text-[#A1A1AA]" />
                  Explanation Guide
                </span>
                {isExplExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[#71717A]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#71717A]" />
                )}
              </button>
              {isExplExpanded && (
                <div className="p-5 border-t border-[#232323] text-xs text-[#A1A1AA] leading-relaxed font-normal select-text max-h-[220px] overflow-y-auto custom-scrollbar font-sans bg-[#111111]">
                  {activeExplanation}
                </div>
              )}
            </div>
          )}

          {/* Overview Panel */}
          <div className="p-5 rounded-[12px] border border-[#2A2A2A] bg-[#111111] shadow-sm">
            <h3 className="text-xs font-bold text-[#FAFAFA] mb-2 flex items-center gap-2 uppercase tracking-wider font-sans">
              <Info className="w-4 h-4 text-[#A1A1AA]" />
              Overview
            </h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed font-normal font-sans">
              {module.description}
            </p>
          </div>

          {/* Learning Objectives Panel */}
          <div className="p-5 rounded-[12px] border border-[#2A2A2A] bg-[#111111] shadow-sm">
            <h3 className="text-xs font-bold text-[#FAFAFA] mb-3 flex items-center gap-2 uppercase tracking-wider font-sans">
              <GraduationCap className="w-4.5 h-4.5 text-[#A1A1AA]" />
              Learning Objectives
            </h3>
            
            <ul className="space-y-3 font-sans">
              {module.learningObjectives.map((obj, i) => (
                <li key={i} className="flex gap-2.5 items-start text-xs text-[#A1A1AA] leading-relaxed">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#171717] border border-[#2A2A2A] text-[10px] font-bold text-[#FAFAFA] shrink-0 mt-0.5 font-mono">
                    {i + 1}
                  </span>
                  <span className="font-normal">{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}

