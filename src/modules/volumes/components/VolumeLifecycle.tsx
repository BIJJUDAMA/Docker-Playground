"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { AlertTriangle, Database, FileSpreadsheet, RefreshCw, HelpCircle, ArrowRight } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

export default function VolumeLifecycle() {
  const [useVolume, setUseVolume] = useState<boolean>(false);
  const [lifecycleState, setLifecycleState] = useState<"idle" | "spawned" | "written" | "destroyed" | "recovered">("idle");
  const [terminalLog, setTerminalLog] = useState("Click 'Spawn Container v1' in the sandbox panel to initialize.");

  const containerRef = useRef<HTMLDivElement>(null);
  const containerBlockRef = useRef<HTMLDivElement>(null);
  const fileBlockRef = useRef<HTMLDivElement>(null);
  const fileVolumeBlockRef = useRef<HTMLDivElement>(null);

  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  useAnimationControls(timeline);

  const handleReset = useCallback(() => {
    setLifecycleState("idle");
    setTerminalLog("Click 'Spawn Container v1' in the sandbox panel to initialize.");

    if (timeline) {
      timeline.pause().progress(0);
    }

    gsap.set(containerBlockRef.current, { opacity: 0, scale: 0.8, y: 30 });
    gsap.set(fileBlockRef.current, { opacity: 0, scale: 0 });
    gsap.set(fileVolumeBlockRef.current, { opacity: 0, scale: 0 });
  }, [timeline]);

  const handleSpawnV1 = () => {
    setLifecycleState("spawned");
    setTerminalLog("docker run -d --name container_v1 " + (useVolume ? "-v db-data:/data " : "") + "myapp\nSpawning container instance v1...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline();
    setTimeline(tl);

    tl.to(containerBlockRef.current, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.6,
      ease: "back.out(1.2)"
    });
  };

  const handleWriteDb = () => {
    setLifecycleState("written");
    setTerminalLog("container_v1$ sqlite3 app.db 'insert into users...'\nWriting sqlite user database to disk /data/users.db...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline();
    setTimeline(tl);

    tl.to(fileBlockRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: "power2.out"
    });

    if (useVolume) {
      tl.to({}, { duration: 0.1 })
        .to(fileVolumeBlockRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "power2.inOut"
        });
    }
  };

  const handleDestroy = () => {
    setLifecycleState("destroyed");
    setTerminalLog("docker rm -f container_v1\nForce removing container process and ephemeral root storage layers...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline();
    setTimeline(tl);

    tl.to(containerBlockRef.current, {
      opacity: 0,
      scale: 0.8,
      y: 20,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        setTerminalLog("docker rm -f container_v1\n[SUCCESS] Container destroyed.\n" + (useVolume ? "DATA PERSISTED: SQLite file remains inside db-data volume." : "DATA LOST: Ephemeral files deleted permanently."));
      }
    });
  };

  const handleRecover = () => {
    setLifecycleState("recovered");
    setTerminalLog("docker run -d --name container_v2 -v db-data:/data myapp\nSpawning container v2 mounting the existing db-data volume...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline();
    setTimeline(tl);

    tl.to(containerBlockRef.current, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.6,
      ease: "back.out(1.2)"
    });
  };

  return (
    <VisualCanvas
      objective="Trace how data behaves when containers are deleted: ephemeral storage is lost, while volumes persist."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            What is storage decoupling?
          </div>
          <p>
            When a container is deleted, Docker destroys its writable layer entirely, purging all databases or files written inside it.
          </p>
          <p>
            By mounting a **Volume**, writes to `/data/` bypass the ephemeral layer and write directly to host storage, keeping data persistent across container restarts, removals, and upgrades.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Simulation Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px]">
          
          <div className="w-full flex-1 flex flex-col gap-8 justify-center max-w-sm relative py-6 min-h-[250px]">
            {/* 1. Container Instance Box */}
            <div 
              ref={containerBlockRef}
              className="rounded-[12px] border border-zinc-800 bg-[#0d0d0e] p-4 min-h-[90px] relative flex flex-col justify-center items-center opacity-0 scale-90 translate-y-6"
            >
              <span className="absolute top-2.5 left-3 text-[7px] uppercase tracking-wider font-bold text-zinc-300">
                {lifecycleState === "recovered" ? "Container Instance v2" : "Container Instance v1"}
              </span>

              {/* SQLite DB File inside container */}
              <div 
                ref={fileBlockRef}
                className="absolute w-28 py-1.5 rounded-[9px] border border-zinc-850 bg-[#1a1a1e] text-zinc-300 flex items-center justify-center gap-1.5 shadow-sm opacity-0 scale-0"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-455" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold font-mono text-zinc-200">users.db</span>
                  <span className="text-[7px] text-zinc-500 uppercase font-bold tracking-wide">SQLite DB</span>
                </div>
              </div>
            </div>

            {/* Connection path line */}
            {useVolume && (
              <div className="absolute top-[90px] left-1/2 -translate-x-1/2 bottom-[115px] w-0.5 border-l border-dashed border-zinc-800/40 pointer-events-none z-0" />
            )}

            {/* 2. Host Storage Layer (Volume) */}
            <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] p-4 min-h-[100px] relative flex flex-col justify-center items-center shadow-inner">
              <span className="absolute top-2.5 left-3 text-[7px] uppercase tracking-wider font-bold text-zinc-550">
                Host Storage Layer
              </span>

              {useVolume ? (
                <div className="w-full flex items-center justify-center gap-4 mt-2">
                  <div className="p-3 rounded-[12px] border border-zinc-800 bg-[#121214] flex items-center gap-2 max-w-[160px] relative">
                    <Database className="w-4 h-4 text-zinc-350 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-zinc-200">db-data</span>
                      <span className="text-[7px] text-zinc-450 font-bold uppercase tracking-wider">Volume Mount</span>
                    </div>

                    {/* File duplicated to volume */}
                    <div 
                      ref={fileVolumeBlockRef}
                      className="absolute inset-0 bg-[#0d0d0e] rounded-[12px] border border-zinc-700 flex items-center justify-center gap-1 opacity-0 scale-0 z-20 pointer-events-none"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-300" />
                      <span className="text-[8px] font-bold text-zinc-200 font-mono">users.db (Saved)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-[9px] text-zinc-650 font-mono italic">No volumes mounted. Writes bypass host storage.</span>
              )}
            </div>
          </div>
        </div>

        {/* Selected Layer Pull logs (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Sandbox Controller
            </span>
            <h4 className="text-sm font-extrabold text-white font-sans">Lifecycle Actions</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text font-sans">
              Toggle volumes settings, then trace step-by-step executions downstream.
            </p>
          </div>

          {/* Toggle Volume switch */}
          <div className="p-3 rounded-[12px] border border-zinc-800/25 bg-[#0d0d0e] flex items-center justify-between select-none">
            <div className="flex flex-col pr-2 font-sans">
              <span className="text-[11px] font-bold text-zinc-200">
                Mount db-data Volume
              </span>
              <span className="text-[8px] text-zinc-550 leading-normal mt-0.5">
                Mounts folder path to host disk.
              </span>
            </div>
            
            <button
              onClick={() => {
                setUseVolume(!useVolume);
                handleReset();
              }}
              disabled={lifecycleState !== "idle"}
              className={cn(
                "relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40",
                useVolume ? "bg-white" : "bg-zinc-800"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out",
                  useVolume ? "translate-x-4 bg-black" : "translate-x-0 bg-white"
                )}
              />
            </button>
          </div>

          {/* Stepper lifecycle actions buttons */}
          <div className="flex flex-col gap-1.5 select-none font-mono text-[9px] font-bold">
            <button
              onClick={handleSpawnV1}
              disabled={lifecycleState !== "idle"}
              className="w-full py-2.5 rounded-[9px] text-left px-3.5 bg-[#1a1a1e] text-zinc-350 hover:bg-zinc-800 hover:text-white transition-all border border-zinc-850 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              <ArrowRight className="w-3.5 h-3.5 text-zinc-450" />
              1. Spawn Container v1
            </button>
            <button
              onClick={handleWriteDb}
              disabled={lifecycleState !== "spawned"}
              className="w-full py-2.5 rounded-[9px] text-left px-3.5 bg-[#1a1a1e] text-zinc-355 hover:bg-zinc-800 hover:text-white transition-all border border-zinc-850 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              <ArrowRight className="w-3.5 h-3.5 text-zinc-450" />
              2. Write Database File
            </button>
            <button
              onClick={handleDestroy}
              disabled={lifecycleState !== "written"}
              className="w-full py-2.5 rounded-[9px] text-left px-3.5 bg-[#1a1a1e] text-zinc-350 hover:bg-zinc-800 hover:text-white transition-all border border-zinc-850 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              <ArrowRight className="w-3.5 h-3.5 text-red-500" />
              3. docker rm (Delete v1)
            </button>
            <button
              onClick={handleRecover}
              disabled={lifecycleState !== "destroyed"}
              className="w-full py-2.5 rounded-[9px] text-left px-3.5 bg-[#1a1a1e] text-zinc-350 hover:bg-zinc-800 hover:text-white transition-all border border-zinc-850 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              <ArrowRight className="w-3.5 h-3.5 text-zinc-200" />
              {useVolume ? "4. Spawn v2 (Recover Data)" : "4. Spawn v2 (Observe Lost)"}
            </button>
          </div>

          {/* Terminal log */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] overflow-hidden flex flex-col min-h-[90px] shadow-sm select-text font-sans">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0 select-none">
              <span className="text-[8px] font-mono text-zinc-500 font-bold">console stdout</span>
            </div>
            <div className="p-3 font-mono text-[9px] text-zinc-450 leading-relaxed overflow-y-auto flex-1 select-text">
              {terminalLog}
            </div>
          </div>

          {/* Warning Alert */}
          {lifecycleState === "destroyed" && (
            <div className={cn(
              "p-3 rounded-[12px] border text-[9.5px] leading-relaxed select-text font-sans",
              useVolume 
                ? "border-zinc-805 bg-zinc-900/10 text-zinc-300" 
                : "border-red-955/20 bg-red-955/5 text-red-400"
            )}>
              <AlertTriangle className="w-4 h-4 shrink-0 inline mr-1" />
              {useVolume 
                ? "Named volume db-data remains persistent on the host. You are safe to spawn a new container mounting it." 
                : "SQLite database users.db was written directly to the container's thin writable layer, which has been deleted recursively."}
            </div>
          )}

          {lifecycleState !== "idle" && (
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
