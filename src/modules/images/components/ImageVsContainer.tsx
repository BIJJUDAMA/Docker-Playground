"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";
import { cn, formatMarkdownNode } from "@/lib/utils";
import { 
  Layers, Box, Play, Trash2, Edit3, HelpCircle, 
  ArrowRight, ShieldCheck, CheckCircle, RotateCcw,
  Cpu, Network, Activity, HardDrive, Zap, Code
} from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { useAnimationStore } from "@/stores/animationStore";
import { useAnimationControls } from "@/hooks/useAnimationControls";

interface ContainerInstance {
  id: "A" | "B" | "C";
  name: string;
  version: "v1" | "v2";
  status: "pristine" | "modified";
}

export default function ImageVsContainer() {
  const [imageVersion, setImageVersion] = useState<"v1" | "v2">("v1");
  const [instances, setInstances] = useState<Record<"A" | "B" | "C", ContainerInstance | null>>({
    A: { id: "A", name: "container-A", version: "v1", status: "pristine" },
    B: { id: "B", name: "container-B", version: "v1", status: "pristine" },
    C: null
  });

  const [isAnimating, setIsAnimating] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const imageSeedRef = useRef<HTMLDivElement>(null);
  
  // Slot Refs for spawn flight animations
  const slotRefs = {
    A: useRef<HTMLDivElement>(null),
    B: useRef<HTMLDivElement>(null),
    C: useRef<HTMLDivElement>(null)
  };

  // Flying energy dot ref
  const pulseEnergyRef = useRef<HTMLDivElement>(null);

  const { setPlaying } = useAnimationStore();
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);
  useAnimationControls(timeline);

  const handleReset = useCallback(() => {
    setImageVersion("v1");
    setInstances({
      A: { id: "A", name: "container-A", version: "v1", status: "pristine" },
      B: { id: "B", name: "container-B", version: "v1", status: "pristine" },
      C: null
    });
    setIsAnimating(false);
    if (timeline) {
      timeline.pause().progress(0);
    }
    gsap.set(pulseEnergyRef.current, { opacity: 0, scale: 0, x: 0, y: 0 });
  }, [timeline]);

  // Build node-app:v2
  const handleBuildV2 = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const tl = gsap.timeline({
      onStart: () => setPlaying(true),
      onComplete: () => {
        setPlaying(false);
        setIsAnimating(false);
        setImageVersion("v2");
      }
    });

    setTimeline(tl);

    // Pulse seed icon to represent rebuild morphing
    tl.to(imageSeedRef.current, {
      scale: 1.15,
      borderColor: "#ffffff",
      duration: 0.3,
      yoyo: true,
      repeat: 3
    });
  };

  // Spawn instance (docker run)
  const handleSpawnInstance = () => {
    if (isAnimating) return;

    // Find first empty slot
    const targetSlot = !instances.A ? "A" : !instances.B ? "B" : !instances.C ? "C" : null;
    if (!targetSlot) return;

    setIsAnimating(true);

    const tl = gsap.timeline({
      onStart: () => setPlaying(true),
      onComplete: () => {
        setPlaying(false);
        setIsAnimating(false);
        setInstances(prev => ({
          ...prev,
          [targetSlot]: {
            id: targetSlot,
            name: `container-${targetSlot}`,
            version: imageVersion,
            status: "pristine"
          }
        }));
        gsap.set(pulseEnergyRef.current, { opacity: 0, scale: 0 });
      }
    });

    setTimeline(tl);

    // Coordinate calculation: flight path from imageSeed center to targetSlot container
    const xOffset = targetSlot === "A" ? -140 : targetSlot === "B" ? 0 : 140;
    const yOffset = 180;

    gsap.set(pulseEnergyRef.current, {
      x: 0,
      y: 0,
      scale: 0.8,
      opacity: 0
    });

    tl.to(pulseEnergyRef.current, {
      opacity: 1,
      scale: 1.3,
      duration: 0.2
    })
    .to(pulseEnergyRef.current, {
      x: xOffset,
      y: yOffset,
      duration: 0.8,
      ease: "power2.inOut"
    })
    .to(pulseEnergyRef.current, {
      scale: 0.5,
      opacity: 0,
      duration: 0.15
    });
  };

  // Modify Config inside specific container slot
  const handleModifyInstance = (slotId: "A" | "B" | "C") => {
    if (!instances[slotId]) return;
    setInstances(prev => {
      const target = prev[slotId];
      if (!target) return prev;
      return {
        ...prev,
        [slotId]: { ...target, status: "modified" }
      };
    });
  };

  // Destroy Container Instance (Dissolve / Retract DNA strand)
  const handleDeleteInstance = (slotId: "A" | "B" | "C") => {
    if (isAnimating) return;
    setIsAnimating(true);

    const tl = gsap.timeline({
      onStart: () => setPlaying(true),
      onComplete: () => {
        setPlaying(false);
        setIsAnimating(false);
        setInstances(prev => ({
          ...prev,
          [slotId]: null
        }));
      }
    });

    setTimeline(tl);

    const slotEl = slotRefs[slotId].current;
    if (slotEl) {
      tl.to(slotEl, {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        ease: "power1.in"
      });
    }
  };

  return (
    <VisualCanvas
      objective="Compare the structural differences between an immutable Image Blueprint and temporary, running Container Instances."
      timeline={timeline}
      onStepBack={handleReset}
      zoomScale={0.94}
      fullscreenZoomScale={1.22}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            The Container Factory
          </div>
          <p>
            An **Image** is a master seed. Triggering `docker run` manufactures new container process instances.
          </p>
          <p>
            Each spawned container is born as an independent runtime organism containing isolated processes, network connections, and writable filesystem scopes, while the seed blueprint remains completely pristine.
          </p>
        </div>
      }
    >
      <div 
        ref={canvasRef}
        className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans relative"
      >
        
        {/* Exploratory Sandbox Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[440px] overflow-hidden">
          
          {/* Spawning flying energy node */}
          <div 
            ref={pulseEnergyRef}
            className="absolute w-4 h-4 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,1)] pointer-events-none opacity-0 scale-0 z-30"
          />

          {/* Blueprint vs Instances layout wrapper */}
          <div className="w-[480px] h-[360px] relative z-10 flex flex-col items-center justify-between py-2 shrink-0">
            
            {/* Top: The Image Repository Seed */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-550">
                Image Blueprint Seed
              </span>
              
              <div 
                ref={imageSeedRef}
                className="w-40 p-3 rounded-[16px] bg-[#16161a] border border-zinc-850 flex flex-col items-center gap-1.5 shadow-md relative transition-all duration-300"
              >
                <Layers className="w-6 h-6 text-zinc-400" />
                <span className="text-[12px] font-extrabold text-white font-mono">
                  node-app:{imageVersion}
                </span>
                <span className="text-[7.5px] uppercase tracking-wider font-sans font-bold text-zinc-550 border border-zinc-900 bg-black/40 px-1.5 py-0.5 rounded-[4px]">
                  Read-Only Blueprint
                </span>
              </div>
            </div>

            {/* Glowing origin connector lines (faint strands pulsing down to slots) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {Object.keys(instances).map((slotKey) => {
                const hasInstance = !!instances[slotKey as "A" | "B" | "C"];
                const xTarget = slotKey === "A" ? 100 : slotKey === "B" ? 240 : 380;
                
                return (
                  <path 
                    key={slotKey}
                    d={`M 240,110 C 240,170 ${xTarget},170 ${xTarget},260`}
                    fill="none"
                    stroke={hasInstance ? "#ffffff" : "#1b1b22"}
                    strokeWidth={hasInstance ? 1.5 : 1}
                    strokeDasharray={hasInstance ? "4 4" : "0"}
                    className="transition-all duration-300 opacity-60"
                  />
                );
              })}
            </svg>

            {/* Bottom Row: 3 Container Slots */}
            <div className="w-full flex justify-between gap-4 z-10">
              
              {(["A", "B", "C"] as const).map((slotId) => {
                const inst = instances[slotId];
                
                return (
                  <div 
                    key={slotId}
                    ref={slotRefs[slotId]}
                    className="flex-1 min-h-[140px] flex flex-col transition-all duration-300"
                  >
                    {inst ? (
                      <div className="flex-1 p-3.5 rounded-[16px] bg-[#0d0d0e] border border-zinc-850 flex flex-col justify-between shadow-lg relative animate-fadeIn">
                        
                        {/* Container tag header */}
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5 mb-1.5 select-none">
                          <span className="text-[10px] font-bold text-white font-mono flex items-center gap-1">
                            <Box className="w-3.5 h-3.5 text-zinc-405" />
                            {inst.name}
                          </span>
                          <span className="text-[7.5px] font-mono text-zinc-550 border border-zinc-900 bg-black/45 px-1 rounded">
                            {inst.version}
                          </span>
                        </div>

                        {/* Four modular active runtime icon pills */}
                        <div className="flex flex-col gap-1.5 my-1 font-mono text-[8px] text-zinc-500">
                          
                          {/* Cpu */}
                          <div className="flex items-center gap-1.5 select-none">
                            <Cpu className="w-3.5 h-3.5 text-zinc-450 animate-pulse" />
                            <span>PID 1 execution</span>
                          </div>

                          {/* Net */}
                          <div className="flex items-center gap-1.5 select-none">
                            <Network className="w-3.5 h-3.5 text-zinc-450 animate-pulse" />
                            <span>eth0 adapter</span>
                          </div>

                          {/* RAM */}
                          <div className="flex items-center gap-1.5 select-none">
                            <Activity className="w-3.5 h-3.5 text-zinc-450 animate-pulse" />
                            <span>cgroups RAM</span>
                          </div>

                          {/* Writable layer */}
                          <div className={cn(
                            "flex items-center gap-1.5 px-1 py-0.5 rounded transition-all duration-300 border",
                            inst.status === "modified"
                              ? "bg-white text-black border-transparent font-bold"
                              : "border-transparent text-zinc-500"
                          )}>
                            <HardDrive className="w-3.5 h-3.5 text-current" />
                            <span>
                              {inst.status === "modified" ? "Writable (Modified)" : "Writable layer"}
                            </span>
                          </div>

                        </div>

                        {/* Inline custom Action controls per card */}
                        <div className="flex gap-1.5 mt-2 border-t border-zinc-900 pt-2 select-none">
                          <button
                            onClick={() => handleModifyInstance(slotId)}
                            disabled={inst.status === "modified" || isAnimating}
                            className="flex-1 py-1 rounded bg-[#1a1a20] border border-zinc-850 hover:border-zinc-700 text-white text-[8.5px] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-0.5 transition-colors"
                            title="Modify local files"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteInstance(slotId)}
                            disabled={isAnimating}
                            className="py-1 px-1.5 rounded bg-[#1a1a20] border border-zinc-850 hover:border-red-950/60 hover:text-red-400 text-zinc-450 text-[8.5px] cursor-pointer flex items-center justify-center transition-colors"
                            title="Kill instance"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>

                      </div>
                    ) : (
                      // Empty placeholder slot
                      <div className="flex-1 border border-dashed border-zinc-850/40 rounded-[16px] bg-[#0d0d0e]/10 flex flex-col items-center justify-center p-4 text-center select-none">
                        <span className="text-[7.5px] font-mono uppercase tracking-widest text-zinc-700 font-bold block mb-1">
                          Empty Slot
                        </span>
                        <span className="text-[7px] text-zinc-750 max-w-[80px]">
                          Available to spawn replica
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

            </div>

          </div>

        </div>

        {/* Selected actions and details panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Factory Console
            </span>
            <h4 className="text-sm font-extrabold text-white">Spawning Controls</h4>
            <p className="text-xs text-zinc-405 leading-relaxed font-normal mt-2 select-text">
              Watch how Docker utilizes a single read-only seed blueprint to spawn independent running instances.
            </p>
          </div>

          <div className="flex flex-col gap-2 flex-1 justify-center select-none">
            
            {/* Spawn Instance button */}
            <button
              onClick={handleSpawnInstance}
              disabled={(!instances.A && !instances.B && !instances.C) ? false : (!!instances.A && !!instances.B && !!instances.C) || isAnimating}
              className="w-full py-2.5 rounded-[9px] text-[10px] font-bold bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-black text-black" />
              docker run (Spawn Instance)
            </button>

            {/* Build node-app:v2 */}
            <button
              onClick={handleBuildV2}
              disabled={imageVersion === "v2" || isAnimating}
              className="w-full py-2.5 rounded-[9px] text-[10px] font-bold bg-[#1a1a20] border border-zinc-850 hover:border-zinc-700 text-white disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              Build node-app:v2
            </button>

            {/* Verification Alert Info */}
            <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/20 text-[9px] text-zinc-455 leading-relaxed select-text mt-2 flex flex-col gap-1.5 font-sans">
              <ShieldCheck className="w-4 h-4 text-zinc-405 animate-pulse" />
              {imageVersion === "v2" ? (
                <span>
                  {formatMarkdownNode(`**Versioned Seed Blueprint!** Building **v2** does not magically mutate v1 containers. Replicas are immutable snapshots. New runs spawn from **v2**, demonstrating true version isolation.`)}
                </span>
              ) : (
                <span>
                  Every spawned instance obtains its own independent write layer. Deleting or modifying a replica retracts its strand, leaving the master seed blueprint untouched.
                </span>
              )}
            </div>
          </div>

          {/* Reset simulation */}
          <button
            onClick={handleReset}
            className="w-full bg-[#1a1a20] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Factory
          </button>

        </div>

      </div>
    </VisualCanvas>
  );
}
