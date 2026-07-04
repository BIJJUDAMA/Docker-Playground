"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, ShieldAlert, Network } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";

export default function ContainerBridge() {
  const [sameNetwork, setSameNetwork] = useState<boolean>(true);
  const [pingSent, setPingSent] = useState<boolean>(false);
  const [terminalLog, setTerminalLog] = useState("Click 'Ping db-server' in the sandbox panel to test.");

  const handleReset = useCallback(() => {
    setPingSent(false);
    setTerminalLog("Click 'Ping db-server' in the sandbox panel to test.");
  }, []);

  const handlePing = () => {
    setPingSent(true);
    if (sameNetwork) {
      setTerminalLog("web-app$ ping -c 2 db-server\nPING db-server (172.18.0.3): 56 data bytes\n64 bytes from 172.18.0.3: time=0.04 ms\n\n[SUCCESS] Hostname resolved successfully via Docker DNS.");
    } else {
      setTerminalLog("web-app$ ping -c 2 db-server\nping: db-server: Name or service not known\n[ERROR] Hostname lookup failed. Containers are isolated.");
    }
  };

  return (
    <VisualCanvas
      objective="Trace how standard Docker bridges allocate isolated virtual network loops for container communication."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <Network className="w-4 h-4 text-zinc-400" />
            What is a container bridge network?
          </div>
          <p>
            When Docker starts, it sets up a virtual interface bridge called `docker0`. Unless configured otherwise, new containers mount onto this bridge, obtaining distinct IPs (e.g. `172.18.0.x`).
          </p>
          <p>
            By default, containers on different bridge interfaces cannot resolve hostnames or route packet streams to each other.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Simulation Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px]">
          
          <div className="w-full max-w-sm h-56 relative flex justify-between items-center">
            {/* Pathway connections in background */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {/* web-app down to bridge */}
              <line
                x1={72}
                y1={112}
                x2={72}
                y2={180}
                stroke={pingSent ? "#FAFAFA" : "#27272a"}
                strokeWidth="2"
                strokeDasharray={pingSent ? "0" : "4 4"}
                className="transition-colors duration-300"
              />
              {/* db-server down to bridge */}
              <line
                x1={312}
                y1={112}
                x2={312}
                y2={180}
                stroke={pingSent && sameNetwork ? "#FAFAFA" : "#27272a"}
                strokeWidth="2"
                strokeDasharray={pingSent && sameNetwork ? "0" : "4 4"}
                className="transition-colors duration-300"
              />
              
              {/* Bridge line */}
              <line
                x1={72}
                y1={180}
                x2={312}
                y2={180}
                stroke={pingSent && sameNetwork ? "#FAFAFA" : pingSent ? "#ef4444" : "#27272a"}
                strokeWidth="2"
                strokeDasharray={pingSent && sameNetwork ? "0" : "4 4"}
                className="transition-colors duration-300"
              />
            </svg>

            {/* Floating Static packet status dot over bridge line */}
            {pingSent && (
              <div
                className={cn(
                  "absolute w-2.5 h-2.5 rounded-full transition-all duration-300 z-20 shadow-sm",
                  sameNetwork ? "bg-[#FAFAFA] shadow-[0_0_8px_#ffffff]" : "bg-red-500 shadow-[0_0_8px_#ef4444]",
                  "top-[175px] left-[187px]"
                )}
              />
            )}
            {/* Container A: web-app */}
            <div className="w-36">
              <NodePrimitive
                label="web-app"
                status={pingSent ? "running" : "idle"}
                icon={<Network className="w-4 h-4 text-zinc-300" />}
                subtitle="IP: 172.18.0.2"
                className="py-2.5 px-3 rounded-[12px]"
              />
            </div>

            {/* Container B: db-server */}
            <div className="w-36">
              <NodePrimitive
                label="db-server"
                status={pingSent && sameNetwork ? "running" : "idle"}
                icon={<Network className="w-4 h-4 text-zinc-300" />}
                subtitle={sameNetwork ? "IP: 172.18.0.3" : "IP: 172.19.0.2"}
                className="py-2.5 px-3 rounded-[12px]"
              />
            </div>
          </div>

          {/* Bridge Label interface */}
          <div className="absolute bottom-6 px-4 py-1.5 rounded-full border border-zinc-850 bg-[#0d0d0e] font-mono text-[8px] text-zinc-500 z-10">
            {sameNetwork ? "Shared Bridge: bridge (default)" : "Disconnected Bridges: bridge vs my-net"}
          </div>
        </div>

        {/* Selected connection details inspector (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Sandbox Controller
            </span>
            <h4 className="text-sm font-extrabold text-white">Bridge Network Config</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text">
              Configure if container interfaces reside on the same bridge loop, then execute ping packet checks instantly.
            </p>
          </div>

          {/* Same network toggle */}
          <div className="p-3 rounded-[12px] border border-zinc-800/25 bg-[#0d0d0e] flex items-center justify-between select-none">
            <div className="flex flex-col pr-2">
              <span className="text-[11px] font-bold text-zinc-200">
                Shared Bridge Network
              </span>
              <span className="text-[8px] text-zinc-550 leading-normal mt-0.5">
                Join containers on the same interface.
              </span>
            </div>
            
            <button
              onClick={() => {
                setSameNetwork(!sameNetwork);
                handleReset();
              }}
              className={cn(
                "relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                sameNetwork ? "bg-white" : "bg-zinc-800"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out",
                  sameNetwork ? "translate-x-4 bg-black" : "translate-x-0 bg-white"
                )}
              />
            </button>
          </div>

          <button
            onClick={handlePing}
            className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all border-0 cursor-pointer"
          >
            Ping db-server
          </button>

          {/* Terminal log */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] overflow-hidden flex flex-col min-h-[90px] shadow-sm select-text">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0 select-none">
              <span className="text-[8px] font-mono text-zinc-500">console stdout</span>
            </div>
            <div className="p-3 font-mono text-[9px] text-zinc-450 leading-relaxed overflow-y-auto flex-1 select-text">
              {terminalLog}
            </div>
          </div>

          {/* Warnings context */}
          {pingSent && (
            <div className={cn(
              "p-3 rounded-[12px] border text-[9.5px] leading-relaxed select-text",
              sameNetwork 
                ? "border-zinc-800 bg-zinc-900/20 text-zinc-300" 
                : "border-red-950/20 bg-red-950/5 text-red-400"
            )}>
              {sameNetwork ? (
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-zinc-450 shrink-0 mt-0.5" />
                  <span>Success! Containers on the same bridge loop communicate without external gateway routing helpers.</span>
                </div>
              ) : (
                <div className="flex items-start gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Disconnected bridges. Because container interfaces reside on separate subnets, IP traffic cannot flow.</span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </VisualCanvas>
  );
}
