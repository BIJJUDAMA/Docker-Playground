"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle, RefreshCw, Folder, HardDrive, Cpu, Terminal, ArrowRight, ShieldCheck, Box, Trash2 } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

type StorageType = "none" | "named" | "bind" | "anon";

interface MountSpec {
  name: string;
  persistence: string;
  portability: string;
  performance: string;
  hostAccess: string;
  bestFor: string;
  desc: string;
}

const STORAGE_SPECS: Record<StorageType, MountSpec> = {
  none: {
    name: "No Persistent Storage",
    persistence: "None (Purged on container deletion)",
    portability: "N/A",
    performance: "Slight CoW CPU Overhead",
    hostAccess: "No direct host access",
    bestFor: "Scratch files, temporary compute processes",
    desc: "Writes directly to the container's thin writable layer. Easy and default, but completely ephemeral."
  },
  named: {
    name: "Named Volume",
    persistence: "Permanent (Survives container removal)",
    portability: "High (Managed via Docker CLI/API)",
    performance: "Native Host Disk Speeds",
    hostAccess: "Restricted (Managed under /var/lib/docker/)",
    bestFor: "Production databases (Postgres, MySQL, Redis)",
    desc: "Docker creates and manages a dedicated subdirectory on the host. Highly portable as Docker handles storage drivers."
  },
  bind: {
    name: "Bind Mount",
    persistence: "Permanent (Stored in custom host folders)",
    portability: "Low (Tied to host-specific folder paths)",
    performance: "Native Host Disk Speeds",
    hostAccess: "Yes (Direct file edits on host modify container)",
    bestFor: "Hot-reloading code during local Development",
    desc: "Maps an absolute directory path on the host computer directly to a folder path inside the running container."
  },
  anon: {
    name: "Anonymous Volume",
    persistence: "Temporary (Deleted automatically on --rm removals)",
    portability: "Low (Assigned a random UUID hash directory)",
    performance: "Native Host Disk Speeds",
    hostAccess: "Restricted (Stored in hashed folders)",
    bestFor: "Decoupling heavy caches from container write layers",
    desc: "Similar to named volumes but has no tag name (only a random hash ID). Automatically destroyed if the container is run with the --rm flag."
  }
};

