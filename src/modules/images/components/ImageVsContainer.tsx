"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";
import { cn, formatMarkdownNode } from "@/lib/utils";
import { 
  Play, Trash2, Edit3, RotateCcw, HelpCircle, 
  Layers, Cpu, Activity, HardDrive, ShieldAlert, Zap
} from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { useAnimationStore } from "@/stores/animationStore";
import { useAnimationControls } from "@/hooks/useAnimationControls";

interface ContainerInstance {
  id: "A" | "B" | "C";
  uid: string;
  version: "v1" | "v2";
  status: "pristine" | "modified";
  cpu: number;
  memory: number;
}

export default function ImageVsContainer() {
  const [imageVersion, setImageVersion] = useState<"v1" | "v2">("v1");
  const [buildProgress, setBuildProgress] = useState<number | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<"A" | "B" | "C" | null>(null);
  
  const [instances, setInstances] = useState<Record<"A" | "B" | "C", ContainerInstance | null>>({
    A: { id: "A", uid: "6f3a2c", version: "v1", status: "pristine", cpu: 0.8, memory: 18 },
    B: { id: "B", uid: "1ab92d", version: "v1", status: "pristine", cpu: 0.8, memory: 18 },
    C: null
  });

  const [isAnimating, setIsAnimating] = useState(false);

  // Refs for camera and animation controls
  const canvasRef = useRef<HTMLDivElement>(null);
  const cameraViewportRef = useRef<HTMLDivElement>(null);
  const crystalRef = useRef<HTMLDivElement>(null);
  const chamberRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);

  const slotRefs = {
    A: useRef<HTMLDivElement>(null),
    B: useRef<HTMLDivElement>(null),
    C: useRef<HTMLDivElement>(null)
  };

  const { setPlaying } = useAnimationStore();
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);
  useAnimationControls(timeline);

  const handleReset = useCallback(() => {
    setImageVersion("v1");
    setBuildProgress(null);
    setHoveredSlot(null);

    // Reset scales and camera viewport
    const allSlots = ["A", "B", "C"] as const;
    allSlots.forEach(s => {
      const slotEl = slotRefs[s].current;
      if (slotEl) {
        gsap.set(slotEl, { scale: 1, opacity: 1, y: 0, filter: "blur(0px)" });
      }
    });
    gsap.set(cameraViewportRef.current, { scale: 1, x: 0, y: 0 });

    setInstances({
      A: { id: "A", uid: "6f3a2c", version: "v1", status: "pristine", cpu: 0.8, memory: 18 },
      B: { id: "B", uid: "1ab92d", version: "v1", status: "pristine", cpu: 0.8, memory: 18 },
      C: null
    });
    setIsAnimating(false);
    if (timeline) {
      timeline.pause().progress(0);
    }
    gsap.set(beamRef.current, { opacity: 0, height: 0 });
  }, [timeline]);

  useEffect(() => {
    return () => {
      if (timeline) timeline.kill();
    };
  }, [timeline]);

  // Build New Version (v2) - Morph crystal with loading spinner percentage
  const handleBuildV2 = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setPlaying(true);
    setBuildProgress(0);

    const tl = gsap.timeline();
    setTimeline(tl);

    const progressObj = { value: 0 };

    // Morph rotation & color pulses
    tl.to(crystalRef.current, {
      scale: 1.25,
      filter: "drop-shadow(0 0 25px rgba(255, 255, 255, 0.8))",
      duration: 0.4,
      yoyo: true,
      repeat: 4,
      ease: "power2.inOut"
    })
    .to(progressObj, {
      value: 100,
      duration: 2.2,
      ease: "none",
      onUpdate: () => {
        setBuildProgress(Math.floor(progressObj.value));
      },
      onComplete: () => {
        setImageVersion("v2");
        setBuildProgress(null);
        setIsAnimating(false);
        setPlaying(false);
        gsap.set(crystalRef.current, { scale: 1, filter: "none" });
      }
    }, 0);
  };

  // Run -> Cast Liquid Glass Container (docker run)
  const handleSpawnInstance = () => {
    if (isAnimating) return;

    // Find first empty slot
    const targetSlot = !instances.A ? "A" : !instances.B ? "B" : !instances.C ? "C" : null;
    if (!targetSlot) return;

    setIsAnimating(true);
    setPlaying(true);

    const targetUid = Math.random().toString(16).substring(2, 8);

    // Mount container slot card immediately in raw glass state
    setInstances(prev => ({
      ...prev,
      [targetSlot]: {
        id: targetSlot,
        uid: targetUid,
        version: imageVersion,
        status: "pristine",
        cpu: 0.8,
        memory: 18
      }
    }));

    requestAnimationFrame(() => {
      const slotCard = slotRefs[targetSlot].current;
      const crystalEl = crystalRef.current;
      const beamEl = beamRef.current;
      const viewportEl = cameraViewportRef.current;

      if (!slotCard || !crystalEl || !beamEl || !viewportEl) {
        setIsAnimating(false);
        setPlaying(false);
        return;
      }

      // Hide card and prepare scale
      gsap.set(slotCard, { scale: 0.1, opacity: 0 });

      const tl = gsap.timeline({
        onComplete: () => {
          setPlaying(false);
          setIsAnimating(false);
          gsap.set(beamEl, { opacity: 0, height: 0 });
          gsap.to(viewportEl, { scale: 1, y: 0, duration: 0.6, ease: "power2.out" });
        }
      });

      setTimeline(tl);

      // Camera zooms in
      tl.to(viewportEl, {
        scale: 1.04,
        y: 10,
        duration: 0.5,
        ease: "power2.out"
      })
      // Crystal energy emission burst
      .to(crystalEl, {
        scale: 1.3,
        filter: "drop-shadow(0 0 20px rgba(96, 165, 250, 0.9))",
        duration: 0.35,
        yoyo: true,
        repeat: 1
      }, 0)
      // Energy beam shoots down through chamber
      .to(beamEl, {
        opacity: 1,
        height: 190,
        duration: 0.45,
        ease: "power2.in"
      }, 0.2)
      // Container grows like expanding liquid glass
      .to(slotCard, {
        opacity: 1,
        scale: 1,
        duration: 0.95,
        ease: "elastic.out(1.1, 0.6)"
      }, 0.55);
    });
  };

  // Modify Container local scope (Independent custom status)
  const handleModifyInstance = (slotId: "A" | "B" | "C") => {
    if (!instances[slotId] || isAnimating) return;
    setIsAnimating(true);
    setPlaying(true);

    const slotCard = slotRefs[slotId].current;
    const beamEl = beamRef.current;

    const tl = gsap.timeline({
      onComplete: () => {
        setInstances(prev => {
          const target = prev[slotId];
          if (!target) return prev;
          return {
            ...prev,
            [slotId]: { ...target, status: "modified", cpu: 1.2, memory: 24 }
          };
        });
        setIsAnimating(false);
        setPlaying(false);
        gsap.set(beamEl, { opacity: 0, height: 0 });
      }
    });

    setTimeline(tl);

    // Fast energy burst
    tl.to(beamEl, {
      opacity: 0.8,
      height: 190,
      duration: 0.3,
      ease: "power1.in"
    })
    .to(beamEl, {
      opacity: 0,
      duration: 0.1
    });

    if (slotCard) {
      tl.to(slotCard, {
        scale: 1.05,
        borderColor: "rgba(255, 255, 255, 0.6)",
        duration: 0.15,
        yoyo: true,
        repeat: 1
      }, "-=0.1");
    }
  };

  // Dissolve container instance to particles (docker rm)
  const handleDeleteInstance = (slotId: "A" | "B" | "C") => {
    if (isAnimating) return;
    setIsAnimating(true);
    setPlaying(true);

    const tl = gsap.timeline({
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

    const slotCard = slotRefs[slotId].current;
    if (slotCard) {
      // Dissolve shrink
      tl.to(slotCard, {
        scale: 0.1,
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.in"
      });
    }
  };

  // Camera zooms and blurs on hover
  const handleHoverSlot = (slotId: "A" | "B" | "C" | null) => {
    if (isAnimating) return;
    setHoveredSlot(slotId);

    const allSlots = ["A", "B", "C"] as const;
    const viewportEl = cameraViewportRef.current;

    if (slotId) {
      // Pan/Zoom camera
      const xOffset = slotId === "A" ? 25 : slotId === "C" ? -25 : 0;
      gsap.to(viewportEl, { scale: 1.03, x: xOffset, y: -5, duration: 0.5, ease: "power2.out" });

      allSlots.forEach(s => {
        const slotEl = slotRefs[s].current;
        if (slotEl) {
          if (s === slotId) {
            gsap.to(slotEl, { scale: 1.05, filter: "none", opacity: 1, duration: 0.4 });
          } else {
            gsap.to(slotEl, { scale: 0.95, filter: "blur(1.5px)", opacity: 0.3, duration: 0.4 });
          }
        }
      });
    } else {
      // Restore camera
      gsap.to(viewportEl, { scale: 1, x: 0, y: 0, duration: 0.5, ease: "power2.out" });

      allSlots.forEach(s => {
        const slotEl = slotRefs[s].current;
        if (slotEl) {
          gsap.to(slotEl, { scale: 1, filter: "none", opacity: 1, duration: 0.4 });
        }
      });
    }
  };

  return (
    <VisualCanvas
      objective="Explore the Docker Image vs Container architecture: how the master blueprint cast independent running sandboxed processes."
      timeline={timeline}
      onStepBack={handleReset}
      zoomScale={0.94}
      fullscreenZoomScale={1.22}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            The Container Foundry
          </div>
          <p>
            An **Image** is the master mold. Suspending above the chamber, it serves as the dormant, immutable seed crystal.
          </p>
          <p>
            Running `docker run` fires a casting beam through the **Foundry**, building a new **liquid glass container capsule** below. Each container is born with isolated runtime environments, while the master crystal seed remains completely untouched.
          </p>
        </div>
      }
    >
      <div 
        ref={canvasRef}
        className="w-full flex-1 flex flex-col justify-between items-center bg-[#09090b] rounded-[24px] border border-zinc-900/60 p-6 relative overflow-hidden select-none"
        style={{
          backgroundImage: "radial-gradient(circle at center, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      >
        
        {/* CSS definitions for 3D spin and laser waves */}
        <style>{`
          @keyframes spin3D {
            0% { transform: rotateY(0deg) rotateX(15deg); }
            100% { transform: rotateY(360deg) rotateX(15deg); }
          }
          .crystal-spin-3d {
            animation: spin3D 9s linear infinite;
            transform-style: preserve-3d;
            perspective: 600px;
          }
          @keyframes pulseLight {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
          }
          .foundry-indicator-light {
            animation: pulseLight 2s infinite ease-in-out;
          }
        `}</style>

        {/* Cinematic Zoomable Viewport */}
        <div 
          ref={cameraViewportRef}
          className="w-[520px] flex-1 flex flex-col items-center justify-between py-4 transition-all duration-300 relative"
        >
          
          {/* Vertical Energy Beam */}
          <div 
            ref={beamRef}
            className="absolute top-[80px] w-1.5 bg-gradient-to-b from-blue-400 via-white to-blue-600 shadow-[0_0_15px_#fff] pointer-events-none opacity-0 z-20"
            style={{ left: "260px", transform: "translateX(-50%)" }}
          />

          {/* TOP: SUSPENDED GLASS CRYSTAL (Image Seed) */}
          <div className="flex flex-col items-center gap-1.5 select-none relative z-10">
            
            {/* 3D Glass hologram seed crystal */}
            <div 
              ref={crystalRef}
              className="w-20 h-24 flex items-center justify-center cursor-pointer relative group transition-all duration-300"
              title="Immutable Master Image Blueprint"
            >
              {/* Particle orbit rings */}
              <div className="absolute inset-[-15px] border border-blue-500/10 rounded-full animate-pulse pointer-events-none scale-y-[0.3] rotate-12" />
              <div className="absolute inset-[-25px] border border-white/5 rounded-full animate-pulse pointer-events-none scale-y-[0.2] -rotate-12" />

              <div className="crystal-spin-3d">
                <svg className="w-14 h-18 text-blue-400 filter drop-shadow-[0_0_8px_rgba(96,165,250,0.35)]" viewBox="0 0 100 120" fill="none">
                  {/* Facet polygon layers to fake a 3D refraction */}
                  <polygon points="50,10 80,45 50,110" fill="rgba(96,165,250,0.18)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
                  <polygon points="50,10 20,45 50,110" fill="rgba(96,165,250,0.1)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
                  <polygon points="20,45 50,45 50,110" fill="rgba(96,165,250,0.05)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
                  <polygon points="80,45 50,45 50,110" fill="rgba(96,165,250,0.22)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
                  <polygon points="20,45 50,10 50,45" fill="rgba(96,165,250,0.08)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
                  <polygon points="80,45 50,10 50,45" fill="rgba(96,165,250,0.28)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
                </svg>
              </div>
            </div>

            {buildProgress !== null ? (
              <div className="flex flex-col items-center gap-1 mt-1 font-mono text-[8px] tracking-widest text-zinc-450 animate-fadeIn">
                <span>MORPHING MASTER {buildProgress}%</span>
                <div className="w-20 h-1 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                  <div className="h-full bg-white transition-all duration-75" style={{ width: `${buildProgress}%` }} />
                </div>
              </div>
            ) : (
              <span className="text-[10px] font-mono font-bold text-white tracking-widest uppercase mt-1">
                node:{imageVersion}
              </span>
            )}
          </div>

          {/* MIDDLE: THE MANUFACTURING CHAMBER */}
          <div 
            ref={chamberRef}
            className="w-[420px] h-[54px] border-t border-b border-zinc-900 bg-white/[0.01] flex items-center justify-between px-6 relative"
          >
            {/* Small hardware widgets */}
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60 foundry-indicator-light" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>

            <span className="text-[8.5px] font-mono font-extrabold uppercase tracking-[0.25em] text-zinc-550">
              CONTAINER FOUNDRY CHAMBER
            </span>

            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60 foundry-indicator-light" />
            </div>

            {/* Glowing hardware laser ring */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/[0.04] to-transparent pointer-events-none" />
          </div>

          {/* BOTTOM: THE LIVING CONTAINER INSTANCES */}
          <div className="w-full flex justify-between gap-4 relative z-10">
            
            {(["A", "B", "C"] as const).map((slotId) => {
              const inst = instances[slotId];
              const isHovered = hoveredSlot === slotId;
              
              return (
                <div 
                  key={slotId}
                  ref={slotRefs[slotId]}
                  onMouseEnter={() => handleHoverSlot(slotId)}
                  onMouseLeave={() => handleHoverSlot(null)}
                  className="flex-1 min-h-[148px] flex flex-col relative transition-all duration-300"
                >
                  {inst ? (
                    <div 
                      className={cn(
                        "flex-1 p-3.5 bg-white/[0.01] border rounded-[16px] flex flex-col justify-between shadow-lg relative transition-all duration-500",
                        inst.status === "modified" 
                          ? "border-emerald-600/35 shadow-[0_0_15px_rgba(16,185,129,0.05)] bg-emerald-950/[0.02]" 
                          : "border-white/10 hover:border-white/30"
                      )}
                    >
                      {/* Floating status details (Visible on Hover) */}
                      <div className={cn(
                        "absolute inset-x-0 -top-8 flex flex-wrap gap-2 justify-center font-mono text-[7px] text-zinc-450 bg-black/60 border border-zinc-900/60 py-1 px-2 rounded-full pointer-events-none transition-all duration-300",
                        isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                      )}>
                        <span>PID 1</span>
                        <span>CPU {inst.cpu}%</span>
                        <span>MEM {inst.memory}MB</span>
                      </div>

                      {/* Header tags */}
                      <div className="flex justify-between items-center border-b border-white/5 pb-1.5 mb-1">
                        <span className="text-[10px] font-bold text-white font-mono flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {inst.uid}
                        </span>
                        <span className="text-[7.5px] font-mono text-zinc-550 border border-zinc-900 bg-[#0d0d0e] px-1.5 py-0.5 rounded">
                          {inst.version}
                        </span>
                      </div>

                      {/* Runtime indicators layout (CPU/Mem visual rows) */}
                      <div className="flex flex-col gap-1 my-1.5 font-mono text-[8px] text-zinc-550">
                        <div className="flex items-center gap-2 select-none">
                          <Cpu className="w-3 h-3 text-zinc-450 animate-pulse" />
                          <span>express active</span>
                        </div>
                        <div className="flex items-center gap-2 select-none">
                          <Activity className="w-3 h-3 text-zinc-450 animate-pulse" />
                          <span>eth0 link connected</span>
                        </div>
                        {inst.status === "modified" && (
                          <div className="flex items-center gap-2 select-none text-emerald-400 font-bold animate-fadeIn">
                            <HardDrive className="w-3 h-3 text-current" />
                            <span>Modified write</span>
                          </div>
                        )}
                      </div>

                      {/* Local action buttons inside container capsule */}
                      <div className="flex gap-1.5 mt-2 border-t border-white/5 pt-2">
                        <button
                          onClick={() => handleModifyInstance(slotId)}
                          disabled={inst.status === "modified" || isAnimating}
                          className="flex-1 py-1.5 rounded bg-white/5 border border-white/5 hover:border-white/20 text-white text-[8px] font-bold disabled:opacity-40 cursor-pointer flex items-center justify-center gap-0.5 transition-all select-none"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          Modify
                        </button>
                        <button
                          onClick={() => handleDeleteInstance(slotId)}
                          disabled={isAnimating}
                          className="py-1.5 px-2 rounded bg-white/5 border border-white/5 hover:border-red-950/80 hover:text-red-400 text-zinc-500 text-[8px] cursor-pointer flex items-center justify-center transition-all select-none"
                          title="Destroy capsule"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>

                    </div>
                  ) : (
                    // Empty manufacturing platform slot
                    <div className="flex-1 border border-dashed border-zinc-900 rounded-[16px] bg-white/[0.005] flex flex-col items-center justify-center p-3 text-center transition-all duration-300">
                      <span className="text-[7.5px] font-mono uppercase tracking-widest text-zinc-700 font-bold block mb-1">
                        PLATFORM SLOT
                      </span>
                      <span className="text-[7.2px] text-zinc-750 max-w-[80px]">
                        Ready to cast instance
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

          </div>

        </div>

        {/* Floating Minimal Controls at Bottom Center */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 border-t border-zinc-900/60 pt-4 relative z-20">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-550 font-bold block">
              Foundry Controller
            </span>
            <div className="w-px h-3.5 bg-zinc-800" />
            
            <div className="p-1 px-2.5 rounded bg-black/40 border border-zinc-900 text-[8px] text-zinc-455 font-mono max-w-[320px]">
              {imageVersion === "v2" ? (
                <span>
                  Blueprint v2 loaded. Existing replica containers keep their v1 logic. New cast instances deploy from v2.
                </span>
              ) : (
                <span>
                  Suspended crystal seed contains blueprint layers. Spawning casts separate writable sandboxes below.
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 select-none">
            {/* Spawn container (docker run) */}
            <button
              onClick={handleSpawnInstance}
              disabled={(!instances.A && !instances.B && !instances.C) ? false : (!!instances.A && !!instances.B && !!instances.C) || isAnimating}
              className="py-2 px-4 rounded-[9px] text-[10px] font-bold bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Play className="w-3 h-3 fill-black text-black" />
              docker run (Cast)
            </button>

            {/* Build node-app:v2 */}
            <button
              onClick={handleBuildV2}
              disabled={imageVersion === "v2" || isAnimating}
              className="py-2 px-4 rounded-[9px] text-[10px] font-bold bg-zinc-900 border border-zinc-800 hover:border-zinc-750 text-white disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3 h-3 text-white" />
              Build v2
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="p-2 rounded-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
              title="Reset Foundry simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
