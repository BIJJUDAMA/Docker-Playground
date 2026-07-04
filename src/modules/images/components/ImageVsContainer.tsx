"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { Layers, Box, Plus, RefreshCw, HelpCircle, AlertCircle } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";

interface ContainerInstance {
  id: number;
  name: string;
  port: number;
}

export default function ImageVsContainer() {
  const [containers, setContainers] = useState<ContainerInstance[]>([]);
  const [isSpawning, setIsSpawning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const spawnRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  useAnimationControls(timeline);

  const handleReset = useCallback(() => {
    setContainers([]);
    setIsSpawning(false);
    if (timeline) {
      timeline.pause().progress(0);
    }
    gsap.set(spawnRef.current, { scale: 0, opacity: 0, x: 0, y: 0 });
  }, [timeline]);

  const handleSpawn = () => {
    if (containers.length >= 3 || isSpawning) return;

    setIsSpawning(true);

    const nextId = containers.length + 1;
    const nextName = `nginx-web-${nextId}`;
    const nextPort = 8080 + nextId;

    const tl = gsap.timeline({
      onComplete: () => {
        setContainers((prev) => [...prev, { id: nextId, name: nextName, port: nextPort }]);
        setIsSpawning(false);
        gsap.set(spawnRef.current, { scale: 0, opacity: 0, x: 0, y: 0 });
      }
    });

    setTimeline(tl);

    // Coordinate transitions from Image block (left) to Container list (right)
    gsap.set(spawnRef.current, { x: 0, y: 0, scale: 0.8, opacity: 0, backgroundColor: "#FAFAFA" });

    tl.to(spawnRef.current, {
      opacity: 1,
      scale: 1.05,
      duration: 0.3
    })
    .to(spawnRef.current, {
      x: 230,
      y: (nextId - 2) * 50, // adjust y coordinates depending on stack index
      scale: 0.95,
      duration: 1.0,
      ease: "power2.inOut"
    });
  };

  return (
    <VisualCanvas
      objective="Understand the blueprint-to-instance relationship by instantiating multiple isolated containers from a single base image."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            What is the image-to-container relationship?
          </div>
          <p>
            An **Image** is a passive, immutable (read-only) template files stack. A **Container** is an active, writeable process instance running on the host OS. 
          </p>
          <p>
            You can spawn any number of isolated container instances from a single base image. They share the underlying image layers read-only, maintaining completely separate writable states.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Sandbox Canvas (Left) */}
        <div className="flex-1 flex items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px]">
          
          {/* Spawning animation overlay box */}
          <div 
            ref={spawnRef}
            className="absolute left-[105px] w-40 py-2.5 rounded-[12px] border border-zinc-700 bg-[#0d0d0e] text-white font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-md pointer-events-none opacity-0 scale-0 z-20"
          >
            <Box className="w-4 h-4 text-zinc-305" />
            Spawning Container...
          </div>

          <div className="w-full max-w-lg flex items-center justify-between gap-12 relative z-10">
            {/* Immutable Image Blueprint (Left) */}
            <div className="w-44 flex flex-col gap-1.5 text-center">
              <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-zinc-550 mb-1">
                Base Template
              </span>
              <NodePrimitive
                label="Nginx Image"
                status="idle"
                icon={<Layers className="w-4 h-4 text-zinc-300" />}
                subtitle="Immutable Blueprint"
                className="py-4 rounded-[12px]"
              />
            </div>

            {/* Connection Arrow */}
            <div className="hidden md:flex flex-col items-center justify-center text-zinc-800 pointer-events-none">
              <span className="text-[8px] font-bold font-mono uppercase tracking-widest text-zinc-650 block mb-1">
                docker run
              </span>
              <Plus className="w-5 h-5 text-zinc-700 animate-pulse" />
            </div>

            {/* Active Container Instances stack (Right) */}
            <div ref={listRef} className="w-48 flex flex-col gap-3 min-h-[160px] justify-center">
              <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-zinc-555 text-center block mb-1">
                Active Instances
              </span>

              {containers.length > 0 ? (
                containers.map((c) => (
                  <div key={c.id} className="animate-fadeIn">
                    <NodePrimitive
                      label={c.name}
                      status="running"
                      icon={<Box className="w-4 h-4 text-zinc-300" />}
                      subtitle={`Port ${c.port} -> 80`}
                      className="py-1.5 px-3 rounded-[12px]"
                    />
                  </div>
                ))
              ) : (
                <div className="border border-dashed border-zinc-850 rounded-[12px] p-6 text-center text-[9px] text-zinc-650 italic bg-[#0d0d0e] flex flex-col items-center justify-center gap-1.5">
                  <Box className="w-4 h-4 text-zinc-700" />
                  <span>No instances active</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Layer Pull logs (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Sandbox Actions
            </span>
            <h4 className="text-sm font-extrabold text-white">Instance Instantiation</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text">
              Run multiple containers from the same image. Observe how each obtains a custom sub-port routing block.
            </p>
          </div>

          <button
            onClick={handleSpawn}
            disabled={containers.length >= 3 || isSpawning}
            className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all border-0 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4 text-black" />
            docker run (Spawn Container)
          </button>

          {/* Warnings context */}
          <div className="p-3.5 rounded-[12px] border border-zinc-800/25 bg-[#0d0d0e] text-left flex items-start gap-2 flex-1 select-text">
            <AlertCircle className="w-4 h-4 text-zinc-450 shrink-0 mt-0.5" />
            <div className="text-[9px] text-zinc-450 leading-relaxed font-normal">
              {containers.length >= 3 
                ? "Maximum demo containers limit reached. All three instances query the exact same 52.8MB read-only alpine layer files in memory simultaneously without duplication."
                : "Each container obtains namespaces boundaries isolation, a custom hostname, and separate virtual ports mapping to the host system interface."
              }
            </div>
          </div>

          {containers.length > 0 && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Simulation
            </button>
          )}
        </div>
      </div>
    </VisualCanvas>
  );
}
