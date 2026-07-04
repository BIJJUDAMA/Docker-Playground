"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";
import { PacketPrimitive } from "@/components/primitives/PacketPrimitive";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { HelpCircle, RefreshCw } from "lucide-react";

interface PullLayer {
  id: number;
  name: string;
  size: string;
  cached: boolean;
}

const PULL_LAYERS: PullLayer[] = [
  { id: 4, name: "app-code:latest", size: "2.4 MB", cached: false },
  { id: 3, name: "requirements:latest", size: "84.2 MB", cached: false },
  { id: 2, name: "python:3.10-alpine", size: "52.8 MB", cached: true },
  { id: 1, name: "alpine:3.18", size: "5.8 MB", cached: true }
];

export default function DockerPull() {
  const [pullStatuses, setPullStatuses] = useState<Record<number, "idle" | "checking" | "downloading" | "completed" | "cached">>({
    1: "idle", 2: "idle", 3: "idle", 4: "idle"
  });
  const [downloadProgress, setDownloadProgress] = useState<Record<number, number>>({
    1: 0, 2: 0, 3: 0, 4: 0
  });
  const [animationState, setAnimationState] = useState<"idle" | "running" | "complete">("idle");
  const [registryStatus, setRegistryStatus] = useState<"idle" | "running" | "healthy">("idle");
  const [localStatus, setLocalStatus] = useState<"idle" | "running" | "healthy">("idle");

  const containerRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<HTMLDivElement>(null);
  const localLayerRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  useAnimationControls(timeline);

  const handleReset = () => {
    setAnimationState("idle");
    setRegistryStatus("idle");
    setLocalStatus("idle");
    setPullStatuses({ 1: "idle", 2: "idle", 3: "idle", 4: "idle" });
    setDownloadProgress({ 1: 0, 2: 0, 3: 0, 4: 0 });

    if (timeline) {
      timeline.pause().progress(0);
    }

    gsap.set(packetRef.current, { x: 0, opacity: 0, scale: 0 });
    PULL_LAYERS.forEach((layer) => {
      const el = localLayerRefs.current[layer.id];
      if (el) {
        gsap.set(el, { scale: 0.9, opacity: 0 });
      }
    });
  };

  useEffect(() => {
    handleReset();

    const tl = gsap.timeline({
      paused: true,
      onStart: () => {
        setAnimationState("running");
        setRegistryStatus("healthy");
        setLocalStatus("running");
      },
      onComplete: () => {
        setAnimationState("complete");
        setLocalStatus("healthy");
      }
    });

    setTimeline(tl);

    // Initial state: hide local layers
    PULL_LAYERS.forEach((layer) => {
      gsap.set(localLayerRefs.current[layer.id], { scale: 0.9, opacity: 0 });
    });

    // 1. Layer 1 (alpine) - Cached
    tl.to({}, { duration: 0.1, onStart: () => setPullStatuses(prev => ({ ...prev, 1: "checking" })) })
      .to(packetRef.current, { opacity: 1, scale: 1, duration: 0.2 })
      .to(packetRef.current, {
        x: 230,
        duration: 0.5,
        ease: "power2.inOut",
      })
      .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.15 })
      .to({}, {
        duration: 0.3,
        onStart: () => setPullStatuses(prev => ({ ...prev, 1: "cached" })),
      })
      .to(localLayerRefs.current[1], {
        scale: 1,
        opacity: 1,
        duration: 0.3,
      })

      // 2. Layer 2 (python) - Cached
      .to(packetRef.current, { x: 0, duration: 0.1 })
      .to({}, { duration: 0.1, onStart: () => setPullStatuses(prev => ({ ...prev, 2: "checking" })) })
      .to(packetRef.current, { opacity: 1, scale: 1, duration: 0.2 })
      .to(packetRef.current, {
        x: 230,
        duration: 0.5,
        ease: "power2.inOut",
      })
      .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.15 })
      .to({}, {
        duration: 0.3,
        onStart: () => setPullStatuses(prev => ({ ...prev, 2: "cached" })),
      })
      .to(localLayerRefs.current[2], {
        scale: 1,
        opacity: 1,
        duration: 0.3,
      })

      // 3. Layer 3 (requirements) - Pulling
      .to(packetRef.current, { x: 0, duration: 0.1 })
      .to({}, { duration: 0.1, onStart: () => setPullStatuses(prev => ({ ...prev, 3: "downloading" })) })
      .to(packetRef.current, { opacity: 1, scale: 1, duration: 0.2 })
      .to(packetRef.current, {
        x: 230,
        duration: 1.2,
        ease: "none",
        onUpdate: function() {
          setDownloadProgress(prev => ({ ...prev, 3: Math.floor(this.progress() * 100) }));
        }
      })
      .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.15 })
      .to({}, {
        duration: 0.1,
        onStart: () => setPullStatuses(prev => ({ ...prev, 3: "completed" })),
      })
      .to(localLayerRefs.current[3], {
        scale: 1,
        opacity: 1,
        duration: 0.3,
      })

      // 4. Layer 4 (app code) - Pulling
      .to(packetRef.current, { x: 0, duration: 0.1 })
      .to({}, { duration: 0.1, onStart: () => setPullStatuses(prev => ({ ...prev, 4: "downloading" })) })
      .to(packetRef.current, { opacity: 1, scale: 1, duration: 0.2 })
      .to(packetRef.current, {
        x: 230,
        duration: 1.0,
        ease: "none",
        onUpdate: function() {
          setDownloadProgress(prev => ({ ...prev, 4: Math.floor(this.progress() * 100) }));
        }
      })
      .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.15 })
      .to({}, {
        duration: 0.1,
        onStart: () => setPullStatuses(prev => ({ ...prev, 4: "completed" })),
      })
      .to(localLayerRefs.current[4], {
        scale: 1,
        opacity: 1,
        duration: 0.3,
      });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <VisualCanvas
      objective="Understand how Docker pulls images by checking local layers and downloading only missing ones."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            What is an Image Pull?
          </div>
          <p>
            An **Image Pull** queries remote container image registries (like Docker Hub) and downloads the filesystem layers that make up a container image.
          </p>
          <p>
            For layers that are already present (such as the base OS or language runtime), Docker skips the download entirely (**Already exists**), fetching only the fresh or modified layers.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        {/* Pull Simulation Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px]">
          {/* Connection wire */}
          <div className="hidden md:block absolute top-[41px] left-[150px] right-[150px] h-0.5 border-t border-dashed border-zinc-850 pointer-events-none z-0" />

          {/* Animated data packet */}
          <PacketPrimitive
            ref={packetRef}
            color="#FAFAFA"
            size={10}
            className="top-[37px] left-[140px]"
          />

          <div className="w-full max-w-2xl flex flex-col md:flex-row items-stretch justify-between gap-12 relative z-10">
            {/* Registry Hub Node */}
            <NodePrimitive
              label="Docker Hub"
              type="database"
              status={registryStatus}
              subtitle="Remote Registry"
              className="flex-1 w-full"
            >
              <div className="flex flex-col gap-1.5 select-text font-sans">
                {PULL_LAYERS.map((layer) => (
                  <div key={layer.id} className="p-2 bg-[#0d0d0e] rounded-[9px] border border-zinc-850 flex items-center justify-between font-mono text-[9px] text-zinc-350">
                    <span>{layer.name}</span>
                    <span className="text-[7.5px] font-sans font-bold uppercase tracking-wider text-zinc-550">
                      Registry Node
                    </span>
                  </div>
                ))}
              </div>
            </NodePrimitive>

            {/* Local Engine Storage Node */}
            <NodePrimitive
              label="Local Engine"
              type="laptop"
              status={localStatus}
              subtitle="Docker Engine Host"
              className="flex-1 w-full"
            >
              <div className="flex flex-col gap-1.5 select-text font-sans">
                {PULL_LAYERS.map((layer) => {
                  const status = pullStatuses[layer.id];
                  const progress = downloadProgress[layer.id];

                  return (
                    <div
                      key={layer.id}
                      ref={(el) => { localLayerRefs.current[layer.id] = el; }}
                      className={cn(
                        "p-2 rounded-[9px] border font-mono text-[9px] flex items-center justify-between transition-all duration-300 relative overflow-hidden",
                        status === "cached" && "bg-zinc-800/10 border-zinc-700 text-zinc-300",
                        status === "completed" && "bg-white/5 border-white/10 text-white",
                        status === "downloading" && "bg-[#0d0d0e] border-zinc-750 text-zinc-300",
                        status === "idle" && "opacity-0 scale-90 border-transparent text-zinc-650"
                      )}
                    >
                      {status === "downloading" && (
                        <div 
                          className="absolute bottom-0 left-0 h-[2px] bg-white transition-all duration-75"
                          style={{ width: `${progress}%` }}
                        />
                      )}

                      <span>{layer.name}</span>
                      <span className="text-[7px] font-sans font-bold uppercase shrink-0">
                        {status === "cached" && "Already Exists"}
                        {status === "completed" && "Downloaded"}
                        {status === "downloading" && `Pulling ${progress}%`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </NodePrimitive>
          </div>
        </div>

        {/* Selected Layer Pull logs (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Terminal stdout
            </span>
            <h4 className="text-sm font-extrabold text-white font-sans">docker pull app:latest</h4>
          </div>

          {/* Docker Pull stdout Console */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] overflow-hidden flex flex-col flex-1 shadow-inner select-text min-h-[160px]">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0">
              <span className="text-[8px] font-mono text-zinc-500 font-bold">stdout</span>
            </div>
            <div className="p-3 font-mono text-[9px] text-zinc-450 leading-relaxed overflow-y-auto flex-1 custom-scrollbar">
              Using default tag: latest<br />
              latest: Pulling from library/app<br /><br />
              {pullStatuses[1] !== "idle" && (
                <div>
                  {pullStatuses[1] === "checking" && <span className="animate-pulse text-zinc-400">Checking alpine:3.18...</span>}
                  {pullStatuses[1] === "cached" && <span className="text-zinc-300">5.8MB: Already exists</span>}
                </div>
              )}
              {pullStatuses[2] !== "idle" && (
                <div>
                  {pullStatuses[2] === "checking" && <span className="animate-pulse text-zinc-400">Checking python:3.10...</span>}
                  {pullStatuses[2] === "cached" && <span className="text-zinc-300">52.8MB: Already exists</span>}
                </div>
              )}
              {pullStatuses[3] !== "idle" && (
                <div>
                  {pullStatuses[3] === "downloading" && <span className="text-zinc-200 animate-pulse">Pulling requirements layer ({downloadProgress[3]}%)</span>}
                  {pullStatuses[3] === "completed" && <span className="text-zinc-200">84.2MB: Pull complete</span>}
                </div>
              )}
              {pullStatuses[4] !== "idle" && (
                <div>
                  {pullStatuses[4] === "downloading" && <span className="text-zinc-200 animate-pulse">Pulling app layer ({downloadProgress[4]}%)</span>}
                  {pullStatuses[4] === "completed" && <span className="text-zinc-200">2.4MB: Pull complete</span>}
                </div>
              )}
              {animationState === "complete" && (
                <div className="text-white font-bold mt-2">
                  Status: Downloaded newer image for app:latest
                </div>
              )}
            </div>
          </div>

          {animationState !== "idle" && (
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
