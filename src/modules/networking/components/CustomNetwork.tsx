"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle, AlertTriangle, CheckCircle, Network } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";
import EdgePrimitive from "@/components/primitives/EdgePrimitive";

interface NetworkNode {
  id: string;
  name: string;
  ip: string;
  net: "frontend" | "backend";
  x: number;
  y: number;
}

const NODES: NetworkNode[] = [
  { id: "web1", name: "web-1", ip: "172.20.0.2", net: "frontend", x: 80, y: 70 },
  { id: "api1", name: "api-1", ip: "172.20.0.3", net: "frontend", x: 80, y: 210 },
  { id: "db1", name: "db-1", ip: "172.30.0.2", net: "backend", x: 340, y: 70 },
  { id: "redis1", name: "redis-1", ip: "172.30.0.3", net: "backend", x: 340, y: 210 }
];

export default function CustomNetwork() {
  const [targetId, setTargetId] = useState<string>("api1");
  const [pingSent, setPingSent] = useState<boolean>(false);
  const [terminalLog, setTerminalLog] = useState("Select a ping target, then run the simulation.");

  const handleReset = useCallback(() => {
    setPingSent(false);
    setTerminalLog("Select a ping target, then run the simulation.");
  }, []);

  const handlePing = () => {
    setPingSent(true);
    if (targetId === "api1") {
      setTerminalLog(`web-1$ ping 172.20.0.3\n64 bytes from 172.20.0.3: icmp_seq=1 ttl=64 time=0.04 ms\n\n[SUCCESS] Connected! Containers share the frontend-net network bridge.`);
    } else {
      setTerminalLog(`web-1$ ping 172.30.0.2\nping: sendto: Host is unreachable\n\n[ISOLATION] Blocked! web-1 (frontend-net) cannot route packets to db-1 (backend-net).`);
    }
  };

  return (
    <VisualCanvas
      objective="Understand Docker custom subnet isolation: containers share access on identical custom networks, but are isolated across different networks."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-400" />
            How do custom networks work?
          </div>
          <p>
            By default, Docker assigns containers to the default `bridge` network. However, default bridge networks do not support automatic DNS name routing or network isolation.
          </p>
          <p>
            Creating custom networks (e.g. `frontend-net`, `backend-net`) isolates container groups. `web-1` and `api-1` can ping each other, but packets trying to cross subnet bridges to `db-1` are blocked by default iptables kernel rules.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Subnet sandbox canvas layout (Left) */}
        <div className="flex-1 flex items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px]">
          
          <div className="w-full max-w-xl h-72 relative flex justify-between px-4">
            
            {/* Frontend Subnet Boundary Box */}
            <div className="w-52 h-full rounded-[12px] border border-dashed border-zinc-800/60 bg-zinc-950/20 p-3 flex flex-col justify-between relative">
              <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-450 absolute top-2 right-3">
                frontend-net (172.20.0.0/16)
              </span>

              {/* Edge connection */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <EdgePrimitive x1={104} y1={44} x2={104} y2={244} curveType="straight" active={targetId === "api1" && pingSent} />
              </svg>

              <div className="w-40 self-center">
                <NodePrimitive
                  label="web-1"
                  status={pingSent ? "running" : "idle"}
                  icon={<Network className="w-4 h-4 text-zinc-300" />}
                  subtitle="172.20.0.2"
                  className="py-2.5 px-3 rounded-[12px]"
                />
              </div>

              <div className="w-40 self-center">
                <NodePrimitive
                  label="api-1"
                  status={targetId === "api1" && pingSent ? "running" : "idle"}
                  icon={<Network className="w-4 h-4 text-zinc-300" />}
                  subtitle="172.20.0.3"
                  className="py-2.5 px-3 rounded-[12px]"
                />
              </div>
            </div>

            {/* Floating Static packet status dot over paths */}
            {pingSent && (
              <div
                className={cn(
                  "absolute w-2.5 h-2.5 rounded-full transition-all duration-300 z-20 shadow-sm",
                  targetId === "api1" ? "bg-[#FAFAFA] shadow-[0_0_8px_#ffffff] top-[139px] left-[115px]" : "bg-red-500 shadow-[0_0_8px_#ef4444] top-[39px] left-[219px]"
                )}
              />
            )}

            {/* Backend Subnet Boundary Box */}
            <div className="w-52 h-full rounded-[12px] border border-dashed border-zinc-800/60 bg-zinc-950/20 p-3 flex flex-col justify-between relative">
              <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-450 absolute top-2 right-3">
                backend-net (172.30.0.0/16)
              </span>

              {/* Edge connection */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <EdgePrimitive x1={104} y1={44} x2={104} y2={244} curveType="straight" active={false} />
              </svg>

              <div className="w-40 self-center">
                <NodePrimitive
                  label="db-1"
                  status={targetId === "db1" && pingSent ? "running" : "idle"}
                  icon={<Network className="w-4 h-4 text-zinc-300" />}
                  subtitle="172.30.0.2"
                  className="py-2.5 px-3 rounded-[12px]"
                />
              </div>

              <div className="w-40 self-center">
                <NodePrimitive
                  label="redis-1"
                  status="idle"
                  icon={<Network className="w-4 h-4 text-zinc-300" />}
                  subtitle="172.30.0.3"
                  className="py-2.5 px-3 rounded-[12px]"
                />
              </div>
            </div>
            
          </div>
        </div>

        {/* Selected target & ping buttons (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Subnet Controller
            </span>
            <h4 className="text-sm font-extrabold text-white font-sans">Ping Target</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text font-sans">
              Select a container target IP to query from web-1, then execute the ping tracer.
            </p>
          </div>

          <div className="flex flex-col gap-1.5 select-none shrink-0 font-sans">
            <button
              onClick={() => { setTargetId("api1"); handleReset(); }}
              className={cn(
                "w-full px-3 py-2 rounded-[9px] text-left font-mono text-[9px] font-bold transition-all cursor-pointer border border-zinc-850",
                targetId === "api1"
                  ? "bg-zinc-800 text-white border-zinc-700"
                  : "bg-[#0d0d0e] text-zinc-450 hover:bg-zinc-850"
              )}
            >
              api-1 (Same Subnet - 172.20.0.3)
            </button>
            <button
              onClick={() => { setTargetId("db1"); handleReset(); }}
              className={cn(
                "w-full px-3 py-2 rounded-[9px] text-left font-mono text-[9px] font-bold transition-all cursor-pointer border border-zinc-850",
                targetId === "db1"
                  ? "bg-zinc-800 text-white border-zinc-700"
                  : "bg-[#0d0d0e] text-zinc-450 hover:bg-zinc-850"
              )}
            >
              db-1 (Isolated Subnet - 172.30.0.2)
            </button>
          </div>

          <button
            onClick={handlePing}
            className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all border-0 cursor-pointer"
          >
            ping target
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
              targetId === "api1" 
                ? "border-zinc-800 bg-zinc-900/20 text-zinc-300 font-sans" 
                : "border-red-950/20 bg-red-950/5 text-red-400 font-sans"
            )}>
              {targetId === "api1" ? (
                <div className="flex items-start gap-1.5">
                  <CheckCircle className="w-4 h-4 text-zinc-450 shrink-0 mt-0.5" />
                  <span>Success! ICMP packet traverses the internal Docker bridge subnet freely.</span>
                </div>
              ) : (
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Subnets are blocked. Linux iptables bridge structures reject packet routing between frontend-net and backend-net.</span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </VisualCanvas>
  );
}