export default function StoragePlayground() {
  const [selectedType, setSelectedType] = useState<StorageType>("named");
  const [containerState, setContainerState] = useState<"running" | "deleted">("running");

  const handleReset = () => {
    setSelectedType("named");
    setContainerState("running");
  };

  const spec = STORAGE_SPECS[selectedType];
  const isContainerAlive = containerState === "running";

  return (
    <VisualCanvas
      objective="Connect host folders or Docker volumes to container storage endpoints and observe data lifetimes when containers are removed."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Storage Mounting Sandbox
          </div>
          <p>
            Choose a mount configuration and observe how host paths connect to the container process. 
          </p>
          <p>
            Click **"Delete Container"** to test what data survives. You will discover that **Named Volumes** and **Bind Mounts** keep data permanently, whereas ephemeral layers are purged immediately.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Sandbox Diagram Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          {/* Active schematic path */}
          <div className="w-full max-w-md flex items-center justify-between gap-4 relative min-h-[220px]">
            
            {/* Connection line path */}
            {isContainerAlive && selectedType !== "none" && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden sm:block">
                <line
                  x1={selectedType === "bind" ? 70 : 210}
                  y1={160}
                  x2={340}
                  y2={90}
                  stroke="#FAFAFA"
                  strokeWidth="1.5"
                  strokeDasharray="4"
                  className="animate-pulse"
                />
              </svg>
            )}

            {/* Left: Host Machine (Folder node) */}
            <div className="w-[100px] flex flex-col gap-2 text-center shrink-0">
              <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-550">
                1. Host Machine
              </span>
              <div className={cn(
                "p-3 rounded-[12px] border bg-[#0d0d0e] flex flex-col items-center justify-center gap-1.5 transition-all duration-300",
                selectedType === "bind" ? "border-white text-white font-bold" : "border-zinc-850 text-zinc-500"
              )}>
                <Folder className="w-5 h-5 shrink-0" />
                <span className="text-[8px] font-mono truncate max-w-full">/app/src</span>
              </div>
            </div>

            {/* Middle: Docker Engine Volume directory */}
            <div className="w-[100px] flex flex-col gap-2 text-center shrink-0">
              <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-550">
                2. Docker Daemon
              </span>
              <div className={cn(
                "p-3 rounded-[12px] border bg-[#0d0d0e] flex flex-col items-center justify-center gap-1.5 transition-all duration-300",
                selectedType === "named" || selectedType === "anon" ? "border-white text-white font-bold" : "border-zinc-850 text-zinc-550"
              )}>
                <HardDrive className="w-5 h-5 shrink-0" />
                <span className="text-[8px] font-mono truncate max-w-full">
                  {selectedType === "named" ? "pg-data" : selectedType === "anon" ? "anon-uuid" : "docker-storage"}
                </span>
              </div>
            </div>

            {/* Right: Running Container */}
            <div className="w-[110px] flex flex-col gap-2 text-center shrink-0">
              <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-550">
                3. Container
              </span>
              <div className={cn(
                "p-3 rounded-[12px] border bg-[#0d0d0e] flex flex-col items-center justify-center gap-1.5 transition-all duration-500",
                isContainerAlive 
                  ? "border-zinc-750 text-zinc-300 scale-100 opacity-100" 
                  : "border-red-950/20 text-red-500/20 scale-95 opacity-20"
              )}>
                <Box className="w-5 h-5 shrink-0" />
                <span className="text-[8px] font-mono truncate max-w-full">
                  {isContainerAlive ? "db-container" : "destroyed"}
                </span>
              </div>
            </div>

          </div>

          {/* Survival indicator statement */}
          {!isContainerAlive && (
            <div className="mt-4 p-2.5 rounded-[9px] bg-[#0d0d0e] border border-zinc-850 text-[8.5px] font-mono text-zinc-400 animate-fadeIn">
              {selectedType === "none" ? (
                <span className="text-red-400">Data Deleted! Ephemeral container write layer was wiped from disk.</span>
              ) : selectedType === "anon" ? (
                <span className="text-yellow-405">Anonymous volume directory survives but lacks tag reference lookup name.</span>
              ) : (
                <span className="text-green-400">Data Protected! Mounted storage resource survives container removal intact.</span>
              )}
            </div>
          )}

        </div>

        {/* Dynamic Metrics Inspector Panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Mount Spec Calculator
            </span>
            <h4 className="text-sm font-extrabold text-white">{spec.name}</h4>
            <p className="text-xs text-zinc-450 leading-relaxed font-normal mt-2 select-text font-sans">
              {spec.desc}
            </p>
          </div>

          {/* Mount Selector Buttons */}
          <div className="grid grid-cols-2 gap-2 text-[8px] font-mono font-bold select-none">
            {(["named", "bind", "anon", "none"] as StorageType[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setContainerState("running");
                }}
                className={cn(
                  "py-2 px-1.5 rounded-[6px] border text-center transition-colors cursor-pointer",
                  selectedType === type
                    ? "bg-white text-black border-transparent"
                    : "bg-[#0d0d0e] border-zinc-850 text-zinc-450 hover:text-zinc-200"
                )}
              >
                {type === "none" ? "No Storage" : type === "named" ? "Named Volume" : type === "bind" ? "Bind Mount" : "Anon Volume"}
              </button>
            ))}
          </div>

          {/* Metrics properties table */}
          <div className="p-3 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 flex flex-col gap-2 font-sans select-text">
            <div className="flex justify-between items-center text-[9px] font-semibold border-b border-zinc-900 pb-1.5">
              <span className="text-zinc-550">Data Durability:</span>
              <span className="text-zinc-200 font-bold">{spec.persistence}</span>
            </div>
            <div className="flex justify-between items-center text-[9px] font-semibold border-b border-zinc-900 py-1.5">
              <span className="text-zinc-550">Dev Portability:</span>
              <span className="text-zinc-200 font-bold">{spec.portability}</span>
            </div>
            <div className="flex justify-between items-center text-[9px] font-semibold border-b border-zinc-900 py-1.5">
              <span className="text-zinc-550">Write Performance:</span>
              <span className="text-zinc-200 font-bold">{spec.performance}</span>
            </div>
            <div className="flex justify-between items-center text-[9px] font-semibold border-b border-zinc-900 py-1.5">
              <span className="text-zinc-550">Host File Access:</span>
              <span className="text-zinc-200 font-bold">{spec.hostAccess}</span>
            </div>
            <div className="flex flex-col gap-0.5 pt-1.5 text-[8.5px]">
              <span className="text-zinc-550 font-bold">Best Use Case:</span>
              <span className="text-white font-semibold">{spec.bestFor}</span>
            </div>
          </div>

          {/* Writable Container deletion control */}
          <div className="flex gap-2 select-none">
            <button
              onClick={() => setContainerState(isContainerAlive ? "deleted" : "running")}
              className={cn(
                "w-full py-2.5 rounded-[9px] text-xs font-bold transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5",
                isContainerAlive
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white text-black hover:bg-zinc-200"
              )}
            >
              {isContainerAlive ? (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Container
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Recreate Container
                </>
              )}
            </button>
          </div>

          {!isContainerAlive && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Playground
            </button>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
