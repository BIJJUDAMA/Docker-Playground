"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { HelpCircle, Play, RotateCcw, CheckCircle2 } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { useAnimationStore } from "@/stores/animationStore";

type ErrorState = "none" | "backend_down" | "db_down" | "wrong_port" | "net_disconnect";

interface NetHop {
  id: string;
  label: string;
}

const HOPS: NetHop[] = [
  { id: "browser", label: "Browser" },
  { id: "host", label: "Host Port (8080)" },
  { id: "network", label: "Docker Network" },
  { id: "front", label: "Frontend App" },
  { id: "back", label: "Backend Service" },
  { id: "db", label: "Postgres Database" }
];

interface CoordsState {
  wireY: number;
  hopX: Record<string, number>;
  hopBottomY: Record<string, number>;
}

export default function PacketJourney() {
  const [activeError, setActiveError] = useState<ErrorState>("none");
  const { isPlaying, setPlaying } = useAnimationStore();
  const [terminalLog, setTerminalLog] = useState("Configure error scenarios and click 'Send Request' to watch packet trace.");

  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  const sandboxRef = useRef<HTMLDivElement>(null);
  const hopRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const packetRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<CoordsState | null>(null);

  useAnimationControls(timeline);

  const updateCoords = useCallback(() => {
    const sandboxEl = sandboxRef.current;
    if (!sandboxEl) return;

    const sRect = sandboxEl.getBoundingClientRect();
    const newHopX: Record<string, number> = {};
    const newHopBottomY: Record<string, number> = {};

    HOPS.forEach(hop => {
      const el = hopRefs.current[hop.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        newHopX[hop.id] = (rect.left + rect.width / 2) - sRect.left;
        newHopBottomY[hop.id] = rect.bottom - sRect.top;
      }
    });

    const wireY = (newHopBottomY["browser"] || 0) + 16;

    setCoords({
      wireY,
      hopX: newHopX,
      hopBottomY: newHopBottomY
    });
  }, []);

  const handleReset = () => {
    setPlaying(false);
    setTerminalLog("Configure error scenarios and click 'Send Request' to watch packet trace.");

    if (timeline) {
      timeline.pause().progress(0);
    }

    if (coords) {
      gsap.set(packetRef.current, { 
        x: coords.hopX["browser"] || 0, 
        y: coords.wireY - 5, 
        opacity: 0, 
        scale: 0, 
        backgroundColor: "#FAFAFA" 
      });
    }

    // Reset styles on all cards to default
    HOPS.forEach(h => {
      gsap.set(`#hop-node-${h.id}`, { 
        clearProps: "borderColor,scale,color" 
      });
      gsap.set(`#drop-wire-${h.id}`, {
        stroke: "#1f1f23"
      });
    });
  };

  const handleSendRequest = () => {
    // Refresh layout coordinates
    updateCoords();

    // Explicitly reset any previous error styles or active states first
    HOPS.forEach(h => {
      gsap.set(`#hop-node-${h.id}`, { 
        clearProps: "borderColor,scale,color" 
      });
      gsap.set(`#drop-wire-${h.id}`, {
        stroke: "#1f1f23"
      });
    });

    const sandboxEl = sandboxRef.current;
    if (!sandboxEl) return;

    const sRect = sandboxEl.getBoundingClientRect();
    const currentHopX: Record<string, number> = {};
    const currentHopBottomY: Record<string, number> = {};

    HOPS.forEach(hop => {
      const el = hopRefs.current[hop.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        currentHopX[hop.id] = (rect.left + rect.width / 2) - sRect.left;
        currentHopBottomY[hop.id] = rect.bottom - sRect.top;
      }
    });

    const wireY = (currentHopBottomY["browser"] || 0) + 16;
    const packetY = wireY - 5; 

    setPlaying(true);
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

    // Initial packet reveal at browser
    gsap.set(packetRef.current, { 
      left: 0,
      top: 0,
      x: currentHopX["browser"], 
      y: packetY, 
      opacity: 0, 
      scale: 0.8, 
      backgroundColor: "#FAFAFA" 
    });

    // Highlight browser node at startup
    tl.to(packetRef.current, { opacity: 1, scale: 1, duration: 0.2 })
      .to("#hop-node-browser", { borderColor: "#ffffff", scale: 1.05, color: "#ffffff", duration: 0.2 }, 0)
      .to("#drop-wire-browser", { stroke: "#FAFAFA", duration: 0.2 }, 0)

      // Browser -> Host
      .to(packetRef.current, {
        x: currentHopX["host"],
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => {
          setTerminalLog("Routing request to host interface network port 8080...");
        }
      })
      .to("#hop-node-browser", { borderColor: "rgba(255, 255, 255, 0.1)", scale: 1, color: "rgba(255, 255, 255, 0.35)", duration: 0.3 }, "-=0.8")
      .to("#drop-wire-browser", { stroke: "#1f1f23", duration: 0.3 }, "-=0.8")
      .to("#hop-node-host", { borderColor: "#ffffff", scale: 1.05, color: "#ffffff", duration: 0.3 }, "-=0.5")
      .to("#drop-wire-host", { stroke: "#FAFAFA", duration: 0.3 }, "-=0.5");

    // Check wrong port error
    if (activeError === "wrong_port") {
      tl.to(packetRef.current, {
        scale: 1.3,
        backgroundColor: "#ef4444",
        duration: 0.2
      })
      .to("#hop-node-host", {
        borderColor: "#ef4444",
        scale: 1.08,
        color: "#ef4444",
        duration: 0.3
      }, "-=0.15")
      .call(() => {
        setTerminalLog("host$ Connection Refused!\n[FAILURE] Host port 8080 is not mapped to any active container. Packet dropped.");
      })
      .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.4 });
      return;
    }

    // Host -> Network
    tl.to(packetRef.current, {
      x: currentHopX["network"],
      duration: 0.8,
      ease: "power1.inOut",
      onStart: () => {
        setTerminalLog("Docker engine forwarding packet from host port 8080 down into container virtual bridge network namespaces...");
      }
    })
    .to("#hop-node-host", { borderColor: "rgba(255, 255, 255, 0.1)", scale: 1, color: "rgba(255, 255, 255, 0.35)", duration: 0.3 }, "-=0.8")
    .to("#drop-wire-host", { stroke: "#1f1f23", duration: 0.3 }, "-=0.8")
    .to("#hop-node-network", { borderColor: "#ffffff", scale: 1.05, color: "#ffffff", duration: 0.3 }, "-=0.5")
    .to("#drop-wire-network", { stroke: "#FAFAFA", duration: 0.3 }, "-=0.5");

    // Check network disconnected error
    if (activeError === "net_disconnect") {
      tl.to(packetRef.current, {
        scale: 1.3,
        backgroundColor: "#ef4444",
        duration: 0.2
      })
      .to("#hop-node-network", {
        borderColor: "#ef4444",
        scale: 1.08,
        color: "#ef4444",
        duration: 0.3
      }, "-=0.15")
      .call(() => {
        setTerminalLog("bridge$ Destination Host Unreachable\n[FAILURE] Container is disconnected from bridge network namespaces. Virtual interface down.");
      })
      .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.4 });
      return;
    }

    // Network -> Frontend
    tl.to(packetRef.current, {
      x: currentHopX["front"],
      duration: 0.8,
      ease: "power1.inOut",
      onStart: () => {
        setTerminalLog("Frontend container (web-front) processing landing page assets...");
      }
    })
    .to("#hop-node-network", { borderColor: "rgba(255, 255, 255, 0.1)", scale: 1, color: "rgba(255, 255, 255, 0.35)", duration: 0.3 }, "-=0.8")
    .to("#drop-wire-network", { stroke: "#1f1f23", duration: 0.3 }, "-=0.8")
    .to("#hop-node-front", { borderColor: "#ffffff", scale: 1.05, color: "#ffffff", duration: 0.3 }, "-=0.5")
    .to("#drop-wire-front", { stroke: "#FAFAFA", duration: 0.3 }, "-=0.5");

    // Frontend -> Backend
    tl.to(packetRef.current, {
      x: currentHopX["back"],
      duration: 0.8,
      ease: "power1.inOut",
      onStart: () => {
        setTerminalLog("web-front routing proxy API request to backend api-service container...");
      }
    })
    .to("#hop-node-front", { borderColor: "rgba(255, 255, 255, 0.1)", scale: 1, color: "rgba(255, 255, 255, 0.35)", duration: 0.3 }, "-=0.8")
    .to("#drop-wire-front", { stroke: "#1f1f23", duration: 0.3 }, "-=0.8")
    .to("#hop-node-back", { borderColor: "#ffffff", scale: 1.05, color: "#ffffff", duration: 0.3 }, "-=0.5")
    .to("#drop-wire-back", { stroke: "#FAFAFA", duration: 0.3 }, "-=0.5");

    // Check backend down error
    if (activeError === "backend_down") {
      tl.to(packetRef.current, {
        scale: 1.3,
        backgroundColor: "#ef4444",
        duration: 0.2
      })
      .to("#hop-node-back", {
        borderColor: "#ef4444",
        scale: 1.08,
        color: "#ef4444",
        duration: 0.3
      }, "-=0.15")
      .call(() => {
        setTerminalLog("api-service$ Error: Connection Reset By Peer\n[FAILURE] Backend container processes crashed or stopped. Returns 502 Bad Gateway error.");
      })
      .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.4 });
      return;
    }

    // Backend -> Database
    tl.to(packetRef.current, {
      x: currentHopX["db"],
      duration: 0.8,
      ease: "power1.inOut",
      onStart: () => {
        setTerminalLog("api-service querying database postgresql container for records catalog...");
      }
    })
    .to("#hop-node-back", { borderColor: "rgba(255, 255, 255, 0.1)", scale: 1, color: "rgba(255, 255, 255, 0.35)", duration: 0.3 }, "-=0.8")
    .to("#drop-wire-back", { stroke: "#1f1f23", duration: 0.3 }, "-=0.8")
    .to("#hop-node-db", { borderColor: "#ffffff", scale: 1.05, color: "#ffffff", duration: 0.3 }, "-=0.5")
    .to("#drop-wire-db", { stroke: "#FAFAFA", duration: 0.3 }, "-=0.5");

    // Check database down error
    if (activeError === "db_down") {
      tl.to(packetRef.current, {
        scale: 1.3,
        backgroundColor: "#ef4444",
        duration: 0.2
      })
      .to("#hop-node-db", {
        borderColor: "#ef4444",
        scale: 1.08,
        color: "#ef4444",
        duration: 0.3
      }, "-=0.15")
      .call(() => {
        setTerminalLog("postgres$ Fatal: connection authentication failed\n[FAILURE] PostgreSQL service is offline or credentials incorrect. Returns 500 Server Error.");
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
      x: currentHopX["browser"],
      duration: 2.0,
      ease: "power2.inOut",
      onStart: () => {
        setTerminalLog("HTTP Response code 200 OK returning back browser client...");
      }
    })
    .to("#hop-node-db", { borderColor: "rgba(255, 255, 255, 0.1)", scale: 1, color: "rgba(255, 255, 255, 0.35)", duration: 0.4 }, "-=2.0")
    .to("#drop-wire-db", { stroke: "#1f1f23", duration: 0.4 }, "-=2.0")
    .to("#hop-node-browser", { borderColor: "#ffffff", scale: 1.05, color: "#ffffff", duration: 0.4 }, "-=0.4")
    .to("#drop-wire-browser", { stroke: "#FAFAFA", duration: 0.4 }, "-=0.4")
    .call(() => {
      setTerminalLog("browser$ 200 OK\n[SUCCESS] Request completed! Page rendered dynamically with full database stats catalog.");
    })
    .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.3 });
  };

  useEffect(() => {
    handleReset();
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("resize", updateCoords);
    };
  }, [activeError]);

  // Initial layout coordinate computation
  useEffect(() => {
    const timeout = setTimeout(updateCoords, 100);
    return () => clearTimeout(timeout);
  }, [updateCoords]);

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
        <div 
          ref={sandboxRef} 
          className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden"
        >
          
          <div className="w-full flex items-center justify-between gap-1.5 relative min-h-[140px] py-4">
            
            {/* Pathway track wires (Dynamically Calculated) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {coords && (
                <>
                  {/* Horizontal track line */}
                  <line 
                    x1={coords.hopX["browser"]} 
                    y1={coords.wireY} 
                    x2={coords.hopX["db"]} 
                    y2={coords.wireY} 
                    stroke="#1f1f23" 
                    strokeWidth="1" 
                    strokeDasharray="3" 
                  />
                  
                  {/* Vertical dropdown wires */}
                  {HOPS.map((hop) => (
                    <line
                      key={hop.id}
                      id={`drop-wire-${hop.id}`}
                      x1={coords.hopX[hop.id]}
                      y1={coords.hopBottomY[hop.id]}
                      x2={coords.hopX[hop.id]}
                      y2={coords.wireY}
                      stroke="#1f1f23"
                      strokeWidth="1"
                      strokeDasharray="2"
                    />
                  ))}
                </>
              )}
            </svg>

            {/* Request Packet Orb */}
            <div
              ref={packetRef}
              className="absolute w-2.5 h-2.5 rounded-full pointer-events-none z-20 opacity-0 scale-0 shadow-[0_0_8px_rgba(250,250,250,0.6)] bg-white text-white"
            />

            {/* Hop Nodes (Responsive Flexbox Grid) */}
            {HOPS.map((hop) => {
              return (
                <div 
                  key={hop.id} 
                  id={`hop-node-${hop.id}`}
                  ref={el => { hopRefs.current[hop.id] = el; }}
                  className="flex-1 p-2 rounded-[8px] border border-zinc-850 bg-[#0d0d0e] text-zinc-550 text-center flex flex-col justify-center gap-0.5 z-10 select-text max-w-[90px] min-h-[54px] transition-all"
                >
                  <span className="text-[6.5px] uppercase tracking-wider font-mono font-bold select-none opacity-60">Node</span>
                  <span className="text-[7.5px] leading-tight font-bold font-sans">{hop.label}</span>
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
              className="w-full py-2 mt-2 rounded-[8px] text-[10px] font-bold bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-all border-0 cursor-pointer flex items-center justify-center gap-1 select-none font-sans"
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
            <div className="p-3 font-mono text-[9px] leading-relaxed overflow-y-auto flex-1 select-text flex flex-col gap-0.5">
              {terminalLog.split("\n").map((line, i) => {
                let className = "text-zinc-400";
                if (line.includes("[SUCCESS]") || line.toLowerCase().includes("success") || line.includes("✓")) {
                  className = "text-green-400 font-semibold";
                } else if (line.includes("[FAILURE]") || line.toLowerCase().includes("error") || line.toLowerCase().includes("fatal") || line.toLowerCase().includes("failed") || line.includes("⚠")) {
                  className = "text-red-400 font-semibold";
                } else if (line.includes("$")) {
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

          {!isPlaying && activeError === "none" && terminalLog.includes("200 OK") && (
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
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none font-sans"
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
