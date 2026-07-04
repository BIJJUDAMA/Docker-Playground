"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { HelpCircle, Laptop, Network, Server, Database } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";
import { PacketPrimitive } from "@/components/primitives/PacketPrimitive";

interface ArchStep {
  id: string;
  title: string;
  desc: string;
}

const ARCHITECTURE_STEPS: ArchStep[] = [
  { id: "client", title: "Client Laptop", desc: "User issues query requests from external client browser targeting port 8080." },
  { id: "nginx", title: "Ingress DNAT redirect", desc: "Host forward maps queries from interface port 8080 down to proxy container at 172.20.0.2:80." },
  { id: "dns", title: "DNS proxy resolution", desc: "Nginx reverse proxy parses path, resolving node-api name through system resolver 127.0.0.11." },
  { id: "api", title: "Auth check connect", desc: "Backend API verifies database password handshake matching injected environment configurations." },
  { id: "db", title: "State data persist", desc: "Postgres writes records to local mount system directory db-data directly, ensuring data lifecycle longevity." }
];

export default function FinalArchitecture() {
  const [activeStepId, setActiveStepId] = useState<string>("client");
  const [animationState, setAnimationState] = useState<"idle" | "running" | "completed">("idle");
  const [terminalLog, setTerminalLog] = useState("Click play to run query requests trace.");

  const containerRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  useAnimationControls(timeline);

  const handleReset = useCallback(() => {
    setAnimationState("idle");
    setActiveStepId("client");
    setTerminalLog("Click play to run query requests trace.");
    if (timeline) {
      timeline.pause().progress(0);
    }
    gsap.set(packetRef.current, { x: 0, y: 0, opacity: 0, scale: 0 });
  }, [timeline]);

  useEffect(() => {
    handleReset();

    const tl = gsap.timeline({
      paused: true,
      onStart: () => setAnimationState("running"),
      onComplete: () => {
        setAnimationState("completed");
        setTerminalLog("HTTP/1.1 200 OK\nRequest completed successfully. Data safely persisted in volume db-data.");
      }
    });

    setTimeline(tl);

    // Initial packet display
    tl.to(packetRef.current, { opacity: 1, scale: 1, duration: 0.1 })
      // Laptop -> Nginx (Port forward translation)
      .to(packetRef.current, {
        x: 120,
        duration: 1.0,
        ease: "power1.inOut",
        onStart: () => {
          setActiveStepId("nginx");
          setTerminalLog("TCP Packet arrived at host port 80.\niptables DNAT mapping -> redirecting payload to nginx container at 172.20.0.2:80.");
        }
      })
      // Nginx -> API (DNS lookup name translation)
      .to(packetRef.current, {
        x: 240,
        y: -40,
        duration: 1.0,
        ease: "power1.inOut",
        onStart: () => {
          setActiveStepId("dns");
          setTerminalLog("Nginx forwards request to hostname 'node-api'.\nDocker system DNS resolver (127.0.0.11) resolves 'node-api' to IP 172.20.0.3.");
        }
      })
      // API -> DB (Env vars authorization handshake)
      .to(packetRef.current, {
        x: 360,
        y: 40,
        duration: 1.0,
        ease: "power1.inOut",
        onStart: () => {
          setActiveStepId("api");
          setTerminalLog("node-api initiates postgres auth query.\nValidating database password credentials matching injected env parameters...");
        }
      })
      // DB -> Volume disk write
      .to(packetRef.current, {
        x: 480,
        y: 80,
        duration: 0.8,
        ease: "power2.out",
        onStart: () => {
          setActiveStepId("db");
          setTerminalLog("Postgres auth success.\nWriting transaction query logs. Decoupled volume mounts write directly to host db-data directory.");
        }
      })
      // Success dissolution
      .to(packetRef.current, {
        scale: 1.4,
        opacity: 0,
        duration: 0.3
      });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <VisualCanvas
      objective="Inspect the complete transaction route: how port mappings, DNS name resolutions, environment variables, and persistent storage work together."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Putting It All Together
          </div>
          <p>
            When a request enters the ecosystem, it gets mapped, routed by local DNS, authorized by environment configurations, processed, and written to persistent storage volumes.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Canvas diagram layout (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-x-auto custom-scrollbar">
          
          <div className="w-[600px] h-60 relative flex items-center justify-between py-2 px-6">
            
            {/* Pathway wire connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {/* Client -> Nginx */}
              <line x1={100} y1={130} x2={220} y2={130} stroke="#1a1a1e" strokeWidth="1.5" strokeDasharray="4 4" />
              {/* Nginx -> API */}
              <line x1={220} y1={130} x2={340} y2={90} stroke="#1a1a1e" strokeWidth="1.5" strokeDasharray="4 4" />
              {/* API -> DB */}
              <line x1={340} y1={90} x2={460} y2={170} stroke="#1a1a1e" strokeWidth="1.5" strokeDasharray="4 4" />
              {/* DB -> Volume */}
              <line x1={460} y1={170} x2={580} y2={210} stroke="#1a1a1e" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>

            {/* Glowing packet */}
            <PacketPrimitive
              ref={packetRef}
              color="#FAFAFA"
              size={12}
              className="top-[124px] left-[78px] z-20"
            />

            {/* Laptop client */}
            <div className="w-24">
              <NodePrimitive
                label="Laptop"
                status={activeStepId === "client" ? "running" : "idle"}
                icon={<Laptop className="w-4 h-4 text-zinc-300" />}
                subtitle="192.168.1.10"
                className="py-2 px-1 rounded-[12px]"
              />
            </div>

            {/* Nginx proxy */}
            <div className="w-24">
              <NodePrimitive
                label="nginx-proxy"
                status={activeStepId === "nginx" ? "running" : "idle"}
                icon={<Network className="w-4 h-4 text-zinc-300" />}
                subtitle="Port 80:80"
                className="py-2 px-1 rounded-[12px]"
              />
            </div>

            {/* Node API */}
            <div className="w-24 absolute left-[310px] top-[40px]">
              <NodePrimitive
                label="node-api"
                status={activeStepId === "api" ? "running" : "idle"}
                icon={<Server className="w-4 h-4 text-zinc-300" />}
                subtitle="Port 3000"
                className="py-2 px-1 rounded-[12px]"
              />
            </div>

            {/* Postgres db */}
            <div className="w-24 absolute left-[430px] top-[120px]">
              <NodePrimitive
                label="postgres-db"
                status={activeStepId === "db" ? "running" : "idle"}
                icon={<Database className="w-4 h-4 text-zinc-300" />}
                subtitle="Port 5432"
                className="py-2 px-1 rounded-[12px]"
              />
            </div>

            {/* Named volume */}
            <div className="w-24 self-end">
              <NodePrimitive
                label="db-data"
                status={activeStepId === "db" && animationState === "completed" ? "running" : "idle"}
                icon={<Database className="w-4 h-4 text-zinc-300" />}
                subtitle="Volume Mount"
                className="py-2 px-1 rounded-[12px]"
              />
            </div>

          </div>
        </div>

        {/* Selected step details (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Architecture Inspector
            </span>
            <h4 className="text-sm font-extrabold text-white font-sans">
              {ARCHITECTURE_STEPS.find((s) => s.id === activeStepId)?.title}
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-3 select-text font-sans">
              {ARCHITECTURE_STEPS.find((s) => s.id === activeStepId)?.desc}
            </p>
          </div>

          {/* Terminal logs stdout */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] overflow-hidden flex flex-col min-h-[105px] shadow-sm select-text mt-auto">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0 select-none">
              <span className="text-[8px] font-mono text-zinc-500 font-bold">requests trace logs</span>
            </div>
            <div className="p-3 font-mono text-[9px] text-zinc-450 leading-relaxed overflow-y-auto flex-1 select-text">
              {terminalLog}
            </div>
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
