"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { Layers, Box, Plus, RotateCcw, HelpCircle, ArrowRight, ShieldCheck } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";
import { useAnimationStore } from "@/stores/animationStore";

interface ContainerInstance {
  id: number;
  name: string;
  port: number;
}

export default function CreateContainers() {
  const [containers, setContainers] = useState<ContainerInstance[]>([]);
  const [hoveredContainerId, setHoveredContainerId] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const spawnRef = useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  const { setPlaying, setProgress } = useAnimationStore();

  useAnimationControls(timeline);

  const handleReset = useCallback(() => {
    setContainers([]);
    setHoveredContainerId(null);
    if (timeline) {
      timeline.pause().progress(0);
    }
    gsap.set(spawnRef.current, { scale: 0, opacity: 0, x: 0, y: 0 });
  }, [timeline]);

  useEffect(() => {
    const tl = gsap.timeline({
      paused: true,
      onStart: () => {
        setPlaying(true);
        setContainers([]);
      },
      onUpdate: () => {
        if (tl) setProgress(tl.progress() * 100);
      },
      onComplete: () => {
        setPlaying(false);
      }
    });

    setTimeline(tl);

    // Build automated sequential spawning timeline for 3 containers
    tl.set(spawnRef.current, { scale: 0, opacity: 0, x: 0, y: 0 })
      // Container 1
      .to(spawnRef.current, { opacity: 1, scale: 1, duration: 0.3 })
      .to(spawnRef.current, { x: 300, y: -56, duration: 1.0, ease: "power2.inOut" })
      .to(spawnRef.current, { opacity: 0, scale: 0, duration: 0.2 })
      .call(() => {
        setContainers([{ id: 1, name: "web-app-01", port: 8081 }]);
      })
      .to({}, { duration: 0.3 }) // pause

      // Container 2
      .set(spawnRef.current, { x: 0, y: 0 })
      .to(spawnRef.current, { opacity: 1, scale: 1, duration: 0.3 })
      .to(spawnRef.current, { x: 300, y: 0, duration: 1.0, ease: "power2.inOut" })
      .to(spawnRef.current, { opacity: 0, scale: 0, duration: 0.2 })
      .call(() => {
        setContainers([
          { id: 1, name: "web-app-01", port: 8081 },
          { id: 2, name: "web-app-02", port: 8082 }
        ]);
      })
      .to({}, { duration: 0.3 }) // pause

      // Container 3
      .set(spawnRef.current, { x: 0, y: 0 })
      .to(spawnRef.current, { opacity: 1, scale: 1, duration: 0.3 })
      .to(spawnRef.current, { x: 300, y: 56, duration: 1.0, ease: "power2.inOut" })
      .to(spawnRef.current, { opacity: 0, scale: 0, duration: 0.2 })
      .call(() => {
        setContainers([
          { id: 1, name: "web-app-01", port: 8081 },
          { id: 2, name: "web-app-02", port: 8082 },
          { id: 3, name: "web-app-03", port: 8083 }
        ]);
      });

    return () => {
      tl.kill();
    };
  }, [setPlaying, setProgress]);

  return (
    <VisualCanvas
      objective="Observe how multiple running container instances can be generated from a single shared read-only image blueprint."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Creating Containers from an Image
          </div>
          <p>
            An image is a static snapshot. Clicking **Run Container** spawns a running instance of that snapshot.
          </p>
          <p>
            Containers are lightweight because they do not copy the image data. They all reference the **same read-only image layers** on the disk, making instantiation near-instantaneous and footprint-free.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Sandbox Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          <div className="w-full max-w-lg flex items-center justify-between gap-6 relative min-h-[220px]">
            
            {/* Spawning capsule element (flies between left and right) */}
            <div 
              ref={spawnRef}
              className="absolute left-[20px] top-[94px] w-32 py-1.5 rounded-[8px] border border-zinc-700 bg-zinc-850 text-white font-mono text-[8px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md pointer-events-none opacity-0 scale-0 z-20"
            >
              <Box className="w-3.5 h-3.5 text-zinc-300" />
              run instance
            </div>

            {/* Static Connection vectors in background (visible on desktop) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden md:block">
              {containers.map((c) => {
                const yTarget = (c.id === 1) ? 60 : (c.id === 2) ? 116 : 172;
                const isHovered = hoveredContainerId === c.id;
                return (
                  <g key={c.id}>
                    <line 
                      x1={160} 
                      y1={116} 
                      x2={320} 
                      y2={yTarget} 
                      stroke={isHovered ? "#FAFAFA" : "#1f1f23"} 
                      strokeWidth={isHovered ? 1.5 : 1}
                      strokeDasharray={isHovered ? "0" : "4"}
                      className="transition-all duration-300"
                    />
                    {isHovered && (
                      <circle cx={160} cy={116} r="3" fill="#FAFAFA" className="animate-ping" />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Left: Immutable Image Card */}
            <div className="w-40 flex flex-col gap-2 text-center shrink-0 z-10">
              <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-zinc-550">
                Shared Template
              </span>
              <NodePrimitive
                label="app-image:v1"
                status="idle"
                icon={<Layers className="w-4 h-4 text-zinc-300" />}
                subtitle="Read-Only blueprint"
                className="py-4 rounded-[12px] bg-[#0d0d0e] border-zinc-850"
              />
            </div>

            {/* Middle Spacer with Arrow */}
            <div className="hidden md:flex flex-col items-center justify-center shrink-0 text-zinc-800 z-10 pointer-events-none select-none">
              <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-650 block mb-0.5">
                instantiate
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-750 animate-pulse" />
            </div>

            {/* Right: Containers list */}
            <div className="w-48 flex flex-col gap-3 min-h-[170px] justify-center shrink-0 z-10 relative">
              <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-zinc-550 text-center mb-1">
                Running Containers
              </span>
              {[1, 2, 3].map((slotId) => {
                const container = containers.find(c => c.id === slotId);
                return (
                  <div key={slotId} id={`container-slot-${slotId}`} className="h-[44px]">
                    {container ? (
                      <div 
                        onMouseEnter={() => setHoveredContainerId(container.id)}
                        onMouseLeave={() => setHoveredContainerId(null)}
                        className="animate-fadeIn"
                      >
                        <NodePrimitive
                          label={container.name}
                          status="running"
                          icon={<Box className="w-3.5 h-3.5 text-white" />}
                          subtitle={`IP: 172.17.0.${container.id + 1} | Port ${container.port}`}
                          className="py-1.5 px-3 rounded-[9px] border-zinc-850 bg-[#0d0d0e]/60"
                        />
                      </div>
                    ) : (
                      <div className="border border-dashed border-zinc-850 rounded-[9px] h-full flex items-center justify-center text-[7.5px] text-zinc-650 italic bg-[#0d0d0e]/15">
                        Slot {slotId} (Inactive)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Selected Details panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Sandbox Actions
            </span>
            <h4 className="text-sm font-extrabold text-white">
              {hoveredContainerId ? `web-app-0${hoveredContainerId} link` : "Instance Factory"}
            </h4>
            <p className="text-xs text-zinc-450 leading-relaxed font-normal mt-2 select-text font-sans">
              {hoveredContainerId 
                ? "This container utilizes the exact filesystem layers of the base image. It consumes zero extra disk space for the base code, allocating only a micro-thin isolated layer for runtime process updates."
                : "Spawn container process instances from the template image snapshot. Observe how each obtains its own virtual IP address and host port binding."
              }
            </p>
          </div>

          <div className="flex flex-col gap-2 flex-1 justify-center">
            <span className="text-[10px] text-zinc-550 italic text-center font-mono">
              Use the unified Play toolbar controls below to animate container process creation.
            </span>
          </div>

          {containers.length > 0 && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Simulation
            </button>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
