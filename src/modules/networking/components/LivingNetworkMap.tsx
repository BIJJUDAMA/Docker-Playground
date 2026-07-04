"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle, Monitor, Server, Database, Activity, RefreshCw } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

interface ConnectionState {
  id: string;
  source: string;
  target: string;
  active: boolean;
}

export default function LivingNetworkMap() {
  const [connections, setConnections] = useState<ConnectionState[]>([
    { id: "browser_front", source: "browser", target: "front", active: true },
    { id: "front_back", source: "front", target: "back", active: true },
    { id: "back_db", source: "back", target: "db", active: true },
    { id: "back_redis", source: "back", target: "redis", active: true }
  ]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [terminalLog, setTerminalLog] = useState("Click nodes or paths to inspect network status. Click cables to sever connections.");

  const toggleConnection = (id: string) => {
    setConnections(prev => prev.map(c => 
      c.id === id ? { ...c, active: !c.active } : c
    ));
    
    const conn = connections.find(c => c.id === id);
    if (conn) {
      setTerminalLog(conn.active 
        ? `Severed cable between ${conn.source} and ${conn.target}! Dynamic routing packets dropped.`
        : `Restored connection between ${conn.source} and ${conn.target}. Traffic resumes.`
      );
    }
  };

  const handleReset = () => {
    setConnections([
      { id: "browser_front", source: "browser", target: "front", active: true },
      { id: "front_back", source: "front", target: "back", active: true },
      { id: "back_db", source: "back", target: "db", active: true },
      { id: "back_redis", source: "back", target: "redis", active: true }
    ]);
    setSelectedNode(null);
    setTerminalLog("Click nodes or paths to inspect network status. Click cables to sever connections.");
  };

  // Node parameters for details
  const getNodeDetails = () => {
    if (!selectedNode) return null;
    
    switch (selectedNode) {
      case "browser":
        return {
          name: "Client Browser",
          connected: "host interface (port 8080)",
          reachable: connections.find(c => c.id === "browser_front")?.active ? "web-front" : "none",
          isolated: "api-service, db-postgres, cache-redis"
        };
      case "front":
        return {
          name: "web-front container",
          connected: "app-net (172.18.0.2)",
          reachable: cn(
            connections.find(c => c.id === "browser_front")?.active && "browser",
            connections.find(c => c.id === "front_back")?.active && "api-service"
          ) || "none",
          isolated: "db-postgres, cache-redis"
        };
      case "back":
        return {
          name: "api-service container",
          connected: "app-net (172.18.0.3)",
          reachable: cn(
            connections.find(c => c.id === "front_back")?.active && "web-front",
            connections.find(c => c.id === "back_db")?.active && "db-postgres",
            connections.find(c => c.id === "back_redis")?.active && "cache-redis"
          ) || "none",
          isolated: "browser"
        };
      case "db":
        return {
          name: "db-postgres container",
          connected: "app-net (172.18.0.4)",
          reachable: connections.find(c => c.id === "back_db")?.active ? "api-service" : "none",
          isolated: "web-front, browser, cache-redis"
        };
      case "redis":
        return {
          name: "cache-redis container",
          connected: "app-net (172.18.0.5)",
          reachable: connections.find(c => c.id === "back_redis")?.active ? "api-service" : "none",
          isolated: "web-front, browser, db-postgres"
        };
      default:
        return null;
    }
  };

  const details = getNodeDetails();

  return (
    <VisualCanvas
      objective="Observe a living Docker bridge ecosystem: monitor constant loop ping traffic, sever cables, and watch packets reroute."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Living Network Map
          </div>
          <p>
            Networking is a **dynamic ecosystem**. Even when idle, nodes continuously exchange heartbeats, API stats, and DB verification queries.
          </p>
          <p>
            Click cables to cut connections, and click container nodes to inspect allocated namespaces and reachable peers.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Living Topology Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          <div className="w-full max-w-sm flex flex-col items-center justify-center relative min-h-[240px]">
            
            {/* SVG loops packets tracks */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden sm:block">
              {/* Browser (x: 195, y: 15) -> Front (x: 195, y: 75) */}
              {connections.find(c => c.id === "browser_front")?.active && (
                <>
                  <line x1={195} y1={25} x2={195} y2={75} stroke="#22c55e" strokeWidth="1.5" className="animate-pulse" />
                  <circle cx="195" cy="25" r="2.5" fill="#22c55e">
                    <animateMotion path="M 195 25 L 195 75" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                </>
              )}

              {/* Front (x: 195, y: 75) -> Back (x: 195, y: 135) */}
              {connections.find(c => c.id === "front_back")?.active && (
                <>
                  <line x1={195} y1={75} x2={195} y2={135} stroke="#FAFAFA" strokeWidth="1.5" />
                  <circle cx="195" cy="75" r="2.5" fill="#FAFAFA">
                    <animateMotion path="M 195 75 L 195 135" dur="2s" repeatCount="indefinite" />
                  </circle>
                </>
              )}

              {/* Back (x: 195, y: 135) -> DB (x: 100, y: 200) */}
              {connections.find(c => c.id === "back_db")?.active && (
                <>
                  <line x1={195} y1={135} x2={100} y2={200} stroke="#FAFAFA" strokeWidth="1" strokeDasharray="3" />
                  <circle cx="195" cy="135" r="2" fill="#FAFAFA">
                    <animateMotion path="M 195 135 L 100 200" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                </>
              )}

              {/* Back (x: 195, y: 135) -> Redis (x: 290, y: 200) */}
              {connections.find(c => c.id === "back_redis")?.active && (
                <>
                  <line x1={195} y1={135} x2={290} y2={200} stroke="#FAFAFA" strokeWidth="1" strokeDasharray="3" />
                  <circle cx="195" cy="135" r="2" fill="#FAFAFA">
                    <animateMotion path="M 195 135 L 290 200" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
            </svg>

            {/* Clickable cable buttons overlays */}
            {connections.map((c) => {
              // Position small buttons on top of connection midpoints
              let style: React.CSSProperties = {};
              if (c.id === "browser_front") style = { left: "185px", top: "42px" };
              else if (c.id === "front_back") style = { left: "185px", top: "100px" };
              else if (c.id === "back_db") style = { left: "135px", top: "160px" };
              else if (c.id === "back_redis") style = { left: "235px", top: "160px" };

              return (
                <button
                  key={c.id}
                  onClick={() => toggleConnection(c.id)}
                  style={style}
                  className={cn(
                    "absolute py-0.5 px-1.5 rounded-[4px] text-[6px] font-mono font-bold tracking-wider border cursor-pointer z-20 transition-all",
                    c.active 
                      ? "bg-[#0d0d0e] border-zinc-850 text-zinc-550 hover:border-red-900/40 hover:text-red-400" 
                      : "bg-red-950/20 border-red-500/20 text-red-400 hover:text-white"
                  )}
                >
                  {c.active ? "CUT" : "PLUG"}
                </button>
              );
            })}

            {/* Nodes Layout */}
            
            {/* 1. Client Browser (Top) */}
            <div 
              onClick={() => setSelectedNode("browser")}
              className="absolute left-[140px] top-[0px] w-28 text-center z-10 cursor-pointer"
            >
              <div className={cn(
                "p-1.5 rounded-[8px] border bg-[#0d0d0e] flex items-center justify-center gap-1.5 transition-all duration-300",
                selectedNode === "browser" ? "border-white text-white font-bold" : "border-zinc-850 text-zinc-500"
              )}>
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">Browser</span>
              </div>
            </div>

            {/* 2. Frontend web-front (Middle Top) */}
            <div 
              onClick={() => setSelectedNode("front")}
              className="absolute left-[140px] top-[70px] w-28 text-center z-10 cursor-pointer"
            >
              <div className={cn(
                "p-1.5 rounded-[8px] border bg-[#0d0d0e] flex items-center justify-center gap-1.5 transition-all duration-300",
                selectedNode === "front" ? "border-white text-white font-bold" : "border-zinc-850 text-zinc-400"
              )}>
                <Server className="w-3.5 h-3.5" />
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">web-front</span>
              </div>
            </div>

            {/* 3. Backend api-service (Middle Bottom) */}
            <div 
              onClick={() => setSelectedNode("back")}
              className="absolute left-[140px] top-[130px] w-28 text-center z-10 cursor-pointer"
            >
              <div className={cn(
                "p-1.5 rounded-[8px] border bg-[#0d0d0e] flex items-center justify-center gap-1.5 transition-all duration-300",
                selectedNode === "back" ? "border-white text-white font-bold" : "border-zinc-850 text-zinc-400"
              )}>
                <Server className="w-3.5 h-3.5" />
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">api-service</span>
              </div>
            </div>

            {/* 4. Database postgres (Bottom Left) */}
            <div 
              onClick={() => setSelectedNode("db")}
              className="absolute left-[30px] top-[195px] w-28 text-center z-10 cursor-pointer"
            >
              <div className={cn(
                "p-1.5 rounded-[8px] border bg-[#0d0d0e] flex items-center justify-center gap-1.5 transition-all duration-300",
                selectedNode === "db" ? "border-white text-white font-bold" : "border-zinc-850 text-zinc-500"
              )}>
                <Database className="w-3.5 h-3.5 text-zinc-450" />
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">db-postgres</span>
              </div>
            </div>

            {/* 5. Redis Cache (Bottom Right) */}
            <div 
              onClick={() => setSelectedNode("redis")}
              className="absolute left-[250px] top-[195px] w-28 text-center z-10 cursor-pointer"
            >
              <div className={cn(
                "p-1.5 rounded-[8px] border bg-[#0d0d0e] flex items-center justify-center gap-1.5 transition-all duration-300",
                selectedNode === "redis" ? "border-white text-white font-bold" : "border-zinc-850 text-zinc-500"
              )}>
                <Server className="w-3.5 h-3.5 text-zinc-450" />
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">cache-redis</span>
              </div>
            </div>

          </div>

        </div>

        {/* Selected node inspect details panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Live Monitor
            </span>
            <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5 font-sans">
              <Activity className="w-4 h-4 text-green-400" />
              Ecosystem stats
            </h4>
            <p className="text-xs text-zinc-450 leading-relaxed font-normal mt-2 select-text font-sans">
              Click elements to inspect allocated namespaces.
            </p>
          </div>

          {/* Node specifics list details */}
          <div className="p-3.5 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 flex-1 flex flex-col gap-2 font-sans select-text text-left">
            {details ? (
              <div className="flex flex-col gap-2.5 animate-fadeIn">
                <span className="text-[8.5px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                  Inspect: {details.name}
                </span>
                <div className="flex flex-col gap-1.5 text-[9px] font-semibold border-t border-zinc-900/40 pt-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-550">Connected:</span>
                    <span className="text-white font-mono">{details.connected}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-900/30 pt-1.5">
                    <span className="text-zinc-550">Reachable Nodes:</span>
                    <span className="text-zinc-200">{details.reachable}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-t border-zinc-900/30 pt-1.5">
                    <span className="text-zinc-550">Isolated Bounds:</span>
                    <span className="text-zinc-400 text-[8.5px] leading-normal">{details.isolated}</span>
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-[8.5px] text-zinc-650 italic p-3 text-center">
                Click container nodes on canvas to inspect active namespaces and peer scopes.
              </span>
            )}
          </div>

          {/* Trace console log */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col min-h-[90px] overflow-hidden select-text font-sans">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0">
              <span className="text-[7.5px] font-mono text-zinc-550 font-bold">Cable trace output:</span>
            </div>
            <div className="p-3 font-mono text-[9px] text-zinc-400 leading-relaxed flex-1 overflow-y-auto">
              {terminalLog}
            </div>
          </div>

          {connections.some(c => !c.active) && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none font-sans"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Connections
            </button>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
