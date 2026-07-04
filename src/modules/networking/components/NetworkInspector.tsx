"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Laptop, Network, Database, ShieldAlert, HelpCircle } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";
import EdgePrimitive from "@/components/primitives/EdgePrimitive";

interface InspectorNode {
  id: string;
  name: string;
  role: string;
  ip: string;
  ports: string;
  desc: string;
}

const NODES_DATA: InspectorNode[] = [
  { id: "browser", name: "Client Browser", role: "External Client", ip: "192.168.1.50", ports: "Local outgoing", desc: "Requests are sent from user's laptop using standard port bindings mapped on the host interface." },
  { id: "nginx", name: "nginx-proxy", role: "Reverse Proxy", ip: "172.20.0.2", ports: "80:80 (Host mapped)", desc: "Intercepts incoming host request payloads, handles SSL termination, and routes traffic inside Docker bridges." },
  { id: "api", name: "node-api", role: "Backend App", ip: "172.20.0.3", ports: "3000 (Internal only)", desc: "Processes database queries. It does not publish host ports directly, preventing public access." },
  { id: "db", name: "postgres-db", role: "Database Server", ip: "172.20.0.4", ports: "5432 (Internal only)", desc: "Holds persistent sql datasets. Safe from host scans because it resides on the isolated subnet." }
];

export default function NetworkInspector() {
  const [clickedNodeId, setClickedNodeId] = useState<string>("nginx");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const activeNodeId = hoveredNodeId || clickedNodeId;
  const activeNode = NODES_DATA.find((n) => n.id === activeNodeId) || NODES_DATA[1];

  return (
    <VisualCanvas
      objective="Inspect multi-container application topologies to see how security boundaries isolate private databases from external ports."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            What is production network isolation?
          </div>
          <p>
            In production, only front-facing nodes (like reverse proxies or ingress controllers) should map ports directly to the host computer (`80:80` or `443:443`).
          </p>
          <p>
            Private API services and databases are kept isolated within the internal bridge subnet. They communicate securely over internal networks without publishing ports to the public internet.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Node graph mapping canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px]">
          
          {/* SVG Overlay lines drawing connection points */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Browser -> Nginx */}
            <EdgePrimitive x1={95} y1={140} x2={220} y2={140} curveType="straight" active={activeNodeId === "browser" || activeNodeId === "nginx"} />
            {/* Nginx -> API */}
            <EdgePrimitive x1={220} y1={140} x2={340} y2={80} curveType="straight" active={activeNodeId === "nginx" || activeNodeId === "api"} />
            {/* API -> DB */}
            <EdgePrimitive x1={340} y1={80} x2={465} y2={140} curveType="straight" active={activeNodeId === "api" || activeNodeId === "db"} />
          </svg>

          <div className="w-full max-w-xl h-48 relative z-10 flex items-center justify-between px-2">
            
            {/* Client Browser */}
            <div 
              onMouseEnter={() => setHoveredNodeId("browser")}
              onMouseLeave={() => setHoveredNodeId(null)}
              onClick={() => setClickedNodeId("browser")}
              className="w-32 cursor-pointer hover:scale-[1.01] transition-transform"
            >
              <NodePrimitive
                label="Laptop"
                status={activeNodeId === "browser" ? "running" : "idle"}
                icon={<Laptop className="w-4 h-4 text-zinc-300" />}
                subtitle="Host PC"
                className="py-2.5 px-2 rounded-[12px]"
              />
            </div>

            {/* Nginx Ingress */}
            <div 
              onMouseEnter={() => setHoveredNodeId("nginx")}
              onMouseLeave={() => setHoveredNodeId(null)}
              onClick={() => setClickedNodeId("nginx")}
              className="w-32 cursor-pointer hover:scale-[1.01] transition-transform"
            >
              <NodePrimitive
                label="nginx-proxy"
                status={activeNodeId === "nginx" ? "running" : "idle"}
                icon={<Network className="w-4 h-4 text-zinc-300" />}
                subtitle="Port 80:80"
                className="py-2.5 px-2 rounded-[12px]"
              />
            </div>

            {/* API Service */}
            <div className="flex flex-col gap-12">
              <div 
                onMouseEnter={() => setHoveredNodeId("api")}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={() => setClickedNodeId("api")}
                className="w-32 cursor-pointer hover:scale-[1.01] transition-transform"
              >
                <NodePrimitive
                  label="node-api"
                  status={activeNodeId === "api" ? "running" : "idle"}
                  icon={<Network className="w-4 h-4 text-zinc-300" />}
                  subtitle="Port 3000"
                  className="py-2.5 px-2 rounded-[12px]"
                />
              </div>
            </div>

            {/* Database Server */}
            <div 
              onMouseEnter={() => setHoveredNodeId("db")}
              onMouseLeave={() => setHoveredNodeId(null)}
              onClick={() => setClickedNodeId("db")}
              className="w-32 cursor-pointer hover:scale-[1.01] transition-transform"
            >
              <NodePrimitive
                label="postgres-db"
                status={activeNodeId === "db" ? "running" : "idle"}
                icon={<Database className="w-4 h-4 text-zinc-300" />}
                subtitle="Port 5432"
                className="py-2.5 px-2 rounded-[12px]"
              />
            </div>

          </div>
        </div>

        {/* Selected connection details inspector (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Topography Inspector
            </span>
            <h4 className="text-base font-extrabold text-white flex items-center gap-1.5 font-sans">
              {activeNode.name}
            </h4>
            <span className="text-[9.5px] font-bold text-zinc-550 block font-mono">{activeNode.role}</span>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-3 select-text font-sans">
              {activeNode.desc}
            </p>
          </div>

          {/* Node specifics table config */}
          <div className="space-y-2 pt-3 border-t border-zinc-850 select-text font-sans">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-zinc-555">Internal IP Address:</span>
              <span className="font-mono text-zinc-200">{activeNode.ip}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-zinc-555">Mapped Ports:</span>
              <span className="font-mono text-zinc-300 font-bold">{activeNode.ports}</span>
            </div>
          </div>

          {/* Subnet warning alerts */}
          <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-850 text-[10px] text-zinc-450 leading-relaxed mt-auto select-text flex items-start gap-2 font-sans">
            <ShieldAlert className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <span>
              {activeNodeId === "db" && "Highly secure: Because postgres-db does not configure host mapping parameters (-p 5432:5432), port scanners cannot detect it from public interfaces."}
              {activeNodeId === "nginx" && "Exposed gateway: Maps port 80 directly. It must handle routing headers and drop unauthenticated payload packets."}
              {activeNodeId === "api" && "Internal routing only: Service communicates with Nginx and Database components inside bridge bounds securely."}
              {activeNodeId === "browser" && "Origin client: Routes through public gateways to reach container endpoints."}
            </span>
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
