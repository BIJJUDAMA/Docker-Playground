"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle, Database, Layers, Folder, HardDrive, Box, Eye } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

type NodeType = "none" | "image" | "container" | "writable" | "volume" | "bind" | "disk" | "host_folder";

export default function DockerStorageMap() {
  const [hoveredNode, setHoveredNode] = useState<NodeType>("none");
  const [selectedNode, setSelectedNode] = useState<NodeType>("none");

  const activeNode = selectedNode !== "none" ? selectedNode : hoveredNode;

  // Determine if a node should glow based on highlights rules
  const isHighlighted = (node: NodeType): boolean => {
    if (activeNode === "none") return false;
    if (activeNode === node) return true;

    // Highlights pathways
    switch (activeNode) {
      case "container":
        return ["image", "writable", "volume", "bind", "disk", "host_folder"].includes(node);
      case "image":
        return ["container"].includes(node);
      case "volume":
        return ["container", "disk"].includes(node);
      case "disk":
        return ["volume", "container"].includes(node);
      case "bind":
        return ["container", "host_folder"].includes(node);
      case "host_folder":
        return ["bind", "container"].includes(node);
      case "writable":
        return ["container"].includes(node);
      default:
        return false;
    }
  };

  const handleReset = () => {
    setSelectedNode("none");
    setHoveredNode("none");
  };

  // Get explanation texts dynamically
  const getExplanation = () => {
    switch (activeNode) {
      case "image":
        return "Images are read-only templates. The container mounts this structure to run, but never writes data back to it directly.";
      case "container":
        return "Containers represent the running execution instance. They write data to the thin local writable layer or delegate to external volume mounts.";
      case "writable":
        return "The thin container-local write layer. Writes are fast but destroyed the instant the container process is deleted.";
      case "volume":
        return "A Docker-managed volume. Stored on the host's physical disk under /var/lib/docker/volumes/, decoupled from the container process.";
      case "bind":
        return "A direct link between a specific folder on your host machine and a path inside the running container workspace.";
      case "disk":
        return "The actual raw storage sector of the host. Named volumes are physically stored here under Docker's private directory.";
      case "host_folder":
        return "Your local workspace folder on the host computer. Changes made here via VS Code reflect inside the container instantly.";
      default:
        return "Click or hover any storage node to trace its physical mapping path and connection lifecycle.";
    }
  };

  return (
    <VisualCanvas
      objective="Explore the physical architecture of Docker storage: trace read-only images, container write layers, volumes, and bind mounts."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Storage Architecture
          </div>
          <p>
            Docker storage resolves down to: **ephemeral storage** inside container write layers, and **persistent storage** mapped outside container life bounds.
          </p>
          <p>
            Hover or click nodes on the host map to visualize physical connections and file paths.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Schematic Map (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[360px] overflow-hidden">
          
          <span className="absolute top-4 left-6 text-[8.5px] font-mono font-bold uppercase tracking-wider text-zinc-550 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-zinc-500" />
            Host Machine cross-section
          </span>

          <div className="w-full max-w-lg h-60 relative flex items-center justify-center">
            
            {/* SVG Connection Paths */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden sm:block">
              {/* Image -> Container */}
              <line 
                x1={140} y1={50} x2={340} y2={50} 
                stroke={isHighlighted("image") && isHighlighted("container") ? "#FAFAFA" : "#1f1f23"} 
                strokeWidth={isHighlighted("image") && isHighlighted("container") ? 1.5 : 1}
                className="transition-all duration-300"
              />
              {/* Container -> Writable Layer */}
              <line 
                x1={340} y1={50} x2={340} y2={120} 
                stroke={isHighlighted("container") && isHighlighted("writable") ? "#FAFAFA" : "#1f1f23"} 
                strokeWidth={isHighlighted("container") && isHighlighted("writable") ? 1.5 : 1}
                className="transition-all duration-300"
              />
              {/* Writable -> Volume */}
              <line 
                x1={340} y1={120} x2={190} y2={120} 
                stroke={isHighlighted("container") && isHighlighted("volume") ? "#FAFAFA" : "#1f1f23"} 
                strokeWidth={isHighlighted("container") && isHighlighted("volume") ? 1.5 : 1}
                className="transition-all duration-300"
              />
              {/* Writable -> Bind Mount */}
              <line 
                x1={340} y1={120} x2={340} y2={180} 
                stroke={isHighlighted("container") && isHighlighted("bind") ? "#FAFAFA" : "#1f1f23"} 
                strokeWidth={isHighlighted("container") && isHighlighted("bind") ? 1.5 : 1}
                className="transition-all duration-300"
              />
              {/* Volume -> Disk */}
              <line 
                x1={190} y1={120} x2={190} y2={180} 
                stroke={isHighlighted("volume") && isHighlighted("disk") ? "#FAFAFA" : "#1f1f23"} 
                strokeWidth={isHighlighted("volume") && isHighlighted("disk") ? 1.5 : 1}
                className="transition-all duration-300"
              />
              {/* Bind Mount -> Host Folder */}
              <line 
                x1={340} y1={180} x2={340} y2={230} 
                stroke={isHighlighted("bind") && isHighlighted("host_folder") ? "#FAFAFA" : "#1f1f23"} 
                strokeWidth={isHighlighted("bind") && isHighlighted("host_folder") ? 1.5 : 1}
                className="transition-all duration-300"
              />
            </svg>

            {/* Grid of absolute nodes */}
            
            {/* 1. Images (Top Left) */}
            <div 
              onMouseEnter={() => setHoveredNode("image")}
              onMouseLeave={() => setHoveredNode("none")}
              onClick={() => setSelectedNode(selectedNode === "image" ? "none" : "image")}
              className="absolute left-[50px] top-[15px] w-32 cursor-pointer z-10"
            >
              <div className={cn(
                "p-2.5 rounded-[9px] border bg-[#0d0d0e] text-center flex flex-col items-center justify-center gap-1 transition-all duration-300",
                isHighlighted("image") ? "border-white text-white shadow-sm" : "border-zinc-850 text-zinc-500"
              )}>
                <Layers className="w-4 h-4 shrink-0 text-zinc-450" />
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">Images (node:22)</span>
              </div>
            </div>

            {/* 2. Containers (Top Right) */}
            <div 
              onMouseEnter={() => setHoveredNode("container")}
              onMouseLeave={() => setHoveredNode("none")}
              onClick={() => setSelectedNode(selectedNode === "container" ? "none" : "container")}
              className="absolute left-[270px] top-[15px] w-36 cursor-pointer z-10"
            >
              <div className={cn(
                "p-2.5 rounded-[9px] border bg-[#0d0d0e] text-center flex flex-col items-center justify-center gap-1 transition-all duration-300",
                isHighlighted("container") ? "border-white text-white shadow-sm" : "border-zinc-850 text-zinc-500"
              )}>
                <Box className="w-4 h-4 shrink-0 text-zinc-300" />
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">Containers (app)</span>
              </div>
            </div>

            {/* 3. Writable Layer (Middle Right) */}
            <div 
              onMouseEnter={() => setHoveredNode("writable")}
              onMouseLeave={() => setHoveredNode("none")}
              onClick={() => setSelectedNode(selectedNode === "writable" ? "none" : "writable")}
              className="absolute left-[270px] top-[95px] w-36 cursor-pointer z-10"
            >
              <div className={cn(
                "p-2 rounded-[9px] border bg-[#0d0d0e] text-center flex flex-col items-center justify-center gap-1 transition-all duration-300",
                isHighlighted("writable") ? "border-white text-white shadow-sm" : "border-zinc-850 text-zinc-550"
              )}>
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">Writable Layer</span>
                <span className="text-[6.5px] text-zinc-650 font-sans italic">Temporary storage</span>
              </div>
            </div>

            {/* 4. Volumes (Middle Left) */}
            <div 
              onMouseEnter={() => setHoveredNode("volume")}
              onMouseLeave={() => setHoveredNode("none")}
              onClick={() => setSelectedNode(selectedNode === "volume" ? "none" : "volume")}
              className="absolute left-[120px] top-[95px] w-32 cursor-pointer z-10"
            >
              <div className={cn(
                "p-2 rounded-[9px] border bg-[#0d0d0e] text-center flex flex-col items-center justify-center gap-1 transition-all duration-300",
                isHighlighted("volume") ? "border-white text-white shadow-sm" : "border-zinc-850 text-zinc-550"
              )}>
                <HardDrive className="w-3.5 h-3.5 text-zinc-450" />
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">Volumes (db_data)</span>
              </div>
            </div>

            {/* 5. Bind Mounts (Bottom Middle Right) */}
            <div 
              onMouseEnter={() => setHoveredNode("bind")}
              onMouseLeave={() => setHoveredNode("none")}
              onClick={() => setSelectedNode(selectedNode === "bind" ? "none" : "bind")}
              className="absolute left-[270px] top-[160px] w-36 cursor-pointer z-10"
            >
              <div className={cn(
                "p-2 rounded-[9px] border bg-[#0d0d0e] text-center flex flex-col items-center justify-center gap-1 transition-all duration-300",
                isHighlighted("bind") ? "border-white text-white shadow-sm" : "border-zinc-850 text-zinc-550"
              )}>
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">Bind Mounts (/app)</span>
              </div>
            </div>

            {/* 6. Disk (Bottom Left) */}
            <div 
              onMouseEnter={() => setHoveredNode("disk")}
              onMouseLeave={() => setHoveredNode("none")}
              onClick={() => setSelectedNode(selectedNode === "disk" ? "none" : "disk")}
              className="absolute left-[120px] top-[205px] w-32 cursor-pointer z-10"
            >
              <div className={cn(
                "p-2.5 rounded-[9px] border bg-[#0d0d0e] text-center flex flex-col items-center justify-center gap-1 transition-all duration-300",
                isHighlighted("disk") ? "border-white text-white shadow-sm" : "border-zinc-850 text-zinc-550"
              )}>
                <Database className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[7px] font-mono font-bold uppercase tracking-wider">Disk Storage</span>
              </div>
            </div>

            {/* 7. Host Folder (Bottom Right) */}
            <div 
              onMouseEnter={() => setHoveredNode("host_folder")}
              onMouseLeave={() => setHoveredNode("none")}
              onClick={() => setSelectedNode(selectedNode === "host_folder" ? "none" : "host_folder")}
              className="absolute left-[270px] top-[215px] w-36 cursor-pointer z-10"
            >
              <div className={cn(
                "p-2 rounded-[9px] border bg-[#0d0d0e] text-center flex flex-col items-center justify-center gap-1 transition-all duration-300",
                isHighlighted("host_folder") ? "border-white text-white shadow-sm" : "border-zinc-850 text-zinc-550"
              )}>
                <Folder className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">Host Folder (/src)</span>
              </div>
            </div>

          </div>

        </div>

        {/* Info panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Engine Diagnostics
            </span>
            <h4 className="text-sm font-extrabold text-white">Physical Paths Inspector</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text font-sans">
              Trace storage directory bindings across the layout map.
            </p>
          </div>

          {/* Dynamic details description */}
          <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/25 text-[9.5px] text-zinc-450 leading-relaxed flex-1 select-text font-sans">
            <span className="font-bold text-zinc-250 block mb-1 font-mono uppercase tracking-wider text-[8px]">Details:</span>
            {getExplanation()}
          </div>

          {activeNode !== "none" && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none font-sans"
            >
              Clear Highlights
            </button>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
