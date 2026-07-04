"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { HelpCircle, RefreshCw, Database, Trash2, Plus, AlertTriangle, CheckCircle, ArrowRight, HardDrive } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";

export default function PersistenceProblem() {
  const [useVolume, setUseVolume] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<"idle" | "data_added" | "container_deleted" | "recreated">("idle");
  const [usersCount, setUsersCount] = useState<number>(0);
  const [terminalLog, setTerminalLog] = useState("Run tasks to inspect PostgreSQL data lifecycle...");

  const containerRef = useRef<HTMLDivElement>(null);
  const dbFileRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const connectionRef = useRef<HTMLDivElement>(null);

  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  useAnimationControls(timeline);

  const handleReset = () => {
    setSimStep("idle");
    setUsersCount(0);
    setTerminalLog("Run tasks to inspect PostgreSQL data lifecycle...");
    if (timeline) {
      timeline.pause().progress(0);
    }
    gsap.set("#db-container-node", { opacity: 1, scale: 1 });
    gsap.set(dbFileRef.current, { opacity: 0, scale: 0.8 });
    gsap.set(volumeRef.current, { opacity: 0, scale: 0.8, y: 15 });
    gsap.set(connectionRef.current, { opacity: 0, scaleY: 0 });
  };

  const handleAddUser = () => {
    setSimStep("data_added");
    setUsersCount(prev => prev + 1);
    setTerminalLog("postgres=# INSERT INTO users (name) VALUES ('Alice');\n[SUCCESS] Inserted user record inside PostgreSQL data directory.");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline();
    setTimeline(tl);

    tl.to(dbFileRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.4
    });

    if (useVolume) {
      gsap.set(volumeRef.current, { opacity: 1, y: 0 });
      tl.to(connectionRef.current, {
        opacity: 1,
        scaleY: 1,
        duration: 0.4
      });
    }
  };

  const handleDeleteContainer = () => {
    setSimStep("container_deleted");
    setTerminalLog("host$ docker rm -f pg-container\nDestroying running database container process bounds...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline();
    setTimeline(tl);

    if (useVolume) {
      // Disconnect volume link first
      tl.to(connectionRef.current, {
        opacity: 0,
        scaleY: 0,
        duration: 0.3
      })
      // Explode/fade container node
      .to("#db-container-node", {
        opacity: 0.1,
        scale: 0.95,
        duration: 0.6,
        ease: "power2.inOut"
      })
      .call(() => {
        setTerminalLog("host$ docker rm -f pg-container\n[SUCCESS] Container destroyed. Notice that the volume storage remains completely intact on the host machine.");
      });
    } else {
      // Explode container and database file together
      tl.to("#db-container-node", {
        opacity: 0.1,
        scale: 0.95,
        duration: 0.6,
        ease: "power2.inOut"
      })
      .to(dbFileRef.current, {
        opacity: 0,
        scale: 0.7,
        duration: 0.3
      }, "-=0.3")
      .call(() => {
        setTerminalLog("host$ docker rm -f pg-container\n[WARNING] Container destroyed! All directories written inside the container have disappeared completely.");
      });
    }
  };

  const handleRecreate = () => {
    setSimStep("recreated");
    setTerminalLog("host$ docker run -d --name pg-new -v pg-data:/var/lib/postgresql/data postgres\nMounting existing volume to new container instance...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline();
    setTimeline(tl);

    // Fade new container back in
    tl.to("#db-container-node", {
      opacity: 1,
      scale: 1,
      duration: 0.5
    })
    // Reconnect volume line
    .to(connectionRef.current, {
      opacity: 1,
      scaleY: 1,
      duration: 0.4
    })
    .to(dbFileRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      onStart: () => {
        setTerminalLog(`host$ docker run ...\n[SUCCESS] New container started! Database successfully re-mounted users.db with all ${usersCount} users records intact.`);
      }
    });
  };

  useEffect(() => {
    handleReset();
  }, [useVolume]);

  return (
    <VisualCanvas
      objective="Understand the core data durability problem: why container file changes are lost, and how volumes keep database storage secure."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            The Persistence Problem
          </div>
          <p>
            Containers are **stateless and ephemeral**. Any database records written to `/var/lib/postgresql/data` live in the container's private write layer. If the container process is stopped or deleted, that write layer is destroyed forever.
          </p>
          <p>
            Attaching a **Volume** maps that directory outside the container's lifecycle to the host storage system, keeping database files durable.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Sandbox Simulation Area (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          {/* Action trigger banner */}
          <div className="flex gap-2 mb-6 shrink-0 relative z-10 select-none">
            <button
              onClick={() => setUseVolume(false)}
              disabled={simStep !== "idle"}
              className={cn(
                "px-3 py-1.5 rounded-[8px] text-[9.5px] font-bold border transition-all cursor-pointer disabled:opacity-40",
                !useVolume
                  ? "bg-white text-black border-transparent"
                  : "bg-[#0d0d0e] border-zinc-850 text-zinc-450 hover:text-zinc-200"
              )}
            >
              Mode A: Ephemeral Storage
            </button>
            <button
              onClick={() => setUseVolume(true)}
              disabled={simStep !== "idle"}
              className={cn(
                "px-3 py-1.5 rounded-[8px] text-[9.5px] font-bold border transition-all cursor-pointer disabled:opacity-40",
                useVolume
                  ? "bg-white text-black border-transparent"
                  : "bg-[#0d0d0e] border-zinc-850 text-zinc-450 hover:text-zinc-200"
              )}
            >
              Mode B: volume Mounted
            </button>
          </div>

          {/* Node Graph */}
          <div className="w-full max-w-xs flex flex-col gap-6 items-center justify-center relative min-h-[200px]">
            
            {/* Database Container */}
            <div id="db-container-node" className="w-full z-10 transition-opacity duration-300">
              <NodePrimitive
                label={simStep === "recreated" ? "pg-new (Running)" : "pg-container (Running)"}
                status={simStep === "container_deleted" ? "crashed" : "running"}
                icon={<Database className="w-4 h-4 text-zinc-300" />}
                className="py-3 rounded-[12px] bg-[#0d0d0e] border-zinc-850"
              >
                {/* Writable file path */}
                <div 
                  ref={dbFileRef}
                  className="mt-2.5 mx-auto w-36 py-1.5 rounded-[8px] border border-zinc-800 bg-[#1a1a1e] font-mono text-[8px] flex items-center justify-center gap-1.5 opacity-0 scale-80 transition-all select-text"
                >
                  <Database className="w-3.5 h-3.5 text-zinc-550" />
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-zinc-200">users.db</span>
                    <span className="text-[6.5px] text-zinc-550 uppercase">Records: {usersCount}</span>
                  </div>
                </div>
              </NodePrimitive>
            </div>

            {/* Connection pipe line */}
            <div 
              ref={connectionRef}
              className="absolute top-[88px] bottom-[72px] w-0.5 border-l border-dashed border-zinc-800 origin-top opacity-0 scale-y-0 z-0 pointer-events-none"
            />

            {/* Mounted Volume Node */}
            <div 
              ref={volumeRef}
              className="w-full z-10 transition-all duration-300 opacity-0 translate-y-4"
            >
              <NodePrimitive
                label="Host Volume: pg-data"
                status="idle"
                icon={<HardDrive className="w-4 h-4 text-zinc-450 font-bold" />}
                className="py-3 rounded-[12px] bg-[#0d0d0e]/60 border-zinc-800 border-dashed"
              >
                <div className="mt-2.5 mx-auto w-36 py-1.5 rounded-[8px] border border-zinc-850 bg-zinc-850/45 font-mono text-[8.5px] flex items-center justify-center gap-1.5 select-text">
                  <Database className="w-3.5 h-3.5 text-white" />
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-zinc-305">users.db</span>
                    <span className="text-[6.5px] text-zinc-405 uppercase font-bold">Synchronized</span>
                  </div>
                </div>
              </NodePrimitive>
            </div>

          </div>

        </div>

        {/* Selected actions and details panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Persistence Console
            </span>
            <h4 className="text-sm font-extrabold text-white">Database actions</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text">
              Run step-by-step triggers to inspect data survival behavior.
            </p>
          </div>

          {/* Stepper buttons checklist */}
          <div className="p-3.5 rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col gap-2 font-sans text-left">
            <span className="text-[8.5px] font-mono uppercase tracking-wider text-zinc-550 font-bold">
              Simulation steps:
            </span>
            
            <div className="flex flex-col gap-3">
              {/* Step 1: Insert user */}
              <div className="flex items-start gap-2.5 text-[10px]">
                <button
                  disabled={simStep !== "idle"}
                  onClick={handleAddUser}
                  className="w-5 h-5 rounded-full border border-zinc-750 text-zinc-300 hover:bg-white hover:text-black hover:border-transparent flex items-center justify-center font-mono text-[9px] mt-0.5 shrink-0 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                >
                  {simStep !== "idle" ? "✓" : "1"}
                </button>
                <div className="flex flex-col select-text">
                  <span className={cn("font-bold", simStep !== "idle" ? "text-zinc-550 line-through" : "text-zinc-200")}>
                    Insert User Records
                  </span>
                  <span className="text-[8.5px] text-zinc-500 leading-normal">
                    Insert data lines to database folder.
                  </span>
                </div>
              </div>

              {/* Step 2: Delete container */}
              <div className="flex items-start gap-2.5 text-[10px]">
                <button
                  disabled={simStep !== "data_added"}
                  onClick={handleDeleteContainer}
                  className="w-5 h-5 rounded-full border border-zinc-750 text-zinc-300 hover:bg-red-500 hover:text-white hover:border-transparent flex items-center justify-center font-mono text-[9px] mt-0.5 shrink-0 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                >
                  {simStep === "container_deleted" || simStep === "recreated" ? "✓" : "2"}
                </button>
                <div className="flex flex-col select-text">
                  <span className={cn("font-bold", simStep === "container_deleted" || simStep === "recreated" ? "text-zinc-550 line-through" : "text-zinc-200")}>
                    Delete Container
                  </span>
                  <span className="text-[8.5px] text-zinc-500 leading-normal">
                    Remove container bounds.
                  </span>
                </div>
              </div>

              {/* Step 3: Recreate container (Only for Volume Mode) */}
              {useVolume && (
                <div className="flex items-start gap-2.5 text-[10px] animate-fadeIn">
                  <button
                    disabled={simStep !== "container_deleted"}
                    onClick={handleRecreate}
                    className="w-5 h-5 rounded-full border border-zinc-750 text-zinc-300 hover:bg-white hover:text-black hover:border-transparent flex items-center justify-center font-mono text-[9px] mt-0.5 shrink-0 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                  >
                    {simStep === "recreated" ? "✓" : "3"}
                  </button>
                  <div className="flex flex-col select-text">
                    <span className={cn("font-bold", simStep === "recreated" ? "text-zinc-550 line-through" : "text-zinc-200")}>
                      Recreate Container pg-new
                    </span>
                    <span className="text-[8.5px] text-zinc-500 leading-normal">
                      Start new container mounting the volume.
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Trace console log */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col min-h-[90px] overflow-hidden select-text">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0">
              <span className="text-[7.5px] font-mono text-zinc-550 font-bold">Trace output logs:</span>
            </div>
            <div className="p-3 font-mono text-[9.5px] text-zinc-400 leading-relaxed flex-1 overflow-y-auto">
              {terminalLog}
            </div>
          </div>

          {/* Educational output alert banners */}
          {simStep === "container_deleted" && !useVolume && (
            <div className="p-3.5 rounded-[12px] bg-red-950/5 border border-red-500/15 text-[8.5px] text-red-405 leading-normal flex items-start gap-2 animate-fadeIn select-text">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                **DATA PERMANENTLY LOST!** Because pg-container used no volume, the SQLite `users.db` file was deleted forever on container destruction.
              </span>
            </div>
          )}

          {simStep === "recreated" && (
            <div className="p-3.5 rounded-[12px] bg-white/5 border border-white/10 text-[8.5px] text-zinc-300 leading-normal flex items-start gap-2 animate-fadeIn select-text">
              <CheckCircle className="w-4 h-4 text-zinc-350 shrink-0 mt-0.5" />
              <span>
                **DATA RESTORED SUCCESSFULLY!** Decoupled host volume `pg-data` preserved the database catalog, letting the new container reload records instantly!
              </span>
            </div>
          )}

          {simStep !== "idle" && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
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
