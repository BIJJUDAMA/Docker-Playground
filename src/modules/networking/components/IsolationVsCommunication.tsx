"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { HelpCircle, RefreshCw, Server, Database, Play, CheckCircle2, AlertTriangle, Monitor } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { useAnimationStore } from "@/stores/animationStore";

export default function IsolationVsCommunication() {
  const [hasBridge, setHasBridge] = useState<boolean>(false);
  const [showDbIsland, setShowDbIsland] = useState<boolean>(false);
  const { isPlaying, setPlaying } = useAnimationStore();
  const [terminalLog, setTerminalLog] = useState("Click 'Send Request' to watch the packet travel.");
  const [collisionActive, setCollisionActive] = useState<boolean>(false);

  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  const packetRef = useRef<HTMLDivElement>(null);
  const bridgeRef = useRef<HTMLDivElement>(null);
  const dbBridgeRef = useRef<HTMLDivElement>(null);

  useAnimationControls(timeline);

  const handleReset = () => {
    setPlaying(false);
    setHasBridge(false);
    setShowDbIsland(false);
    setCollisionActive(false);
    setTerminalLog("Click 'Send Request' to watch the packet travel.");

    if (timeline) {
      timeline.pause().progress(0);
    }
    gsap.set(packetRef.current, { opacity: 0, scale: 0, x: 0, y: 0, backgroundColor: "#FAFAFA" });
    gsap.set(bridgeRef.current, { scaleX: 0 });
    gsap.set(dbBridgeRef.current, { scaleY: 0 });
  };

  const handleSendRequest = () => {
    setPlaying(true);
    setCollisionActive(false);
    setTerminalLog("web-front$ ping api-service\nLaunching connection request packet...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setPlaying(false);
      }
    });

    setTimeline(tl);

    // Initial packet reveal at Frontend Island (x: 58, y: 65)
    gsap.set(packetRef.current, { x: 58, y: 65, opacity: 0, scale: 0.8, backgroundColor: "#FAFAFA" });
    tl.to(packetRef.current, { opacity: 1, scale: 1, duration: 0.2 });

    if (!hasBridge) {
      // Packet travels to mid-water and bounces off invisible wall
      tl.to(packetRef.current, {
        x: 178,
        y: 65,
        duration: 0.5,
        ease: "power1.in"
      })
      .call(() => {
        setCollisionActive(true);
        setTerminalLog("web-front$ ping api-service\n[FAILURE] Packet bounces off isolation boundary! Hosts reside on disconnected subnets.");
      })
      .to(packetRef.current, {
        scale: 1.4,
        backgroundColor: "#ef4444",
        duration: 0.15
      })
      // Drop packet down/fade
      .to(packetRef.current, {
        y: 110,
        opacity: 0,
        scale: 0.4,
        duration: 0.4
      });

    } else {
      // Packet crosses bridge to Backend Island successfully (x: 298, y: 65)
      tl.to(packetRef.current, {
        x: 298,
        y: 65,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => {
          setTerminalLog("Routing request across app-net virtual bridge network...");
        }
      });

      if (showDbIsland) {
        // Query Database Island at bottom (x: 298, y: 165)
        tl.to(packetRef.current, {
          x: 298,
          y: 165,
          duration: 0.6,
          ease: "power1.inOut",
          onStart: () => {
            setTerminalLog("api-service querying isolated Database db-postgres on DB Island...");
          }
        })
        .to(packetRef.current, {
          backgroundColor: "#22c55e",
          duration: 0.15
        })
        .to(packetRef.current, {
          x: 58,
          y: 65,
          duration: 1.2,
          ease: "power2.inOut",
          onStart: () => {
            setTerminalLog("Returning database records back to frontend...");
          }
        });
      } else {
        // Normal success return
        tl.to(packetRef.current, {
          backgroundColor: "#22c55e",
          duration: 0.15
        })
        .to(packetRef.current, {
          x: 58,
          y: 65,
          duration: 0.8,
          ease: "power2.inOut"
        });
      }

      tl.call(() => {
        setTerminalLog("web-front$ Connection Successful!\n[SUCCESS] Bridge network allows namespace packet communication.");
      })
      .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.3 });
    }
  };

  const handleConnectNetwork = () => {
    setHasBridge(true);
    setTerminalLog("host$ docker network connect app-net api-service\nDrawing bridge pathway between isolated container subnets...");
    
    gsap.timeline()
      .to(bridgeRef.current, {
        scaleX: 1,
        duration: 0.6,
        ease: "power1.inOut"
      });
  };

  const handleAddDb = () => {
    setShowDbIsland(true);
    setTerminalLog("host$ docker run -d --name db-postgres --network db-net postgres\nSpawning Database Postgres Island...");
    
    // Animate db island fade-in and its backend bridge connection
    gsap.timeline()
      .to("#db-island-card", { opacity: 1, y: 0, duration: 0.5 })
      .to(dbBridgeRef.current, {
        scaleY: 1,
        duration: 0.5,
        ease: "power1.inOut"
      });
  };

  return (
    <VisualCanvas
      objective="Understand container isolation: build virtual network bridges to connect isolated container islands."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Islands Isolation
          </div>
          <p>
            By default, containers reside on completely separate networks (**Islands**). Packets trying to cross bounce off invisible network namespace walls.
          </p>
          <p>
            Click **"Connect Network"** to construct virtual bridge links, allowing packet traffic to flow securely.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Schematic Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          <div className="w-full max-w-sm relative min-h-[220px] mx-auto">
            
            {/* Visual Islands tracks */}
            
            {/* Frontend Island (Left) */}
            <div className="absolute left-[10px] top-[40px] w-24 p-3 rounded-[12px] bg-[#0d0d0e] border border-zinc-850 flex flex-col items-center gap-1 z-10 text-center">
              <Monitor className="w-5 h-5 text-zinc-500" />
              <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-300">Frontend Island</span>
            </div>

            {/* Bridge connector between Frontend and Backend islands */}
            <div 
              ref={bridgeRef}
              className="absolute left-[104px] top-[60px] w-[148px] h-0.5 border-t border-dashed border-white origin-left scale-x-0 z-0 pointer-events-none"
            />

            {/* Invisible collision wall animation */}
            {!hasBridge && collisionActive && (
              <div className="absolute left-[175px] top-[40px] w-1 h-10 border-l border-red-500 animate-ping opacity-75 z-20 pointer-events-none" />
            )}

            {/* Backend Island (Right) */}
            <div className="absolute left-[250px] top-[40px] w-24 p-3 rounded-[12px] bg-[#0d0d0e] border border-zinc-850 flex flex-col items-center gap-1 z-10 text-center">
              <Server className="w-5 h-5 text-zinc-500" />
              <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-300">Backend Island</span>
            </div>

            {/* Bridge down to Database island */}
            <div 
              ref={dbBridgeRef}
              className="absolute left-[298px] top-[90px] h-[60px] w-0.5 border-l border-dashed border-white origin-top scale-y-0 z-0 pointer-events-none"
            />

            {/* Database Island (Bottom Right) */}
            <div 
              id="db-island-card"
              className="absolute left-[250px] top-[140px] w-24 p-3 rounded-[12px] bg-[#0d0d0e] border border-zinc-850 flex flex-col items-center gap-1 z-10 text-center opacity-0 translate-y-4 transition-all duration-300"
            >
              <Database className="w-5 h-5 text-zinc-500" />
              <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-300">Database Island</span>
            </div>

            {/* Traveling packet orb */}
            <div 
              ref={packetRef}
              className="absolute w-2.5 h-2.5 rounded-full left-0 top-0 z-20 opacity-0 scale-0 shadow-[0_0_8px_currentColor]"
            />

          </div>

        </div>

        {/* Selected actions and details panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Bridge Builder Console
            </span>
            <h4 className="text-sm font-extrabold text-white">Bridge controls</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text font-sans">
              Build pathways to verify request routing crossing.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 flex-1 justify-center select-none font-sans">
            <button
              onClick={handleSendRequest}
              disabled={isPlaying}
              className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5"
            >
              Send Request Packet
            </button>
            
            <button
              onClick={handleConnectNetwork}
              disabled={hasBridge || isPlaying}
              className="w-full py-2.5 rounded-[9px] text-[10px] font-bold bg-[#1a1a1e] border border-zinc-850 hover:border-zinc-700 text-zinc-300 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Connect Network (Build Bridge)
            </button>

            {hasBridge && (
              <button
                onClick={handleAddDb}
                disabled={showDbIsland || isPlaying}
                className="w-full py-2.5 rounded-[9px] text-[10px] font-bold bg-[#1a1a1e] border border-zinc-850 hover:border-zinc-700 text-zinc-300 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1.5 animate-fadeIn"
              >
                Add Database Island
              </button>
            )}
          </div>

          {/* Diagnostic trace logs */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col min-h-[90px] overflow-hidden select-text font-sans">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0">
              <span className="text-[7.5px] font-mono text-zinc-550 font-bold">Network logs:</span>
            </div>
            <div className="p-3 font-mono text-[9px] text-zinc-400 leading-relaxed flex-1 overflow-y-auto">
              {terminalLog}
            </div>
          </div>

          {hasBridge && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none font-sans"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Islands
            </button>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
