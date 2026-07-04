"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { HelpCircle, Play, RotateCcw, AlertTriangle, Monitor, ShieldAlert, CheckCircle2 } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { useAnimationStore } from "@/stores/animationStore";

type ErrorState = "none" | "backend_down" | "db_down" | "wrong_port" | "net_disconnect";

interface NetHop {
  id: string;
  label: string;
  x: number; // coordinate placement
}

const HOPS: NetHop[] = [
  { id: "browser", label: "Browser", x: 30 },
  { id: "host", label: "Host Port (8080)", x: 120 },
  { id: "network", label: "Docker Network", x: 210 },
  { id: "front", label: "Frontend App", x: 300 },
  { id: "back", label: "Backend Service", x: 390 },
  { id: "db", label: "Postgres Database", x: 480 }
];

export default function PacketJourney() {
  const [activeError, setActiveError] = useState<ErrorState>("none");
  const { isPlaying, setPlaying } = useAnimationStore();
  const [activeHopId, setActiveHopId] = useState<string>("browser");
  const [terminalLog, setTerminalLog] = useState("Configure error scenarios and click 'Send Request' to watch packet trace.");

  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<HTMLDivElement>(null);

  useAnimationControls(timeline);

  const handleReset = () => {
    setPlaying(false);
    setActiveHopId("browser");
    setTerminalLog("Configure error scenarios and click 'Send Request' to watch packet trace.");

    if (timeline) {
      timeline.pause().progress(0);
    }

    gsap.set(packetRef.current, { x: 30, opacity: 0, scale: 0, backgroundColor: "#FAFAFA" });
    HOPS.forEach(h => {
      gsap.set(`#hop-node-${h.id}`, { clearProps: "all" });
    });
  };

  const handleSendRequest = () => {
    setPlaying(true);
    setActiveHopId("browser");
    setTerminalLog("browser$ fetch('http://localhost:8080')\nPackaging HTTP Request payload packet...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setPlaying(false);
      }
    });

    setTimeline(tl);

    // Initial packet reveal at browser (x: 30)
    gsap.set(packetRef.current, { x: 30, opacity: 0, scale: 0.8, backgroundColor: "#FAFAFA" });
    tl.to(packetRef.current, { opacity: 1, scale: 1, duration: 0.2 })

      // Browser -> Host (x: 120)
      .to(packetRef.current, {
        x: 120,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => {
          setActiveHopId("host");
          setTerminalLog("Routing request to host interface network port 8080...");
        }
      });

    // Check wrong port error
    if (activeError === "wrong_port") {
      tl.to(packetRef.current, {
        scale: 1.3,
        backgroundColor: "#ef4444",
        duration: 0.2
      })
      .call(() => {
        setTerminalLog("host$ Connection Refused!\n[FAILURE] Host port 8080 is not mapped to any active container. Packet dropped.");
        gsap.to("#hop-node-host", { borderColor: "#ef4444", scale: 1.05, duration: 0.3 });
      })
      .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.4 });
      return;
    }

    // Host -> Network (x: 210)
    tl.to(packetRef.current, {
      x: 210,
      duration: 0.8,
      ease: "power1.inOut",
      onStart: () => {
        setActiveHopId("network");
        setTerminalLog("Docker engine forwarding packet from host port 8080 down into container virtual bridge network namespaces...");
      }
    });

    // Check network disconnected error
    if (activeError === "net_disconnect") {
      tl.to(packetRef.current, {
        scale: 1.3,
        backgroundColor: "#ef4444",
        duration: 0.2
      })
      .call(() => {
        setTerminalLog("bridge$ Destination Host Unreachable\n[FAILURE] Container is disconnected from bridge network namespaces. Virtual interface down.");
        gsap.to("#hop-node-network", { borderColor: "#ef4444", scale: 1.05, duration: 0.3 });
      })
      .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.4 });
      return;
    }

    // Network -> Frontend (x: 300)
    tl.to(packetRef.current, {
      x: 300,
      duration: 0.8,
      ease: "power1.inOut",
      onStart: () => {
        setActiveHopId("front");
        setTerminalLog("Frontend container (web-front) processing landing page assets...");
      }
    })

    // Frontend -> Backend (x: 390)
    .to(packetRef.current, {
      x: 390,
      duration: 0.8,
      ease: "power1.inOut",
      onStart: () => {
        setActiveHopId("back");
        setTerminalLog("web-front routing proxy API request to backend api-service container...");
      }
    });

    // Check backend down error
    if (activeError === "backend_down") {
      tl.to(packetRef.current, {
        scale: 1.3,
        backgroundColor: "#ef4444",
        duration: 0.2
      })
      .call(() => {
        setTerminalLog("api-service$ Error: Connection Reset By Peer\n[FAILURE] Backend container processes crashed or stopped. Returns 502 Bad Gateway error.");
        gsap.to("#hop-node-back", { borderColor: "#ef4444", scale: 1.05, duration: 0.3 });
      })
      .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.4 });
      return;
    }

    // Backend -> Database (x: 480)
    tl.to(packetRef.current, {
      x: 480,
      duration: 0.8,
      ease: "power1.inOut",
      onStart: () => {
        setActiveHopId("db");
        setTerminalLog("api-service querying database postgresql container for records catalog...");
      }
    });

    // Check database down error
    if (activeError === "db_down") {
      tl.to(packetRef.current, {
        scale: 1.3,
        backgroundColor: "#ef4444",
        duration: 0.2
      })
      .call(() => {
        setTerminalLog("postgres$ Fatal: connection authentication failed\n[FAILURE] PostgreSQL service is offline or credentials incorrect. Returns 500 Server Error.");
        gsap.to("#hop-node-db", { borderColor: "#ef4444", scale: 1.05, duration: 0.3 });
      })
      .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.4 });
      return;
    }

    // Database responds and packets return back to browser (reverse trace)
    tl.to(packetRef.current, {
      backgroundColor: "#22c55e",
      duration: 0.2,
      onStart: () => {
        setTerminalLog("postgres$ query success\n[SUCCESS] Returning database records payload...");
      }
    })
    .to(packetRef.current, {
      x: 30,
      duration: 2.0,
      ease: "power2.inOut",
      onStart: () => {
        setActiveHopId("front");
        setTerminalLog("HTTP Response code 200 OK returning back browser client...");
      }
    })
    .call(() => {
      setActiveHopId("browser");
      setTerminalLog("browser$ 200 OK\n[SUCCESS] Request completed! Page rendered dynamically with full database stats catalog.");
    })
    .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.3 });
  };

  useEffect(() => {
    handleReset();
  }, [activeError]);

  return (
    <VisualCanvas
      objective="Trace a browser HTTP request step-by-step as it tunnels through port maps, bridge subnets, and backend APIs."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Packet Hops Pipeline
          </div>
          <p>
            When a user visits a container site, requests undergo multiple translation boundaries. First, the host forwards the port, the virtual bridge routes packets to the correct container, and container scripts query sibling services.
          </p>
          <p>
            Choose an **Error Scenario** on the right and trigger a request to watch exactly where routing falls apart and blocks traffic.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Schematic pipeline Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-x-auto custom-scrollbar">
          
          <div className="w-[520px] h-32 relative flex items-center justify-between py-2 px-6">
            
            {/* Pathway track wire */}
            <div className="absolute top-[41px] left-[35px] right-[35px] h-0.5 border-t border-dashed border-zinc-850 pointer-events-none z-0" />

            {/* Request Packet Orb */}
            <div
              ref={packetRef}
              className="absolute w-2.5 h-2.5 rounded-full top-[37px] left-0 pointer-events-none z-20 opacity-0 scale-0 shadow-[0_0_8px_currentColor]"
            />

            {/* Hop Nodes */}
            {HOPS.map((hop) => {
              const isActive = activeHopId === hop.id;
              return (
                <div 
                  key={hop.id} 
                  id={`hop-node-${hop.id}`}
                  className={cn(
                    "w-16 p-2 rounded-[8px] border text-center transition-all duration-300 flex flex-col justify-center gap-1 z-10",
                    isActive 
                      ? "bg-white/5 border-white text-white font-bold scale-105" 
                      : "bg-[#0d0d0e] border-zinc-850 text-zinc-550"
                  )}
                  style={{ width: "70px" }}
                >
                  <span className="text-[7px] uppercase tracking-wider font-mono font-bold">Node</span>
                  <span className="text-[7.5px] truncate max-w-full font-bold">{hop.label}</span>
                </div>
              );
            })}

          </div>

        </div>

        {/* Selected scenarios and diagnostic details panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Request Controls
            </span>
            <h4 className="text-sm font-extrabold text-white">Scenario selection</h4>
            
            {/* Send Request Button */}
            <button
              onClick={handleSendRequest}
              disabled={isPlaying}
              className="w-full py-2 mt-2 rounded-[8px] text-[10px] font-bold bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-all border-0 cursor-pointer flex items-center justify-center gap-1 select-none"
            >
              <Play className="w-3 h-3 fill-black text-black" />
              Send Request Packet
            </button>
          </div>

          {/* Scenario options grid */}
          <div className="p-3 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 flex flex-col gap-2 font-sans select-none text-[8.5px] font-bold">
            <span className="text-[7.5px] font-mono uppercase tracking-wider text-zinc-550 block mb-0.5">Scenarios:</span>
            
            {(["none", "wrong_port", "net_disconnect", "backend_down", "db_down"] as ErrorState[]).map((state) => (
              <button
                key={state}
                onClick={() => setActiveError(state)}
                disabled={isPlaying}
                className={cn(
                  "py-1.5 px-2.5 rounded-[5px] border text-left transition-colors cursor-pointer disabled:opacity-40",
                  activeError === state
                    ? "bg-white text-black border-transparent"
                    : "bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-zinc-200"
                )}
              >
                {state === "none" && "✓ Normal Request Route"}
                {state === "wrong_port" && "⚠ Host Port 8080 Unmapped"}
                {state === "net_disconnect" && "⚠ Container Disconnected"}
                {state === "backend_down" && "⚠ api-service Crashed"}
                {state === "db_down" && "⚠ Database Offline"}
              </button>
            ))}
          </div>

          {/* Diagnostic trace log */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col min-h-[90px] overflow-hidden select-text font-sans">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0">
              <span className="text-[7.5px] font-mono text-zinc-550 font-bold">Trace output:</span>
            </div>
            <div className="p-3 font-mono text-[9px] text-zinc-400 leading-relaxed flex-1 overflow-y-auto">
              {terminalLog}
            </div>
          </div>

          {activeHopId === "browser" && !isPlaying && activeError === "none" && terminalLog.includes("200 OK") && (
            <div className="p-3.5 rounded-[12px] bg-white/5 border border-white/10 text-[8.5px] text-zinc-300 leading-normal flex items-start gap-2 animate-fadeIn select-text font-sans">
              <CheckCircle2 className="w-4 h-4 text-zinc-350 shrink-0 mt-0.5" />
              <span>
                **TRANSACTION SECURE!** Request passed all boundaries, loaded database rows, and returned static layouts correctly.
              </span>
            </div>
          )}

          {activeError !== "none" && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Scenario
            </button>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
