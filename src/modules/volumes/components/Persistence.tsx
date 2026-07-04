"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { HelpCircle, Database, HardDrive, Trash2, Plus, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";

export default function Persistence() {
  const [hasVolume, setHasVolume] = useState<boolean>(false);
  const [stepState, setStepState] = useState<"empty" | "file_created" | "deleted">("empty");
  const [terminalLog, setTerminalLog] = useState("Configure persistence state and write database records...");

  const containerRef = useRef<HTMLDivElement>(null);
  const dbFileRef = useRef<HTMLDivElement>(null);
  const volumeFileRef = useRef<HTMLDivElement>(null);
  const flowPulseRef = useRef<HTMLDivElement>(null);

  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  useAnimationControls(timeline);

  const handleReset = () => {
    setStepState("empty");
    setTerminalLog("Configure persistence state and write database records...");
    if (timeline) {
      timeline.pause().progress(0);
    }
    gsap.set(dbFileRef.current, { opacity: 0, scale: 0.8 });
    gsap.set(volumeFileRef.current, { opacity: 0, scale: 0.8 });
    gsap.set(flowPulseRef.current, { opacity: 0, scale: 0, y: 0 });
  };

  const handleCreateDb = () => {
    setStepState("file_created");
    setTerminalLog("container$ touch /data/users.db\nCreating database storage files inside container...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline();
    setTimeline(tl);

    if (hasVolume) {
      tl.to(dbFileRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.4
      })
      .set(flowPulseRef.current, { opacity: 1, scale: 1, y: 0 })
      .to(flowPulseRef.current, {
        y: 110,
        duration: 0.8,
        ease: "power2.inOut"
      })
      .to(flowPulseRef.current, {
        opacity: 0,
        scale: 0,
        duration: 0.2
      })
      .to(volumeFileRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        onStart: () => {
          setTerminalLog("container$ touch /data/users.db\n[SUCCESS] users.db created inside container and mirrored directly to the mounted host Volume.");
        }
      }, "-=0.1");
    } else {
      tl.to(dbFileRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        onComplete: () => {
          setTerminalLog("container$ touch /data/users.db\n[SUCCESS] users.db file created inside container's temporary Writable layer.");
        }
      });
    }
  };

  const handleDeleteContainer = () => {
    setStepState("deleted");
    setTerminalLog("host$ docker rm -f db-container\nForce removing container process bounds and writable layer...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline();
    setTimeline(tl);

    if (hasVolume) {
      tl.to("#db-container-node", {
        opacity: 0.15,
        scale: 0.95,
        duration: 0.6
      })
      .to(dbFileRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.4
      }, "-=0.4")
      .to({}, {
        duration: 0.1,
        onStart: () => {
          setTerminalLog("host$ docker rm -f db-container\n[SUCCESS] Container deleted. The database file users.db remains SECURE and persistent inside the Volume!");
        }
      });
    } else {
      tl.to("#db-container-node", {
        opacity: 0.15,
        scale: 0.95,
        duration: 0.6
      })
      .to(dbFileRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.4
      }, "-=0.4")
      .to({}, {
        duration: 0.1,
        onStart: () => {
          setTerminalLog("host$ docker rm -f db-container\n[WARNING] Container deleted. The database file users.db was completely DESTROYED alongside the writable container layer!");
        }
      });
    }
  };

  // Sync state changes on toggle hasVolume
  useEffect(() => {
    handleReset();
  }, [hasVolume]);

  return (
    <VisualCanvas
      objective="Understand the persistence problem: why files are deleted alongside containers, and how host volumes secure data permanently."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Why do we need Volumes?
          </div>
          <p>
            By default, all files written inside a container live inside its **temporary Writable Layer**. When that container is deleted, that layer is destroyed, resulting in immediate **data loss**.
          </p>
          <p>
            Mounting a **Volume** instructs Docker to redirect files outside the container lifecycle and store them safely inside a dedicated directory on the host machine.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Sandbox Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          {/* Mode Switcher */}
          <div className="flex gap-2 mb-6 shrink-0 relative z-10">
            <button
              onClick={() => setHasVolume(false)}
              className={cn(
                "px-3 py-1.5 rounded-[8px] text-[9.5px] font-bold font-sans border transition-all cursor-pointer",
                !hasVolume
                  ? "bg-white text-black border-transparent"
                  : "bg-[#0d0d0e] border-zinc-850 text-zinc-400 hover:text-zinc-200"
              )}
            >
              Mode A: No Volume (Temporary)
            </button>
            <button
              onClick={() => setHasVolume(true)}
              className={cn(
                "px-3 py-1.5 rounded-[8px] text-[9.5px] font-bold font-sans border transition-all cursor-pointer",
                hasVolume
                  ? "bg-white text-black border-transparent"
                  : "bg-[#0d0d0e] border-zinc-850 text-zinc-400 hover:text-zinc-200"
              )}
            >
              Mode B: With Volume (Persistent)
            </button>
          </div>

          {/* Sandbox Visual Elements */}
          <div className="w-full max-w-xs flex flex-col gap-6 items-center justify-center relative min-h-[220px]">
            
            {/* Writable Container */}
            <div id="db-container-node" className="w-full transition-opacity duration-300 z-10">
              <NodePrimitive
                label="db-container (Running)"
                status={stepState === "deleted" ? "crashed" : "running"}
                icon={<Database className="w-4 h-4 text-zinc-300" />}
                className="py-3 rounded-[12px] bg-[#0d0d0e] border-zinc-850"
              >
                {/* Writable File inside container */}
                <div 
                  ref={dbFileRef}
                  className="mt-2.5 mx-auto w-32 py-1.5 rounded-[8px] border border-zinc-800 bg-[#1a1a1e] font-mono text-[8.5px] flex items-center justify-center gap-1.5 transition-all opacity-0 scale-0 select-text"
                >
                  <Database className="w-3.5 h-3.5 text-zinc-400" />
                  <span>users.db (file)</span>
                </div>
              </NodePrimitive>
            </div>

            {/* Connecting flow pulse */}
            <div 
              ref={flowPulseRef}
              className="absolute top-[80px] w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] opacity-0 scale-0 z-20 pointer-events-none"
            />

            {/* Mounted Host Volume (Visible in Mode B) */}
            <div className={cn(
              "w-full transition-all duration-500 z-10",
              hasVolume 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-4 pointer-events-none"
            )}>
              <NodePrimitive
                label="Host Volume: pg-data"
                status="idle"
                icon={<HardDrive className="w-4 h-4 text-zinc-450" />}
                className="py-3 rounded-[12px] bg-[#0d0d0e]/60 border-zinc-800 border-dashed"
              >
                {/* File inside Volume */}
                <div 
                  ref={volumeFileRef}
                  className="mt-2.5 mx-auto w-32 py-1.5 rounded-[8px] border border-zinc-700 bg-zinc-850 font-mono text-[8.5px] flex items-center justify-center gap-1.5 transition-all opacity-0 scale-0 select-text"
                >
                  <Database className="w-3.5 h-3.5 text-white" />
                  <span className="font-bold">users.db (saved)</span>
                </div>
              </NodePrimitive>
            </div>

          </div>

        </div>

        {/* Selected actions and details panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Persistence Sandbox
            </span>
            <h4 className="text-sm font-extrabold text-white">Database write actions</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text font-sans">
              Follow the tasks to see what happens when a database container is destroyed.
            </p>
          </div>

          {/* Stepper details */}
          <div className="p-3 rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col gap-2 font-sans select-text text-left">
            <span className="text-[8.5px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
              Walkthrough Actions:
            </span>
            <div className="flex flex-col gap-2.5">
              {/* Task 1 */}
              <div className="flex items-start gap-2 text-[10px]">
                <button
                  disabled={stepState !== "empty"}
                  onClick={handleCreateDb}
                  className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 font-mono text-[9px] mt-0.5 transition-all border-zinc-750 text-zinc-300 hover:bg-white hover:text-black hover:border-transparent cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                >
                  {stepState !== "empty" ? "✓" : "1"}
                </button>
                <div className="flex flex-col">
                  <span className={cn("font-bold", stepState !== "empty" ? "text-zinc-550 line-through" : "text-zinc-200")}>
                    Write users.db
                  </span>
                  <span className="text-[9px] text-zinc-500 leading-normal">
                    Create the SQLite database file inside the container's storage space.
                  </span>
                </div>
              </div>
              {/* Task 2 */}
              <div className="flex items-start gap-2 text-[10px]">
                <button
                  disabled={stepState !== "file_created"}
                  onClick={handleDeleteContainer}
                  className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 font-mono text-[9px] mt-0.5 transition-all border-zinc-750 text-zinc-300 hover:bg-red-500 hover:text-white hover:border-transparent cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                >
                  {stepState === "deleted" ? "✓" : "2"}
                </button>
                <div className="flex flex-col">
                  <span className={cn("font-bold", stepState === "deleted" ? "text-zinc-550 line-through" : "text-zinc-200")}>
                    Delete Container
                  </span>
                  <span className="text-[9px] text-zinc-500 leading-normal">
                    Simulate docker rm -f container and check if data survives.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal log output */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] overflow-hidden flex flex-col min-h-[90px] shadow-sm select-text">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0 select-none">
              <span className="text-[8px] font-mono text-zinc-500 font-bold">trace output</span>
            </div>
            <div className="p-3 font-mono text-[9px] text-zinc-400 overflow-y-auto leading-relaxed flex-1">
              {terminalLog}
            </div>
          </div>

          {/* Alert messages */}
          {stepState === "deleted" && (
            <div className="p-3 rounded-[12px] border border-zinc-800/25 bg-[#0d0d0e] text-left flex items-start gap-2 animate-fadeIn select-text font-sans">
              {hasVolume ? (
                <>
                  <CheckCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <span className="text-[9px] text-zinc-350 leading-relaxed font-normal">
                    Because you used a **Volume**, the SQLite file `users.db` is secure on your host storage! You can spawn a new container and reconnect it instantly.
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-zinc-450 shrink-0 mt-0.5" />
                  <span className="text-[9px] text-zinc-405 leading-relaxed font-normal">
                    **DATA LOST!** Because there was no volume attached, `users.db` was permanently deleted when the container process bounds were destroyed.
                  </span>
                </>
              )}
            </div>
          )}

          {stepState !== "empty" && (
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
