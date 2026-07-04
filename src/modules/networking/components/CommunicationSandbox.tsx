"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle, RefreshCw, Server, Database, Monitor, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";

type NetType = "none" | "net_a" | "net_b" | "both";

interface SandboxNode {
  id: string;
  name: string;
  role: "frontend" | "backend" | "db" | "redis";
  network: NetType;
}

interface SandboxChallenge {
  id: number;
  goal: string;
  hint: string;
  validator: (nodes: SandboxNode[]) => boolean;
}

const CHALLENGES: SandboxChallenge[] = [
  {
    id: 1,
    goal: "Connect Frontend and Backend together on the same subnet",
    hint: "Assign both web-front and api-service to Network A.",
    validator: (nodes) => {
      const f = nodes.find(n => n.role === "frontend")?.network;
      const b = nodes.find(n => n.role === "backend")?.network;
      if (f === "none" || b === "none") return false;
      return f === b || f === "both" || b === "both";
    }
  },
  {
    id: 2,
    goal: "Isolate Database from Frontend, but keep it reachable by Backend",
    hint: "Assign web-front to Network A, db-postgres to Network B, and api-service to Both (A & B).",
    validator: (nodes) => {
      const f = nodes.find(n => n.role === "frontend")?.network;
      const b = nodes.find(n => n.role === "backend")?.network;
      const d = nodes.find(n => n.role === "db")?.network;
      
      // Backend must reach DB (share a net)
      const backDbSync = (b === d && b !== "none") || b === "both" || d === "both";
      // Frontend must NOT reach DB (no shared net)
      const frontDbIsolated = (f !== d) && f !== "both" && d !== "both";
      
      return backDbSync && frontDbIsolated;
    }
  },
  {
    id: 3,
    goal: "Isolate Redis Cache to Backend access only",
    hint: "Assign cache-redis and api-service to Network B, and web-front to Network A.",
    validator: (nodes) => {
      const f = nodes.find(n => n.role === "frontend")?.network;
      const b = nodes.find(n => n.role === "backend")?.network;
      const r = nodes.find(n => n.role === "redis")?.network;
      
      // Redis must reach Backend (share a net)
      const redisBackSync = (r === b && r !== "none") || r === "both" || b === "both";
      // Redis must NOT reach Frontend (no shared net)
      const redisFrontIsolated = (r !== f) && r !== "both" && f !== "both";
      
      return redisBackSync && redisFrontIsolated;
    }
  }
];

