"use client";

import { modules } from "@/data/modules";
import ModuleCard from "@/components/cards/ModuleCard";
import { Layers } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col justify-start bg-[#0D0D0D]">
      
      {/* Hero Section (Clean full-width layout, badge and CTA buttons removed) */}
      <section className="text-left mb-12 p-8 rounded-[12px] border border-[#2A2A2A] bg-[#111111] relative overflow-hidden select-none">
        <div className="max-w-2xl font-sans">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#FAFAFA] tracking-tight leading-tight mb-4">
            Visualize Docker. <br className="hidden sm:inline" />
            Before Running Commands.
          </h2>
          
          <p className="text-xs text-[#A1A1AA] font-normal leading-relaxed">
            An interactive educational visualizer that builds robust mental models of containers, images, filesystems, volumes, networks, and compose. Explore every concept through live interactive animations.
          </p>
        </div>
      </section>

      {/* Grid title */}
      <div id="pathways" className="mb-6 scroll-mt-24 select-none font-sans">
        <h3 className="text-sm font-extrabold text-[#FAFAFA] tracking-wider uppercase flex items-center gap-2 font-mono">
          <Layers className="w-4 h-4 text-[#A1A1AA]" />
          Interactive Learning Pathways
        </h3>
        <p className="text-xs text-[#71717A] font-normal mt-1 leading-normal">
          Click on any module below to open its sandbox visualizer and complete the challenges.
        </p>
      </div>

      {/* Modules Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <ModuleCard key={module.slug} module={module} />
        ))}
      </section>

    </div>
  );
}
