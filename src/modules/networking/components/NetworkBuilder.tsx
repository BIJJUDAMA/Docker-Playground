"use client";

import React, { useState } from "react";
import { cn, formatMarkdownNode } from "@/lib/utils";
import { HelpCircle, RefreshCw, Network, Server, Database, Play, CheckCircle2, Monitor } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";

interface NetNode {
  id: string;
  name: string;
  role: "frontend" | "backend" | "db" | "redis";
  ip: string;
  ports: string;
}

export default function NetworkBuilder() {
  const [networkExists, setNetworkExists] = useState<boolean>(false);
  const [addedNodes, setAddedNodes] = useState<NetNode[]>([]);
  const [networkRunning, setNetworkRunning] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const handleAddNetwork = () => {
    setNetworkExists(true);
  };

  const handleAddNode = (role: NetNode["role"]) => {
    if (!networkExists) return;
    if (addedNodes.some(n => n.role === role)) return; // prevent duplicate roles for demo simplicity

    const nodeNames: Record<NetNode["role"], string> = {
      frontend: "web-front",
      backend: "api-service",
      db: "db-postgres",
      redis: "cache-redis"
    };

    const nodePorts: Record<NetNode["role"], string> = {
      frontend: "80",
      backend: "8080",
      db: "5432",
      redis: "6379"
    };

    const nextIp = `172.18.0.${addedNodes.length + 2}`;

    const newNode: NetNode = {
      id: role,
      name: nodeNames[role],
      role,
      ip: nextIp,
      ports: nodePorts[role]
    };

    setAddedNodes(prev => [...prev, newNode]);
    setSelectedNodeId(role);
  };

  const handleStartNetwork = () => {
    setNetworkRunning(true);
  };

  const handleReset = () => {
    setNetworkExists(false);
    setAddedNodes([]);
    setNetworkRunning(false);
    setSelectedNodeId(null);
  };

  const selectedNode = addedNodes.find(n => n.id === selectedNodeId);

  return (
    <VisualCanvas
      objective="Design a virtual Docker bridge network and observe how containers automatically obtain IPs and register namespaces."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Docker Network Builder
          </div>
          <p>
            Containers are isolated processes. To let them talk to each other, you must attach them to the same **Docker Network** (a virtual software bridge running on your host).
          </p>
          <p>
            Add a network, drag/click nodes to attach containers, and start the network. Containers connected to the same bridge obtain private subnets and can ping each other immediately.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Network Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          {/* Custom coordinate canvas */}
          <div className="w-full max-w-lg flex flex-col items-center justify-center relative min-h-[260px]">
            
            {/* Connection SVG link lines */}
            {networkExists && addedNodes.length > 0 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden sm:block">
                {addedNodes.map((node) => {
                  // Connect each container node to the central network node
                  // Central network is at x: 250, y: 130
                  // Container nodes placement coordinates:
                  // frontend: x: 80, y: 60
                  // backend: x: 420, y: 60
                  // db: x: 80, y: 200
                  // redis: x: 420, y: 200
                  let xTarget = 250;
                  let yTarget = 130;
                  
                  let xStart = 80 + 55; // center of node
                  let yStart = 60 + 20;
                  
                  if (node.role === "backend") { xStart = 340 + 55; yStart = 60 + 20; }
                  else if (node.role === "db") { xStart = 80 + 55; yStart = 180 + 20; }
                  else if (node.role === "redis") { xStart = 340 + 55; yStart = 180 + 20; }

                  return (
                    <g key={node.id}>
                      <line
                        x1={xStart}
                        y1={yStart}
                        x2={xTarget}
                        y2={yTarget}
                        stroke={networkRunning ? "#FAFAFA" : "#1f1f23"}
                        strokeWidth={networkRunning ? "1.5" : "1"}
                        strokeDasharray={networkRunning ? "none" : "3"}
                        className="transition-all duration-500"
                      />
                      {networkRunning && (
                        <circle cx={xStart} cy={yStart} r="3" fill="#FAFAFA">
                          <animateMotion 
                            path={`M ${xStart} ${yStart} L ${xTarget} ${yTarget}`} 
                            dur="2s" 
                            repeatCount="indefinite" 
                          />
                        </circle>
                      )}
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Central Network Node */}
            {networkExists ? (
              <div 
                onClick={() => setSelectedNodeId(null)}
                className="absolute left-[195px] top-[108px] w-28 text-center z-10 cursor-pointer"
              >
                <div className={cn(
                  "p-2.5 rounded-full border flex flex-col items-center justify-center gap-1 transition-all duration-500",
                  networkRunning
                    ? "bg-[#0d0d0e] border-white text-white shadow-[0_0_12px_rgba(255,255,255,0.15)] animate-pulse"
                    : "bg-[#0d0d0e] border-zinc-850 text-zinc-550"
                )}>
                  <Network className="w-6 h-6" />
                  <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">app-net</span>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-zinc-850 rounded-[12px] p-6 text-center text-[9px] text-zinc-650 italic bg-[#0d0d0e] z-10">
                Drag or click 'Add Docker Network' on the right to start building.
              </div>
            )}

            {/* Attached Nodes Grid */}
            {networkExists && (
              <div className="absolute inset-0 pointer-events-none">
                
                {/* 1. Frontend Node */}
                {addedNodes.some(n => n.role === "frontend") && (
                  <div 
                    onClick={() => setSelectedNodeId("frontend")}
                    className="absolute left-[80px] top-[50px] w-28 text-center pointer-events-auto cursor-pointer"
                  >
                    <NodePrimitive
                      label="web-front"
                      status={networkRunning ? "running" : "idle"}
                      icon={<Monitor className="w-3.5 h-3.5 text-zinc-300" />}
                      subtitle={networkRunning ? "172.18.0.2" : "offline"}
                      className="py-1.5 rounded-[9px] bg-[#0d0d0e]"
                    />
                  </div>
                )}

                {/* 2. Backend Node */}
                {addedNodes.some(n => n.role === "backend") && (
                  <div 
                    onClick={() => setSelectedNodeId("backend")}
                    className="absolute left-[310px] top-[50px] w-28 text-center pointer-events-auto cursor-pointer"
                  >
                    <NodePrimitive
                      label="api-service"
                      status={networkRunning ? "running" : "idle"}
                      icon={<Server className="w-3.5 h-3.5 text-zinc-300" />}
                      subtitle={networkRunning ? "172.18.0.3" : "offline"}
                      className="py-1.5 rounded-[9px] bg-[#0d0d0e]"
                    />
                  </div>
                )}

                {/* 3. Database Node */}
                {addedNodes.some(n => n.role === "db") && (
                  <div 
                    onClick={() => setSelectedNodeId("db")}
                    className="absolute left-[80px] top-[170px] w-28 text-center pointer-events-auto cursor-pointer"
                  >
                    <NodePrimitive
                      label="db-postgres"
                      status={networkRunning ? "running" : "idle"}
                      icon={<Database className="w-3.5 h-3.5 text-zinc-300" />}
                      subtitle={networkRunning ? "172.18.0.4" : "offline"}
                      className="py-1.5 rounded-[9px] bg-[#0d0d0e]"
                    />
                  </div>
                )}

                {/* 4. Redis Node */}
                {addedNodes.some(n => n.role === "redis") && (
                  <div 
                    onClick={() => setSelectedNodeId("redis")}
                    className="absolute left-[310px] top-[170px] w-28 text-center pointer-events-auto cursor-pointer"
                  >
                    <NodePrimitive
                      label="cache-redis"
                      status={networkRunning ? "running" : "idle"}
                      icon={<Server className="w-3.5 h-3.5 text-zinc-300" />}
                      subtitle={networkRunning ? "172.18.0.5" : "offline"}
                      className="py-1.5 rounded-[9px] bg-[#0d0d0e]"
                    />
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

        {/* Toolbox & Node inspector panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          
          {/* Section 1: Network node toolbox */}
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Network Toolbox
            </span>
            <h4 className="text-sm font-extrabold text-white">Network components</h4>
            
            <div className="grid grid-cols-2 gap-2 mt-3 select-none">
              <button
                onClick={handleAddNetwork}
                disabled={networkExists}
                className="py-2 px-1.5 rounded-[8px] text-[8.5px] font-mono font-bold bg-white text-black border-transparent disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1"
              >
                + Add Network
              </button>
              <button
                onClick={handleStartNetwork}
                disabled={!networkExists || addedNodes.length === 0 || networkRunning}
                className="py-2 px-1.5 rounded-[8px] text-[8.5px] font-mono font-bold bg-[#1a1a1e] border border-zinc-850 hover:border-zinc-700 text-white disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1"
              >
                <Play className="w-3 h-3 fill-white" />
                Start Network
              </button>
            </div>

            {/* Container nodes toolbox */}
            {networkExists && (
              <div className="grid grid-cols-2 gap-1.5 mt-2.5 select-none animate-fadeIn">
                {(["frontend", "backend", "db", "redis"] as const).map((role) => {
                  const exists = addedNodes.some(n => n.role === role);
                  return (
                    <button
                      key={role}
                      disabled={exists || networkRunning}
                      onClick={() => handleAddNode(role)}
                      className={cn(
                        "py-1.5 rounded-[6px] text-[8.5px] font-bold border transition-colors cursor-pointer disabled:opacity-40",
                        exists
                          ? "bg-zinc-900 border-zinc-850 text-zinc-650"
                          : "bg-[#0d0d0e] border-zinc-850 text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      + {role === "frontend" ? "Frontend" : role === "backend" ? "Backend" : role === "db" ? "Postgres" : "Redis Cache"}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Node Detail Inspector */}
          <div className="p-4 bg-[#0d0d0e] rounded-[12px] border border-zinc-800/25 flex-1 select-text text-left flex flex-col justify-start">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-550 mb-1.5">
              Node Parameters Inspector:
            </span>
            
            {selectedNode ? (
              <div className="flex flex-col gap-2 font-sans animate-fadeIn">
                <h4 className="text-[11px] font-extrabold text-white flex items-center gap-1.5">
                  {selectedNode.role === "db" ? <Database className="w-4 h-4 text-zinc-350" /> : <Server className="w-4 h-4 text-zinc-300" />}
                  {selectedNode.name}
                </h4>
                <div className="flex flex-col gap-1 border-t border-zinc-850/50 pt-2 mt-1 text-[9px] font-semibold">
                  <div className="flex justify-between">
                    <span className="text-zinc-550">IPv4 Address:</span>
                    <span className="text-zinc-200 font-mono">{networkRunning ? selectedNode.ip : "allocation pending"}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-900/40 pt-1.5">
                    <span className="text-zinc-550">Open Ports:</span>
                    <span className="text-zinc-200 font-mono">{selectedNode.ports}/TCP</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-900/40 pt-1.5">
                    <span className="text-zinc-550">Connected Bridge:</span>
                    <span className="text-zinc-200 font-mono">app-net</span>
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-[8.5px] text-zinc-650 italic p-3 font-sans">
                {networkRunning 
                  ? "Click container nodes on canvas to inspect network namespace metrics and allocated IP bounds."
                  : "Assemble containers to bridge network namespace."
                }
              </span>
            )}
          </div>

          {networkRunning && (
            <div className="p-3 rounded-[12px] bg-[#0d0d0e] border border-zinc-850 text-[9px] text-zinc-350 leading-relaxed flex items-start gap-2 select-text font-sans">
              <CheckCircle2 className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <span>
                {formatMarkdownNode("**NETWORK RUNNING!** Virtual ethernet pairs (`veth`) are allocated. Connected containers negotiate straight routes via IP addressing namespaces dynamically.")}
              </span>
            </div>
          )}

          {networkExists && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Builder
            </button>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
