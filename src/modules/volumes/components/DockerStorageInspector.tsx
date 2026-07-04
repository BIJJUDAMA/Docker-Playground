"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle, Database, Layers, Folder, HardDrive, Box, Terminal, Eye } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

type InspectCategory = "container" | "volume" | "image" | "host";

export default function DockerStorageInspector() {
  const [activeCategory, setActiveCategory] = useState<InspectCategory>("container");

  const getDiagnosticsLog = () => {
    switch (activeCategory) {
      case "container":
        return "docker inspect app-container";
      case "volume":
        return "docker volume inspect db_data";
      case "image":
        return "docker image inspect node:22";
      case "host":
        return "ls -la /Users/workspace/src";
    }
  };

  return (
    <VisualCanvas
      objective="Trace container, volume, and image configurations through a Chrome DevTools-inspired inspector view."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Storage Inspector
          </div>
          <p>
            Explore how Docker's engine metadata organizes storage bounds. 
          </p>
          <p>
            Click categories on the left console to load inspect schemas on the right.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Category List Sidebar (Left) */}
        <div className="w-full md:w-56 p-4 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-3 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Docker Objects
            </span>
            <h4 className="text-xs font-bold text-white">Select Object</h4>
          </div>

          <div className="flex flex-col gap-2 font-mono text-[9px] font-bold">
            <button
              onClick={() => setActiveCategory("container")}
              className={cn(
                "py-2 px-3 rounded-[6px] border text-left flex items-center gap-2 transition-colors cursor-pointer",
                activeCategory === "container" 
                  ? "bg-white text-black border-transparent" 
                  : "bg-[#0d0d0e] border-zinc-850 text-zinc-450 hover:text-zinc-200"
              )}
            >
              <Box className="w-3.5 h-3.5" />
              Containers
            </button>
            <button
              onClick={() => setActiveCategory("volume")}
              className={cn(
                "py-2 px-3 rounded-[6px] border text-left flex items-center gap-2 transition-colors cursor-pointer",
                activeCategory === "volume" 
                  ? "bg-white text-black border-transparent" 
                  : "bg-[#0d0d0e] border-zinc-850 text-zinc-450 hover:text-zinc-200"
              )}
            >
              <HardDrive className="w-3.5 h-3.5" />
              Volumes
            </button>
            <button
              onClick={() => setActiveCategory("image")}
              className={cn(
                "py-2 px-3 rounded-[6px] border text-left flex items-center gap-2 transition-colors cursor-pointer",
                activeCategory === "image" 
                  ? "bg-white text-black border-transparent" 
                  : "bg-[#0d0d0e] border-zinc-850 text-zinc-450 hover:text-zinc-200"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              Images
            </button>
            <button
              onClick={() => setActiveCategory("host")}
              className={cn(
                "py-2 px-3 rounded-[6px] border text-left flex items-center gap-2 transition-colors cursor-pointer",
                activeCategory === "host" 
                  ? "bg-white text-black border-transparent" 
                  : "bg-[#0d0d0e] border-zinc-850 text-zinc-450 hover:text-zinc-200"
              )}
            >
              <Folder className="w-3.5 h-3.5" />
              Host Workspace
            </button>
          </div>
        </div>

        {/* DevTools Inspector Panel (Right/Center) */}
        <div className="flex-1 flex flex-col items-stretch justify-start p-5 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px]">
          
          {/* Header Tab Shell */}
          <div className="bg-[#1a1a1e] px-4 py-2.5 border-b border-zinc-850 flex items-center justify-between shrink-0 rounded-t-[10px] select-text">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-zinc-550 shrink-0" />
              <span className="text-[9px] font-mono text-zinc-400 font-bold">{getDiagnosticsLog()}</span>
            </div>
            <span className="text-[7.5px] uppercase font-mono tracking-wider font-bold text-zinc-550">inspect mode</span>
          </div>

          {/* Details Body container */}
          <div className="flex-1 p-5 bg-[#0d0d0e] rounded-b-[10px] flex flex-col justify-start select-text overflow-y-auto custom-scrollbar font-mono text-[9.5px]">
            
            {activeCategory === "container" && (
              <div className="flex flex-col gap-3.5 animate-fadeIn text-zinc-400 leading-relaxed">
                <div>
                  <span className="text-zinc-550 block uppercase text-[7.5px] font-bold">Container Name</span>
                  <span className="text-white font-bold text-xs font-sans">app-container (Running)</span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-zinc-900/60 pt-3">
                  <div>
                    <span className="text-zinc-550 block uppercase text-[7.5px] font-bold">Base Image Used</span>
                    <span className="text-zinc-200">node:22-alpine</span>
                  </div>
                  <div>
                    <span className="text-zinc-550 block uppercase text-[7.5px] font-bold">Thin Writable Layer</span>
                    <span className="text-zinc-200">18.4 MB (volatile)</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-zinc-900/60 pt-3">
                  <div>
                    <span className="text-zinc-550 block uppercase text-[7.5px] font-bold">Volume Mounts</span>
                    <span className="text-white font-bold">db_data (/var/lib/postgresql/data)</span>
                  </div>
                  <div>
                    <span className="text-zinc-550 block uppercase text-[7.5px] font-bold">Bind Mounts</span>
                    <span className="text-white font-bold">/src (/app/src)</span>
                  </div>
                </div>
                <div className="border-t border-zinc-900/60 pt-3 flex justify-between items-center text-[10px]">
                  <span className="text-zinc-550 font-bold uppercase text-[8px]">Total allocated Storage Size</span>
                  <span className="text-white font-bold">52.8 MB</span>
                </div>
              </div>
            )}

            {activeCategory === "volume" && (
              <div className="flex flex-col gap-3.5 animate-fadeIn text-zinc-400 leading-relaxed">
                <div>
                  <span className="text-zinc-550 block uppercase text-[7.5px] font-bold">Volume Label</span>
                  <span className="text-white font-bold text-xs font-sans">db_data</span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-zinc-900/60 pt-3">
                  <div>
                    <span className="text-zinc-550 block uppercase text-[7.5px] font-bold">Mounted By</span>
                    <span className="text-zinc-200">postgres-db (container)</span>
                  </div>
                  <div>
                    <span className="text-zinc-550 block uppercase text-[7.5px] font-bold">Volume Size</span>
                    <span className="text-white font-bold">840 MB (on host disk)</span>
                  </div>
                </div>
                <div className="border-t border-zinc-900/60 pt-3">
                  <span className="text-zinc-550 block uppercase text-[7.5px] font-bold">Files Count</span>
                  <span className="text-zinc-200">182 binary SQL directory blocks</span>
                </div>
                <div className="border-t border-zinc-900/60 pt-3">
                  <span className="text-zinc-550 block uppercase text-[7.5px] font-bold">Host Mount Path</span>
                  <span className="text-zinc-300 font-mono text-[8.5px]">/var/lib/docker/volumes/db_data/_data</span>
                </div>
              </div>
            )}

            {activeCategory === "image" && (
              <div className="flex flex-col gap-3.5 animate-fadeIn text-zinc-400 leading-relaxed">
                <div>
                  <span className="text-zinc-550 block uppercase text-[7.5px] font-bold">Image Tag</span>
                  <span className="text-white font-bold text-xs font-sans">node:22-alpine</span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-zinc-900/60 pt-3">
                  <div>
                    <span className="text-zinc-550 block uppercase text-[7.5px] font-bold">Shared By</span>
                    <span className="text-zinc-200">3 Container instances</span>
                  </div>
                  <div>
                    <span className="text-zinc-550 block uppercase text-[7.5px] font-bold">Total Stack Layers</span>
                    <span className="text-zinc-200">7 compilation layers</span>
                  </div>
                </div>
                <div className="border-t border-zinc-900/60 pt-3 flex justify-between items-center text-[10px]">
                  <span className="text-zinc-550 font-bold uppercase text-[8px]">Total Size on Disk</span>
                  <span className="text-white font-bold">642.5 MB (shared footprint)</span>
                </div>
              </div>
            )}

            {activeCategory === "host" && (
              <div className="flex flex-col gap-3.5 animate-fadeIn text-zinc-400 leading-relaxed">
                <div>
                  <span className="text-zinc-550 block uppercase text-[7.5px] font-bold">Host Path</span>
                  <span className="text-white font-bold text-xs font-sans">/Users/workspace/src</span>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-zinc-900/60 pt-3">
                  <div>
                    <span className="text-zinc-550 block uppercase text-[7.5px] font-bold">Mapped via</span>
                    <span className="text-zinc-200">Bind Mount</span>
                  </div>
                  <div>
                    <span className="text-zinc-550 block uppercase text-[7.5px] font-bold">Direct Access</span>
                    <span className="text-white font-bold">Yes (Host Editor Syncs Live)</span>
                  </div>
                </div>
                <div className="border-t border-zinc-900/60 pt-3">
                  <span className="text-zinc-550 block uppercase text-[7.5px] font-bold">Files Count</span>
                  <span className="text-zinc-200">15 source javascript components</span>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </VisualCanvas>
  );
}
