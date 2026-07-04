"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { HelpCircle, Play, RotateCcw, AlertTriangle, CheckCircle2, ShieldCheck, Database, Server, RefreshCw } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";

export default function DnsServiceDiscovery() {
  const [useDnsName, setUseDnsName] = useState<boolean>(true);
  const [backendIp, setBackendIp] = useState<string>("172.18.0.3");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [terminalLog, setTerminalLog] = useState("Click 'Send Request' to query backend service.");
  const [activeHopId, setActiveHopId] = useState<"front" | "dns" | "back" | "none">("none");

  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<HTMLDivElement>(null);

  useAnimationControls(timeline);

  const handleReset = () => {
    setIsPlaying(false);
    setBackendIp("172.18.0.3");
    setTerminalLog("Click 'Send Request' to query backend service.");
    setActiveHopId("none");

    if (timeline) {
      timeline.pause().progress(0);
    }

    gsap.set(packetRef.current, { opacity: 0, scale: 0, x: 0, y: 0, backgroundColor: "#FAFAFA" });
  };

  const handleRecreateBackend = () => {
    // Recreate container alters its IP dynamically (simulating standard DHCP allocation)
    const newIp = backendIp === "172.18.0.3" ? "172.18.0.9" : "172.18.0.3";
    setBackendIp(newIp);
    setTerminalLog(`host$ docker rm -f api-service && docker run -d --name api-service ...\n[SUCCESS] Recreated Backend api-service. Dynamic IP changed to ${newIp}!`);
  };

  const handleSendRequest = () => {
    setIsPlaying(true);
    setActiveHopId("front");
    
    const requestTarget = useDnsName ? "http://api-service:8080" : `http://172.18.0.3:8080`;
    setTerminalLog(`web-front$ curl ${requestTarget}\nInitiating network socket query...`);

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsPlaying(false);
      }
    });

    setTimeline(tl);

    // Initial packet reveal at Frontend (x: 40, y: 110)
    gsap.set(packetRef.current, { x: 40, y: 110, opacity: 0, scale: 0.8, backgroundColor: "#FAFAFA" });
    
    if (useDnsName) {
      // 1. Packet travels up to Docker DNS node (x: 180, y: 30)
      tl.to(packetRef.current, { opacity: 1, scale: 1, duration: 0.2 })
        .to(packetRef.current, {
          x: 180,
          y: 30,
          duration: 0.8,
          ease: "power1.inOut",
          onStart: () => {
            setActiveHopId("dns");
            setTerminalLog(`web-front querying local Docker DNS bridge nameserver for 'api-service' alias...`);
          }
        })
        .to(packetRef.current, {
          scale: 1.25,
          duration: 0.2
        })
        .call(() => {
          setTerminalLog(`dns$ Resolved 'api-service' to IP: ${backendIp}\nUpdating packet headers target.`);
        })
        .to(packetRef.current, {
          scale: 1,
          duration: 0.2
        })
        // 2. Packet travels down to Backend node (x: 320, y: 110)
        .to(packetRef.current, {
          x: 320,
          y: 110,
          duration: 0.8,
          ease: "power1.inOut",
          onStart: () => {
            setActiveHopId("back");
            setTerminalLog(`Routing transaction packet to resolved endpoint ${backendIp}:8080...`);
          }
        })
        .to(packetRef.current, {
          backgroundColor: "#22c55e",
          duration: 0.2
        })
        .to(packetRef.current, {
          x: 40,
          y: 110,
          duration: 1.0,
          ease: "power2.inOut",
          onStart: () => {
            setActiveHopId("front");
            setTerminalLog("API payload returned back to web-front container!");
          }
        })
        .call(() => {
          setActiveHopId("none");
          setTerminalLog(`web-front$ 200 OK\n[SUCCESS] Request reached backend using DNS resolution!`);
        })
        .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.3 });

    } else {
      // Direct IP query route (straight from Frontend (x: 40, y: 110) to Backend (x: 320, y: 110))
      tl.to(packetRef.current, { opacity: 1, scale: 1, duration: 0.2 })
        .to(packetRef.current, {
          x: 320,
          y: 110,
          duration: 1.0,
          ease: "power2.inOut",
          onStart: () => {
            setActiveHopId("back");
            setTerminalLog(`Sending socket query packet directly to absolute destination address 172.18.0.3:8080...`);
          }
        });

      if (backendIp !== "172.18.0.3") {
        // IP mismatch error!
        tl.to(packetRef.current, {
          scale: 1.3,
          backgroundColor: "#ef4444",
          duration: 0.2
        })
        .call(() => {
          setTerminalLog(`curl$ Connection timed out!\n[FAILURE] Target IP 172.18.0.3 does not exist or has no running process. api-service is now at ${backendIp}.`);
        })
        .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.4 });
      } else {
        // Success
        tl.to(packetRef.current, {
          backgroundColor: "#22c55e",
          duration: 0.2
        })
        .to(packetRef.current, {
          x: 40,
          y: 110,
          duration: 1.0,
          ease: "power2.inOut",
          onStart: () => {
            setActiveHopId("front");
            setTerminalLog("Returned backend response.");
          }
        })
        .call(() => {
          setActiveHopId("none");
          setTerminalLog("web-front$ 200 OK\n[SUCCESS] Request reached backend successfully using fixed IP address.");
        })
        .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.3 });
      }
    }
  };

  return (
    <VisualCanvas
      objective="Understand Docker's internal DNS resolving engine and why service alias names prevent hardcoded IP breakage."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Service Discovery DNS
          </div>
          <p>
            When a container is deleted and recreated, Docker allocates it a **dynamic IP address** from its DHCP pool. Hardcoding IPs (e.g. `172.18.0.3`) causes backend connection breakage on recreations.
          </p>
          <p>
            Instead, containers on the same network use Docker's **built-in DNS Server**. Writing the container's service name alias (like `api-service`) lets Docker resolve IPs dynamically, maintaining active routes.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Sandbox DNS Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          <div className="w-full max-w-sm flex flex-col items-center justify-center relative min-h-[220px]">
            
            {/* Visual links */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden sm:block">
              {/* Front -> DNS */}
              <line x1={80} y1={130} x2={220} y2={50} stroke="#1f1f23" strokeWidth="1" strokeDasharray="3" />
              {/* DNS -> Back */}
              <line x1={220} y1={50} x2={360} y2={130} stroke="#1f1f23" strokeWidth="1" strokeDasharray="3" />
              {/* Direct Path Front -> Back */}
              {!useDnsName && (
                <line x1={80} y1={130} x2={360} y2={130} stroke="#1f1f23" strokeWidth="1" strokeDasharray="3" />
              )}
            </svg>

            {/* Packet Orb */}
            <div 
              ref={packetRef}
              className="absolute w-2.5 h-2.5 rounded-full z-20 opacity-0 scale-0 shadow-[0_0_8px_currentColor]"
            />

            {/* DNS Nameserver Node (Top) */}
            <div className="absolute left-[150px] top-[10px] w-28 text-center z-10">
              <div className={cn(
                "py-2 px-3 rounded-[9px] border bg-[#0d0d0e] flex flex-col items-center justify-center gap-1 transition-all duration-300",
                activeHopId === "dns" ? "border-white text-white font-bold" : "border-zinc-850 text-zinc-550"
              )}>
                <Server className="w-4 h-4 shrink-0 text-zinc-500" />
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">Docker DNS</span>
              </div>
            </div>

            {/* Frontend Container Node (Bottom Left) */}
            <div className="absolute left-[10px] top-[110px] w-28 text-center z-10">
              <NodePrimitive
                label="web-front"
                status={activeHopId === "front" ? "running" : "idle"}
                icon={<Server className="w-3.5 h-3.5" />}
                subtitle="IP: 172.18.0.2"
                className="py-1.5 rounded-[9px]"
              />
            </div>

            {/* Backend Container Node (Bottom Right) */}
            <div className="absolute left-[280px] top-[110px] w-28 text-center z-10">
              <NodePrimitive
                label="api-service"
                status={activeHopId === "back" ? "running" : "idle"}
                icon={<Server className="w-3.5 h-3.5" />}
                subtitle={`IP: ${backendIp}`}
                className="py-1.5 rounded-[9px]"
              />
            </div>

          </div>

        </div>

        {/* Selected actions and details panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              DNS configuration
            </span>
            <h4 className="text-sm font-extrabold text-white font-sans">Query settings</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text">
              Simulate container recreations and verify routing resilience.
            </p>
          </div>

          <div className="flex flex-col gap-3 flex-1 justify-center select-none font-sans">
            
            {/* Toggle Dns mode */}
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span>Query Address Mode:</span>
              <div className="flex rounded-[6px] border border-zinc-800 bg-[#0d0d0e] p-0.5 overflow-hidden">
                <button
                  onClick={() => setUseDnsName(true)}
                  disabled={isPlaying}
                  className={cn(
                    "px-2 py-1 rounded-[4px] border-0 text-[8px] font-bold transition-all cursor-pointer",
                    useDnsName ? "bg-white text-black" : "bg-transparent text-zinc-550 hover:text-zinc-350"
                  )}
                >
                  Service Name
                </button>
                <button
                  onClick={() => setUseDnsName(false)}
                  disabled={isPlaying}
                  className={cn(
                    "px-2 py-1 rounded-[4px] border-0 text-[8px] font-bold transition-all cursor-pointer",
                    !useDnsName ? "bg-white text-black" : "bg-transparent text-zinc-550 hover:text-zinc-350"
                  )}
                >
                  Fixed IP
                </button>
              </div>
            </div>

            {/* Simulation controls */}
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={handleSendRequest}
                disabled={isPlaying}
                className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5"
              >
                Send Request
              </button>
              <button
                onClick={handleRecreateBackend}
                disabled={isPlaying}
                className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-[#1a1a1e] border border-zinc-850 hover:border-zinc-700 text-zinc-300 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                Recreate api-service (Change IP)
              </button>
            </div>

          </div>

          {/* Diagnostic logs */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col min-h-[90px] overflow-hidden select-text font-sans">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0">
              <span className="text-[7.5px] font-mono text-zinc-550 font-bold">Query output:</span>
            </div>
            <div className="p-3 font-mono text-[9px] text-zinc-400 leading-relaxed flex-1 overflow-y-auto">
              {terminalLog}
            </div>
          </div>

          {backendIp !== "172.18.0.3" && !useDnsName && (
            <div className="p-3.5 rounded-[12px] bg-red-950/5 border border-red-500/15 text-[8.5px] text-red-405 leading-normal flex items-start gap-2 animate-fadeIn select-text font-sans">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                **ROUTE BROKEN!** Direct IP query targeted 172.18.0.3, but the container has moved to {backendIp}. Switch to **Service Name** to let DNS resolve it automatically.
              </span>
            </div>
          )}

          {isPlaying && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Lab
            </button>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
