"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { PacketPrimitive } from "@/components/primitives/PacketPrimitive";

interface BuildStage {
  id: string;
  name: string;
  subtitle: string;
  desc: string;
}

const BUILD_STAGES: BuildStage[] = [
  { id: "from", name: "FROM", subtitle: "Base Layer Spec", desc: "Downloads and verifies the starting base OS image layer (e.g. node:18-alpine) from Docker Hub cache registries." },
  { id: "workdir", name: "WORKDIR", subtitle: "Working Directory Config", desc: "Creates the build folder path and hooks up standard subsystem execution namespaces." },
  { id: "env", name: "ENV", subtitle: "Environment Variables Config", desc: "Appends target key-value environment pairs to configuration structures for process access." },
  { id: "run", name: "RUN", subtitle: "Execution Layer Spec", desc: "Triggers package installers, compiling dependencies, and writes changes down to new image filesystem stack segments." },
  { id: "copy", name: "COPY", subtitle: "Copying Source Code", desc: "Reads host workspace folders, importing code, assets, and dependencies inside compilation limits." },
  { id: "cmd", name: "CMD", subtitle: "Runtime Command Definition", desc: "Registers default process boot commands inside configuration schemas. No layers are added here." }
];

export default function BuildTimeline() {
  const [activeStageId, setActiveStageId] = useState<string>("from");
  const [animationState, setAnimationState] = useState<"idle" | "running" | "complete">("idle");

  const containerRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  useAnimationControls(timeline);

  const handleReset = useCallback(() => {
    setAnimationState("idle");
    setActiveStageId("from");
    if (timeline) {
      timeline.pause().progress(0);
    }
    gsap.set(packetRef.current, { x: 0, opacity: 0, scale: 0 });
  }, [timeline]);

  useEffect(() => {
    handleReset();

    const tl = gsap.timeline({
      paused: true,
      onStart: () => setAnimationState("running"),
      onComplete: () => setAnimationState("complete")
    });

    setTimeline(tl);

    tl.to(packetRef.current, { opacity: 1, scale: 1, duration: 0.2 })
      // FROM -> WORKDIR
      .to(packetRef.current, {
        x: 100,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => setActiveStageId("workdir")
      })
      // WORKDIR -> ENV
      .to(packetRef.current, {
        x: 200,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => setActiveStageId("env")
      })
      // ENV -> RUN
      .to(packetRef.current, {
        x: 300,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => setActiveStageId("run")
      })
      // RUN -> COPY
      .to(packetRef.current, {
        x: 400,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => setActiveStageId("copy")
      })
      // COPY -> CMD
      .to(packetRef.current, {
        x: 500,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => setActiveStageId("cmd")
      })
      // Commit complete
      .to(packetRef.current, {
        scale: 1.5,
        opacity: 0,
        duration: 0.3
      });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <VisualCanvas
      objective="Trace how the Docker Engine processes Dockerfile commands step-by-step to compile a final image stack."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            What is the image build timeline?
          </div>
          <p>
            When you run `docker build`, the engine spawns a temporary execution container for each instruction. The command is run, filesystem changes are tracked, and a new read-only image layer is committed to the cache stack.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Horizontal flow track layout (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-x-auto custom-scrollbar">
          
          <div className="w-[600px] h-32 relative flex items-center justify-between py-2 px-6">
            {/* Pathway wire */}
            <div className="absolute top-[41px] left-[50px] right-[50px] h-0.5 border-t border-dashed border-zinc-850 pointer-events-none z-0" />

            {/* Glowing packet */}
            <PacketPrimitive
              ref={packetRef}
              color="#FAFAFA"
              size={10}
              className="top-[36px] left-[45px]"
            />

            {BUILD_STAGES.map((stage, idx) => {
              const isActive = activeStageId === stage.id;
              
              return (
                <div key={stage.id} className="w-20 relative z-10 flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full border flex items-center justify-center font-bold text-[10px] font-mono transition-all duration-300",
                    isActive 
                      ? "bg-zinc-800 border-zinc-700 text-white scale-105" 
                      : "bg-[#0d0d0e] border-zinc-850 text-zinc-550"
                  )}>
                    {idx + 1}
                  </div>
                  
                  <span className={cn(
                    "text-[8px] font-mono font-bold uppercase tracking-wider mt-2.5 text-center",
                    isActive ? "text-zinc-300" : "text-zinc-550"
                  )}>
                    {stage.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected timeline step inspector (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              {BUILD_STAGES.find((s) => s.id === activeStageId)?.subtitle}
            </span>
            <h4 className="text-base font-extrabold text-white">
              {BUILD_STAGES.find((s) => s.id === activeStageId)?.name} Instruction
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-3 select-text">
              {BUILD_STAGES.find((s) => s.id === activeStageId)?.desc}
            </p>
          </div>

          <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/20 text-[9.5px] text-zinc-450 leading-relaxed flex-1 select-text mt-auto">
            <span className="font-bold block mb-0.5 text-zinc-200">Timeline Commit:</span>
            Each step outputs a new layer ID. If the build completes successfully, the final layer hashes are tagged with the active repository tag reference.
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
