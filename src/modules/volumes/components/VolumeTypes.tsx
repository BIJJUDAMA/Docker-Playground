"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { Folder, HardDrive, HelpCircle, Info } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

export default function VolumeTypes() {
  const [selectedType, setSelectedType] = useState<"bind" | "named">("bind");

  const containerRef = useRef<HTMLDivElement>(null);
  const pathLineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (pathLineRef.current) {
      const length = pathLineRef.current.getTotalLength();
      gsap.killTweensOf(pathLineRef.current);
      gsap.set(pathLineRef.current, { strokeDasharray: length, strokeDashoffset: length });

      gsap.to(pathLineRef.current, {
        strokeDashoffset: 0,
        duration: 0.8,
        ease: "power2.inOut"
      });
    }
  }, [selectedType]);

  return (
    <VisualCanvas
      objective="Understand how bind mounts and named volumes map files from host computers to containers."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Decoupling storage mounts
          </div>
          <p>
            Volumes are mapping hooks. Toggling Bind Mount vs Named Volume reveals how directory links bridge host filesystems. Bind Mounts target absolute paths directly. Named Volumes let Docker Engine manage directories behind the scenes.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Simulation Sandbox (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[300px]">
          {/* Mappings diagram container */}
          <div className="w-full flex-1 flex flex-col md:flex-row justify-between items-center max-w-lg relative py-8 gap-12 md:gap-0">
            
            {/* SVG Overlay for drawing mount lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" style={{ zIndex: 0 }}>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#FAFAFA" />
                </marker>
              </defs>
              {selectedType === "bind" ? (
                <path 
                  ref={pathLineRef}
                  d="M 190 77 C 240 77, 270 177, 318 177" 
                  fill="none" 
                  stroke="#FAFAFA" 
                  strokeWidth="2" 
                  markerEnd="url(#arrow)"
                />
              ) : (
                <path 
                  ref={pathLineRef}
                  d="M 190 191 C 240 191, 270 177, 318 177" 
                  fill="none" 
                  stroke="#FAFAFA" 
                  strokeWidth="2" 
                  markerEnd="url(#arrow)"
                />
              )}
            </svg>

            {/* Left Column: Host System directories */}
            <div className="flex flex-col gap-6 w-full max-w-[190px] relative z-10">
              
              {/* Box 1: Bind mount source */}
              <div className={cn(
                "p-3.5 rounded-[12px] border flex flex-col gap-1 transition-all duration-350",
                selectedType === "bind"
                  ? "border-zinc-700 bg-zinc-800/50 scale-[1.01]"
                  : "border-zinc-800/40 bg-[#0d0d0e]/60 opacity-40"
              )}>
                <div className="flex items-center gap-1.5 text-zinc-350">
                  <Folder className="w-3.5 h-3.5 text-zinc-300" />
                  <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Workspace dir</span>
                </div>
                <span className="text-[8px] font-mono text-zinc-400 block mt-1 truncate">
                  /host/workspace/app
                </span>
                <span className="text-[8px] text-zinc-550 leading-relaxed font-normal">
                  Direct mapping to files on host computer.
                </span>
              </div>

              {/* Box 2: Named Volume source */}
              <div className={cn(
                "p-3.5 rounded-[12px] border flex flex-col gap-1 transition-all duration-350",
                selectedType === "named"
                  ? "border-zinc-700 bg-zinc-800/50 scale-[1.01]"
                  : "border-zinc-800/40 bg-[#0d0d0e]/60 opacity-40"
              )}>
                <div className="flex items-center gap-1.5 text-zinc-350">
                  <HardDrive className="w-3.5 h-3.5 text-zinc-300" />
                  <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Docker Volumes</span>
                </div>
                <span className="text-[8px] font-mono text-zinc-400 block mt-1 truncate">
                  /var/lib/docker/volumes/db-data/_data
                </span>
                <span className="text-[8px] text-zinc-555 leading-relaxed font-normal">
                  Docker-managed folder isolated inside host.
                </span>
              </div>

            </div>
            
            {/* Right Column: Destination Container */}
            <div className="flex flex-col gap-4 w-full max-w-[190px] relative z-10 font-sans">
              <div className="p-4 rounded-[12px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-1 text-center justify-center min-h-[70px] shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-305">Container App</span>
              </div>
              
              <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-850 font-mono text-[9px] text-zinc-400 leading-normal flex flex-col justify-center min-h-[54px] relative select-text">
                <span className="text-[7.5px] text-zinc-550 uppercase font-bold tracking-wider block mb-1">Target Directory</span>
                /app/data
                
                {selectedType === "bind" && (
                  <div className="absolute inset-0 bg-white/5 rounded-[12px] flex items-center justify-center text-[7px] text-white font-bold uppercase tracking-widest pointer-events-none border border-white/10 animate-fadeIn font-sans">
                    Bind Mounted
                  </div>
                )}
                {selectedType === "named" && (
                  <div className="absolute inset-0 bg-white/5 rounded-[12px] flex items-center justify-center text-[7px] text-white font-bold uppercase tracking-widest pointer-events-none border border-white/10 animate-fadeIn font-sans">
                    Named Mounted
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Mount Type Inspector sidebar (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Mount Type Sandbox
            </span>
            <h4 className="text-sm font-extrabold text-white font-sans">Select Mount Type</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text font-sans">
              Toggle mapping types to inspect syntax differences and use cases.
            </p>
          </div>

          <div className="flex gap-2 select-none shrink-0 font-sans">
            <button
              onClick={() => setSelectedType("bind")}
              className={cn(
                "flex-1 py-2 rounded-[9px] text-[9px] font-bold uppercase transition-all cursor-pointer border border-zinc-850",
                selectedType === "bind"
                  ? "bg-zinc-800 text-white border-zinc-700"
                  : "bg-[#0d0d0e] text-zinc-450 hover:bg-zinc-855"
              )}
            >
              Bind Mount
            </button>
            <button
              onClick={() => setSelectedType("named")}
              className={cn(
                "flex-1 py-2 rounded-[9px] text-[9px] font-bold uppercase transition-all cursor-pointer border border-zinc-850",
                selectedType === "named"
                  ? "bg-zinc-800 text-white border-zinc-700"
                  : "bg-[#0d0d0e] text-zinc-450 hover:bg-zinc-855"
              )}
            >
              Named Volume
            </button>
          </div>

          {/* Detailed Explanation */}
          <div className="flex-1 flex flex-col justify-start select-text mt-2 font-sans">
            {selectedType === "bind" ? (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Info className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-bold uppercase tracking-wider font-sans">Bind Mount Details</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-normal">
                  Maps a specific host folder path directly inside the container instance.
                  <br /><br />
                  <strong>Best for:</strong> Development environments. Code alterations on the host reflect instantly inside the sandbox workspace, facilitating immediate hot-reloading.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Info className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-bold uppercase tracking-wider font-sans">Named Volume Details</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-normal">
                  Maps an engine-managed backend storage directory onto a container path.
                  <br /><br />
                  <strong>Best for:</strong> Production databases. Protects persistent configurations and databases from arbitrary modifications by users or host system changes.
                </p>
              </div>
            )}
          </div>

          {/* Command Syntax Info box */}
          <div className="p-3 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 font-mono text-[9px] mt-4 shrink-0 select-text leading-relaxed">
            <span className="text-zinc-550 font-bold block mb-1 uppercase text-[7.5px] font-sans select-none">
              CLI Mount syntax
            </span>
            {selectedType === "bind" ? (
              <code className="text-zinc-300 font-bold block truncate">
                docker run -v /host/path:/app/data nginx
              </code>
            ) : (
              <code className="text-zinc-300 font-bold block truncate">
                docker run -v db-data:/app/data nginx
              </code>
            )}
            <span className="text-zinc-500 text-[8px] font-sans block mt-1 leading-normal font-normal select-none">
              {selectedType === "bind" 
                ? "Specifies an absolute host folder path before the colon." 
                : "Specifies a name string (db-data) before the colon."}
            </span>
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
