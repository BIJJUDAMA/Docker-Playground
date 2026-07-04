"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { HelpCircle, Play, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2, Server, Power } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";

interface Replica {
  id: number;
  name: string;
  status: "running" | "crashed" | "stopped";
}

export default function DockerInProduction() {
  const [scale, setScale] = useState<number>(3);
  const [replicas, setReplicas] = useState<Replica[]>([
    { id: 1, name: "app-replica-1", status: "running" },
    { id: 2, name: "app-replica-2", status: "running" },
    { id: 3, name: "app-replica-3", status: "running" }
  ]);
  const [isTrafficActive, setIsTrafficActive] = useState<boolean>(false);
  const [terminalLog, setTerminalLog] = useState("Configure cluster scale and click 'Send Traffic' to simulate workload balancing.");

  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<HTMLDivElement>(null);

  useAnimationControls(timeline);

  const handleReset = () => {
    setIsTrafficActive(false);
    setReplicas([
      { id: 1, name: "app-replica-1", status: "running" },
      { id: 2, name: "app-replica-2", status: "running" },
      { id: 3, name: "app-replica-3", status: "running" }
    ]);
    setTerminalLog("Configure cluster scale and click 'Send Traffic' to simulate workload balancing.");
    
    if (timeline) {
      timeline.pause().progress(0);
    }
    gsap.set(packetRef.current, { opacity: 0, scale: 0, x: 0, y: 0, backgroundColor: "#FAFAFA" });
  };

  const handleCrashReplica = (id: number) => {
    setReplicas(prev => prev.map(r => r.id === id ? { ...r, status: "crashed" } : r));
    setTerminalLog(`replica-2$ process crashed (Segmentation fault)\n[WARNING] app-replica-2 health check reporting failure!`);

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline();
    setTimeline(tl);

    // Auto healing cycle animation
    tl.to("#replica-node-2", {
      borderColor: "#ef4444",
      scale: 1.05,
      duration: 0.3
    })
    .to("#replica-node-2", {
      opacity: 0.3,
      duration: 0.4,
      onStart: () => {
        setTerminalLog("daemon$ Health check failed. Terminating unhealthy container app-replica-2...");
      }
    })
    .delay(1.0)
    .call(() => {
      setTerminalLog("daemon$ Reinstantiating container replica app-replica-2 from image manifest...");
    })
    .to("#replica-node-2", {
      opacity: 1,
      scale: 1,
      borderColor: "rgba(255, 255, 255, 0.1)",
      duration: 0.5,
      onStart: () => {
        setReplicas(prev => prev.map(r => r.id === id ? { ...r, status: "running" } : r));
        setTerminalLog("daemon$ [SUCCESS] app-replica-2 start success! Container health checks passing.");
      }
    });
  };

  const handleSendTraffic = () => {
    setIsTrafficActive(true);
    setTerminalLog("proxy$ Initiating workload request stream...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsTrafficActive(false);
      }
    });

    setTimeline(tl);

    // Identify running active replicas according to scale limits
    const activeReplicas = replicas.filter(r => r.id <= scale && r.status === "running");

    if (activeReplicas.length === 0) {
      setTerminalLog("proxy$ Error: 503 Service Unavailable\n[FAILURE] No healthy container replicas available in cluster registry.");
      return;
    }

    // Sequence round robin packets
    activeReplicas.forEach((rep, idx) => {
      // Coordinates setup:
      // Load balancer is at x: 20, y: 70
      // Replicas are stacked vertically on the right (x: 280):
      // replica 1: y: 15
      // replica 2: y: 70
      // replica 3: y: 125
      const yPos = rep.id === 1 ? 15 : rep.id === 2 ? 70 : 125;

      tl.call(() => {
        setTerminalLog(`proxy$ Forwarding HTTP request payload to healthy replica ${rep.name}...`);
      })
      .set(packetRef.current, { x: 20, y: 70, opacity: 0, scale: 0.8, backgroundColor: "#FAFAFA" }, `+=${idx * 0.1}`)
      .to(packetRef.current, { opacity: 1, scale: 1, duration: 0.15 })
      .to(packetRef.current, {
        x: 280,
        y: yPos,
        duration: 0.6,
        ease: "power1.inOut"
      })
      .to(packetRef.current, {
        backgroundColor: "#22c55e",
        duration: 0.15
      })
      .to(packetRef.current, {
        x: 20,
        y: 70,
        duration: 0.5,
        ease: "power2.inOut"
      })
      .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.1 });
    });

    tl.call(() => {
      setTerminalLog("proxy$ [SUCCESS] All load balanced requests finished cleanly with 200 OK headers.");
    });
  };

  useEffect(() => {
    handleReset();
  }, [scale]);

  return (
    <VisualCanvas
      objective="Explore clustering operations: scale container counts and test self-healing container recovery systems."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Docker in Production
          </div>
          <p>
            In production deployments, you run **multiple container replicas** of the same image behind a Load Balancer proxy to distribute CPU/memory workload loads and ensure high availability.
          </p>
          <p>
            If a container process crashes, Docker's **Health-Check daemon** detects the exit, destroys the dead container, and automatically spawns a fresh healthy copy, ensuring zero downtime self-healing!
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Sandbox Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          <div className="w-full max-w-sm flex items-center justify-between gap-4 relative min-h-[220px]">
            
            {/* Pathway wire graphics */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden sm:block">
              {Array.from({ length: scale }).map((_, i) => {
                const targetY = i === 0 ? 35 : i === 1 ? 90 : 145;
                return (
                  <line
                    key={i}
                    x1={80}
                    y1={90}
                    x2={260}
                    y2={targetY}
                    stroke="#1f1f23"
                    strokeWidth="1"
                    strokeDasharray="3"
                  />
                );
              })}
            </svg>

            {/* Load balancer request packet */}
            <div 
              ref={packetRef}
              className="absolute w-2.5 h-2.5 rounded-full z-20 opacity-0 scale-0 shadow-[0_0_8px_currentColor]"
            />

            {/* Left: Load Balancer node */}
            <div className="w-24 z-10">
              <div className="py-2.5 px-3 rounded-[9px] border border-zinc-850 bg-[#0d0d0e] text-center flex flex-col items-center justify-center gap-1.5 shadow-inner">
                <Server className="w-5 h-5 text-zinc-550 shrink-0" />
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-200">Load Balancer</span>
              </div>
            </div>

            {/* Right: Replicas stack */}
            <div className="flex flex-col gap-2.5 w-36 z-10">
              {replicas.map((rep) => {
                const isActive = rep.id <= scale;
                const isCrashed = rep.status === "crashed";
                
                if (!isActive) return null;

                return (
                  <div key={rep.id} id={`replica-node-${rep.id}`} className="transition-all duration-300">
                    <NodePrimitive
                      label={rep.name}
                      status={isCrashed ? "crashed" : "running"}
                      icon={<Server className="w-3.5 h-3.5" />}
                      subtitle={isCrashed ? "health check failed" : "healthy"}
                      className="py-1 px-2 rounded-[8px]"
                    />
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
              Clustering Controls
            </span>
            <h4 className="text-sm font-extrabold text-white">Cluster management</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text font-sans">
              Alter scaling bounds and test self-healing loops.
            </p>
          </div>

          <div className="flex flex-col gap-3 flex-1 justify-center select-none font-sans">
            
            {/* Scale count selector */}
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span>Cluster Replica Scale:</span>
              <div className="flex rounded-[6px] border border-zinc-800 bg-[#0d0d0e] p-0.5 overflow-hidden">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setScale(num)}
                    disabled={isTrafficActive}
                    className={cn(
                      "px-2.5 py-1 rounded-[4px] border-0 text-[9px] font-bold transition-all cursor-pointer disabled:opacity-40",
                      scale === num ? "bg-white text-black" : "bg-transparent text-zinc-550 hover:text-zinc-350"
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={handleSendTraffic}
                disabled={isTrafficActive}
                className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5"
              >
                Send Request Traffic
              </button>
              
              {scale >= 2 && (
                <button
                  onClick={() => handleCrashReplica(2)}
                  disabled={isTrafficActive || replicas[1].status === "crashed"}
                  className="w-full py-2.5 rounded-[9px] text-[10px] font-bold bg-red-950/15 border border-red-500/20 text-red-400 hover:bg-red-950/30 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Power className="w-3.5 h-3.5 shrink-0" />
                  Simulate Replica 2 Crash
                </button>
              )}
            </div>

          </div>

          {/* Diagnostic logs */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col min-h-[90px] overflow-hidden select-text font-sans">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0">
              <span className="text-[7.5px] font-mono text-zinc-550 font-bold">Cluster state output:</span>
            </div>
            <div className="p-3 font-mono text-[9px] text-zinc-400 leading-relaxed flex-1 overflow-y-auto">
              {terminalLog}
            </div>
          </div>

          {replicas[1].status === "crashed" && (
            <div className="p-3.5 rounded-[12px] bg-red-950/5 border border-red-500/15 text-[8.5px] text-red-405 leading-normal flex items-start gap-2 animate-fadeIn select-text font-sans">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                **SELF-HEALING DETECTED**: Health monitoring has detected a container crash. Triggering restart container task sequence automatically.
              </span>
            </div>
          )}

          {replicas[1].status === "running" && terminalLog.includes("Reinstantiating container") && (
            <div className="p-3.5 rounded-[12px] bg-white/5 border border-white/10 text-[8.5px] text-zinc-305 leading-normal flex items-start gap-2 animate-fadeIn select-text font-sans">
              <CheckCircle2 className="w-4 h-4 text-zinc-405 shrink-0 mt-0.5" />
              <span>
                **HEALED SUCCESSFULLY!** Healthy app-replica-2 node started and re-registered behind proxy endpoint routing automatically.
              </span>
            </div>
          )}

          {isTrafficActive && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Cluster
            </button>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
