"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { HelpCircle, RefreshCw, Folder, Box, HardDrive, Network, Server, Play, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";

export default function CompleteSystemSimulation() {
  const [useVolume, setUseVolume] = useState<boolean>(true);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [dbDataState, setDbDataState] = useState<"empty" | "populated">("populated");
  const [terminalLog, setTerminalLog] = useState("Click 'Deploy App' to trace the complete system pipeline.");
  
  // Animation coordinates/visual states
  const [activeStage, setActiveStage] = useState<"none" | "code" | "build" | "net" | "volume">("none");

  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);
  const packetRef = useRef<HTMLDivElement>(null);

  useAnimationControls(timeline);

  const handleReset = () => {
    setIsDeploying(false);
    setDbDataState("populated");
    setTerminalLog("Click 'Deploy App' to trace the complete system pipeline.");
    setActiveStage("none");

    if (timeline) {
      timeline.pause().progress(0);
    }
    gsap.set(packetRef.current, { opacity: 0, scale: 0, x: 0, y: 0 });
  };

  const handleTriggerDeploy = () => {
    setIsDeploying(true);
    setActiveStage("code");
    setTerminalLog("dev$ git commit -m 'feat: update styling' && git push\nRunning deployment sequence...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsDeploying(false);
        setActiveStage("none");
      }
    });

    setTimeline(tl);

    // Initial packet reveal (x: 25, y: 155)
    gsap.set(packetRef.current, { x: 25, y: 155, opacity: 0, scale: 0.8, backgroundColor: "#FAFAFA" });

    // 1. Code compile
    tl.to(packetRef.current, { opacity: 1, scale: 1, duration: 0.2 })
      .to(packetRef.current, {
        x: 100,
        duration: 0.6,
        ease: "power1.inOut",
        onStart: () => {
          setActiveStage("build");
          setTerminalLog("builder$ docker build -t app:v2 .\nCompiling code layers inside isolated builder container...");
        }
      })
      // 2. Network binding updates
      .to(packetRef.current, {
        x: 210,
        duration: 0.6,
        ease: "power1.inOut",
        onStart: () => {
          setActiveStage("net");
          setTerminalLog("daemon$ docker run -d --name app-container -p 8080:80 app:v2\nUpdating routing proxy bridges and network ports mappings...");
        }
      })
      // 3. Volume mounting checks
      .to(packetRef.current, {
        x: 320,
        duration: 0.6,
        ease: "power1.inOut",
        onStart: () => {
          setActiveStage("volume");
          if (useVolume) {
            setTerminalLog("volume$ Mounting external named volume storage to /var/lib/postgresql/data...");
          } else {
            setTerminalLog("volume$ No volume mapped. Initializing empty local ephemeral filesystem directory...");
          }
        }
      });

    if (useVolume) {
      tl.to(packetRef.current, {
        backgroundColor: "#22c55e",
        duration: 0.2
      })
      .call(() => {
        setTerminalLog("web-front$ 200 OK\n[SUCCESS] Code updated successfully! Named volume 'db-data' preserved your database records intact.");
        setDbDataState("populated");
      })
      .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.3 });
    } else {
      tl.to(packetRef.current, {
        backgroundColor: "#ef4444",
        duration: 0.2
      })
      .call(() => {
        setTerminalLog("web-front$ 200 OK (Data Reset)\n[WARNING] Code updated successfully, but all database transactions were wiped out because no volume was mounted!");
        setDbDataState("empty");
      })
      .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.3 });
    }
  };

  return (
    <VisualCanvas
      objective="Orchestrate the complete stack: configure code updates, build triggers, network bindings, and volume persistency simultaneously."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Full Architecture Simulation
          </div>
          <p>
            Congratulations! You've reached the final wrap-up dashboard. Here, we tie all concepts together: **Dockerfiles**, **Networking**, **Port Maps**, and **Volumes**.
          </p>
          <p>
            Configure volume settings on the right, click **"Edit Code & Deploy"**, and watch the visual deployment cascade. Verify whether database records survive container recreation!
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Full Architecture Schematic Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          <div className="w-full max-w-lg flex items-center justify-between gap-3 relative min-h-[220px]">
            
            {/* Visual pathway connector cables */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden sm:block">
              {/* Code -> Build */}
              <line x1={80} y1={110} x2={150} y2={110} stroke="#1f1f23" strokeWidth="1" strokeDasharray="3" />
              {/* Build -> Net */}
              <line x1={150} y1={110} x2={250} y2={110} stroke="#1f1f23" strokeWidth="1" strokeDasharray="3" />
              {/* Net -> Volume */}
              {useVolume && (
                <line x1={250} y1={110} x2={360} y2={110} stroke="#1f1f23" strokeWidth="1" strokeDasharray="3" />
              )}
            </svg>

            {/* Simulated Packet Orb */}
            <div 
              ref={packetRef}
              className="absolute w-2 h-2 rounded-full z-20 opacity-0 scale-0 shadow-[0_0_8px_currentColor]"
            />

            {/* Col 1: Code Repository */}
            <div className="w-24 shrink-0 text-center z-10">
              <div className={cn(
                "p-2.5 rounded-[12px] border bg-[#0d0d0e] flex flex-col items-center gap-1 transition-all duration-300",
                activeStage === "code" ? "border-white text-white font-bold" : "border-zinc-850 text-zinc-550"
              )}>
                <Folder className="w-4 h-4 text-zinc-500" />
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">Workspace</span>
              </div>
            </div>

            {/* Col 2: Compiler Build Engine */}
            <div className="w-24 shrink-0 text-center z-10">
              <div className={cn(
                "p-2.5 rounded-[12px] border bg-[#0d0d0e] flex flex-col items-center gap-1 transition-all duration-300",
                activeStage === "build" ? "border-white text-white font-bold animate-pulse" : "border-zinc-850 text-zinc-550"
              )}>
                <Server className="w-4 h-4 text-zinc-500" />
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">docker-build</span>
              </div>
            </div>

            {/* Col 3: Container runtime process attached to Net Bridge */}
            <div className="w-24 shrink-0 text-center z-10">
              <div className={cn(
                "p-2.5 rounded-[12px] border bg-[#0d0d0e] flex flex-col items-center gap-1 transition-all duration-300",
                activeStage === "net" ? "border-white text-white font-bold" : "border-zinc-850 text-zinc-400"
              )}>
                <Box className="w-4 h-4 text-zinc-400" />
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">app-container</span>
                <span className="text-[6.5px] text-zinc-550">Port: 8080:80</span>
              </div>
            </div>

            {/* Col 4: Volume mount storage block */}
            <div className="w-24 shrink-0 text-center z-10">
              <div className={cn(
                "p-2.5 rounded-[12px] border bg-[#0d0d0e] flex flex-col items-center gap-1 transition-all duration-500",
                !useVolume 
                  ? "border-dashed border-red-950/20 bg-red-950/5 text-red-500/30 scale-95 opacity-20"
                  : activeStage === "volume"
                    ? "border-white text-white font-bold"
                    : "border-zinc-850 text-zinc-400"
              )}>
                <HardDrive className="w-4 h-4 text-zinc-500" />
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">Volume: db-data</span>
                <span className="text-[6.5px] text-zinc-550">
                  {dbDataState === "populated" ? "Records: 48" : "Records: 0 (Reset)"}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Challenge settings and diagnostics logs panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Simulation Console
            </span>
            <h4 className="text-sm font-extrabold text-white">Full Stack deployment</h4>
            
            <button
              onClick={handleTriggerDeploy}
              disabled={isDeploying}
              className="w-full py-2.5 mt-2 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5 font-sans"
            >
              <Play className="w-3.5 h-3.5 fill-black text-black" />
              Edit Code & Deploy
            </button>
          </div>

          {/* Configuration switches */}
          <div className="p-3 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 flex flex-col gap-2 font-sans select-none text-[8.5px] font-bold">
            <span className="text-[7.5px] font-mono uppercase tracking-wider text-zinc-550 block mb-0.5">Parameters:</span>
            
            <div className="flex items-center justify-between text-[9px]">
              <span>Enable Persistent Volume:</span>
              <button
                onClick={() => setUseVolume(!useVolume)}
                disabled={isDeploying}
                className={cn(
                  "px-2.5 py-1 rounded-[5px] text-[8px] font-bold border transition-all cursor-pointer",
                  useVolume
                    ? "bg-white text-black border-transparent"
                    : "bg-transparent border-zinc-850 text-zinc-500 hover:text-zinc-300"
                )}
              >
                {useVolume ? "MOUNTED" : "UNMOUNTED"}
              </button>
            </div>
          </div>

          {/* Diagnostic logs output */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col min-h-[90px] overflow-hidden select-text font-sans">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0">
              <span className="text-[7.5px] font-mono text-zinc-550 font-bold">Diagnostics logs trace:</span>
            </div>
            <div className="p-3 font-mono text-[9px] leading-relaxed flex-1 overflow-y-auto flex flex-col gap-0.5 select-text">
              {terminalLog.split("\n").map((line, i) => {
                let className = "text-zinc-400";
                if (line.includes("[SUCCESS]") || line.toLowerCase().includes("success") || line.toLowerCase().includes("saved") || line.toLowerCase().includes("retrieved") || line.includes("✓")) {
                  className = "text-green-400 font-semibold";
                } else if (line.includes("[FAILURE]") || line.includes("[WARNING]") || line.toLowerCase().includes("error") || line.toLowerCase().includes("failed") || line.toLowerCase().includes("lost") || line.includes("⚠") || line.toLowerCase().includes("warning")) {
                  className = "text-red-400 font-semibold";
                } else if (line.includes("$") || line.includes("docker") || line.includes("curl")) {
                  className = "text-zinc-550 font-mono";
                }
                return (
                  <div key={i} className={className}>
                    {line}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual warnings / success banners */}
          {!isDeploying && (
            <div className="animate-fadeIn select-text font-sans">
              {useVolume ? (
                dbDataState === "populated" && terminalLog.includes("SUCCESS") && (
                  <div className="p-3.5 rounded-[12px] bg-white/5 border border-white/10 text-[8.5px] text-zinc-305 leading-normal flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-zinc-405 shrink-0 mt-0.5" />
                    <span>
                      **DATA PRESERVED**: Spawning the new container mapped the existing database volume cleanly, preserving user accounts securely!
                    </span>
                  </div>
                )
              ) : (
                dbDataState === "empty" && terminalLog.includes("WARNING") && (
                  <div className="p-3.5 rounded-[12px] bg-red-950/5 border border-red-500/15 text-[8.5px] text-red-405 leading-normal flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      **DATA DELETED**: Because no volume was mapped, rebuilding the container purged the database writable layer completely.
                    </span>
                  </div>
                )
              )}
            </div>
          )}

          {isDeploying && (
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