export default function CommunicationSandbox() {
  const [nodes, setNodes] = useState<SandboxNode[]>([
    { id: "front", name: "web-front", role: "frontend", network: "none" },
    { id: "back", name: "api-service", role: "backend", network: "none" },
    { id: "db", name: "db-postgres", role: "db", network: "none" },
    { id: "redis", name: "cache-redis", role: "redis", network: "none" }
  ]);

  const [activeChallengeIdx, setActiveChallengeIdx] = useState<number>(0);
  const [solved, setSolved] = useState<boolean>(false);
  const [terminalLog, setTerminalLog] = useState("Assign network scopes to solve the challenge.");

  const challenge = CHALLENGES[activeChallengeIdx];

  const handleUpdateNetwork = (id: string, net: NetType) => {
    setNodes(prev => prev.map(n => 
      n.id === id ? { ...n, network: net } : n
    ));
  };

  const handleReset = () => {
    setNodes([
      { id: "front", name: "web-front", role: "frontend", network: "none" },
      { id: "back", name: "api-service", role: "backend", network: "none" },
      { id: "db", name: "db-postgres", role: "db", network: "none" },
      { id: "redis", name: "cache-redis", role: "redis", network: "none" }
    ]);
    setSolved(false);
    setTerminalLog("Assign network scopes to solve the challenge.");
  };

  // Evaluate challenge state on every nodes update
  useEffect(() => {
    const isCorrect = challenge.validator(nodes);
    if (isCorrect) {
      setSolved(true);
      setTerminalLog("Success! Connection configuration matches target architecture parameters.");
    } else {
      setSolved(false);
    }
  }, [nodes, activeChallengeIdx]);

  const handleNextChallenge = () => {
    setActiveChallengeIdx((prev) => (prev + 1) % CHALLENGES.length);
    handleReset();
  };

  return (
    <VisualCanvas
      objective="Design isolated and multi-subnet networks to implement strict communication boundaries."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Communication Sandbox
          </div>
          <p>
            Welcome to the final sandbox! Construct network mappings for **Network A** and **Network B** to solve the structural isolation challenges.
          </p>
          <p>
            Assign containers using the selectors on the right to build bridges and isolate critical backend databases from the public web frontend.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Visual Map (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          <div className="w-full max-w-sm flex flex-col gap-3 relative z-10 py-2">
            
            {/* Subnets circles visuals */}
            <div className="grid grid-cols-2 gap-6 mb-2">
              <div className="p-3 rounded-[12px] border border-dashed border-zinc-800 bg-[#0d0d0e]/60 text-center flex flex-col gap-1 select-text">
                <span className="text-[7px] font-mono uppercase tracking-wider text-zinc-550 block">Subnet A</span>
                <span className="text-[8.5px] font-bold text-zinc-350">frontend-net</span>
              </div>
              <div className="p-3 rounded-[12px] border border-dashed border-zinc-800 bg-[#0d0d0e]/60 text-center flex flex-col gap-1 select-text">
                <span className="text-[7px] font-mono uppercase tracking-wider text-zinc-550 block">Subnet B</span>
                <span className="text-[8.5px] font-bold text-zinc-350">backend-net</span>
              </div>
            </div>

            {/* Containers Network assignments */}
            <div className="flex flex-col gap-2.5">
              {nodes.map((node) => {
                const connectedToA = node.network === "net_a" || node.network === "both";
                const connectedToB = node.network === "net_b" || node.network === "both";

                return (
                  <div 
                    key={node.id}
                    className="p-3 rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex items-center justify-between transition-colors duration-300"
                  >
                    {/* Left: Container Node */}
                    <div className="w-32 select-none">
                      <NodePrimitive
                        label={node.name}
                        status={node.network !== "none" ? "running" : "idle"}
                        icon={node.role === "db" ? <Database className="w-3.5 h-3.5" /> : <Server className="w-3.5 h-3.5" />}
                        className="py-1 rounded-[8px]"
                      />
                    </div>

                    {/* Middle: Active Network badges indicators */}
                    <div className="flex gap-1.5 font-mono text-[7px] font-bold uppercase select-none">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded border",
                        connectedToA 
                          ? "border-green-500/20 bg-green-950/10 text-green-400 font-bold" 
                          : "border-zinc-850 text-zinc-650"
                      )}>
                        Net A
                      </span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded border",
                        connectedToB 
                          ? "border-green-500/20 bg-green-950/10 text-green-400 font-bold" 
                          : "border-zinc-850 text-zinc-650"
                      )}>
                        Net B
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Selected challenge details & task options panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Sandbox challenge
            </span>
            <h4 className="text-sm font-extrabold text-white">Target Objective</h4>
            
            {/* Challenge description */}
            <div className="p-3 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 text-[10px] leading-relaxed font-sans text-zinc-400 mt-2 select-text">
              <span className="font-bold text-zinc-200 block mb-0.5">Goal:</span>
              {challenge.goal}
              <span className="text-[8.5px] text-zinc-550 block mt-2 border-t border-zinc-900 pt-1.5 font-normal italic">
                Hint: {challenge.hint}
              </span>
            </div>
          </div>

          {/* Network selectors inputs */}
          <div className="flex flex-col gap-2 select-none font-sans text-[9px] font-bold border-t border-zinc-850/45 pt-3">
            {nodes.map((node) => (
              <div key={node.id} className="flex justify-between items-center">
                <span className="text-zinc-350">{node.name}:</span>
                <select
                  value={node.network}
                  onChange={(e) => handleUpdateNetwork(node.id, e.target.value as NetType)}
                  className="bg-[#0d0d0e] border border-zinc-800 rounded-[5px] py-1 px-2 text-[9px] font-mono font-bold text-white focus:outline-none focus:border-zinc-650 cursor-pointer"
                >
                  <option value="none">Disconnected</option>
                  <option value="net_a">Network A</option>
                  <option value="net_b">Network B</option>
                  <option value="both">Both (A & B)</option>
                </select>
              </div>
            ))}
          </div>

          {/* Diagnostic logs */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col min-h-[90px] overflow-hidden select-text font-sans">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0">
              <span className="text-[7.5px] font-mono text-zinc-550 font-bold">Diagnostics trace:</span>
            </div>
            <div className="p-3 font-mono text-[9px] text-zinc-450 leading-relaxed flex-1 overflow-y-auto">
              {terminalLog}
            </div>
          </div>

          {solved && (
            <div className="flex flex-col gap-2 animate-fadeIn font-sans">
              <div className="p-3 rounded-[12px] bg-white/5 border border-white/10 text-[8.5px] text-zinc-305 leading-normal flex items-start gap-1.5 select-text">
                <CheckCircle2 className="w-4 h-4 text-zinc-355 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-extrabold text-white">CHALLENGE PASSED!</span>
                  <span className="text-zinc-450 mt-0.5">Subnet boundaries correctly enforce security requirements.</span>
                </div>
              </div>
              
              <button
                onClick={handleNextChallenge}
                className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all border-0 cursor-pointer"
              >
                Next Challenge
              </button>
            </div>
          )}

          {nodes.some(n => n.network !== "none") && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none font-sans"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Sandbox
            </button>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
