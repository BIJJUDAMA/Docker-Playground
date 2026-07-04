"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle, RefreshCw, Trash2, Box, Layers, HardDrive, Folder, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";

type ObjectType = "image" | "container" | "volume" | "host";

interface ObjectState {
  alive: boolean;
  status: "idle" | "running" | "crashed";
}

export default function DeleteSimulator() {
  const [states, setStates] = useState<Record<ObjectType, ObjectState>>({
    image: { alive: true, status: "idle" },
    container: { alive: true, status: "running" },
    volume: { alive: true, status: "idle" },
    host: { alive: true, status: "idle" }
  });

  const [activeDeletion, setActiveDeletion] = useState<ObjectType | null>(null);
  const [terminalLog, setTerminalLog] = useState("Click delete buttons to trigger chain reactions.");

  const handleReset = () => {
    setStates({
      image: { alive: true, status: "idle" },
      container: { alive: true, status: "running" },
      volume: { alive: true, status: "idle" },
      host: { alive: true, status: "idle" }
    });
    setActiveDeletion(null);
    setTerminalLog("Click delete buttons to trigger chain reactions.");
  };

  const handleDelete = (type: ObjectType) => {
    // Reset to base pristine states first
    const baseStates: Record<ObjectType, ObjectState> = {
      image: { alive: true, status: "idle" },
      container: { alive: true, status: "running" },
      volume: { alive: true, status: "idle" },
      host: { alive: true, status: "idle" }
    };

    setActiveDeletion(type);
    
    const next = { ...baseStates };
    
    switch (type) {
      case "container":
        next.container = { alive: false, status: "idle" };
        setTerminalLog("host$ docker rm -f app-container\n[CONSEQUENCE] Container destroyed. Local writable layers purged. Image, volume, and host folder remain completely safe.");
        break;
        
      case "volume":
        next.volume = { alive: false, status: "idle" };
        next.container.status = "crashed";
        setTerminalLog("host$ docker volume rm db_data\n[CONSEQUENCE] Volume storage purged from host disk. The running container immediately loses connection, throwing database connection crash errors!");
        break;
        
      case "image":
        next.image = { alive: false, status: "idle" };
        setTerminalLog("host$ docker rmi node:22\n[CONSEQUENCE] Base image removed from storage. Running containers are unaffected (cached in memory), but you cannot start new replicas of this image later.");
        break;
        
      case "host":
        next.host = { alive: false, status: "idle" };
        next.container.status = "crashed";
        setTerminalLog("host$ rm -rf /src\n[CONSEQUENCE] Host folder deleted. The bind-mounted container instantly loses source files and crashes due to missing entrypoint execution paths!");
        break;
    }
    
    setStates(next);
  };

  return (
    <VisualCanvas
      objective="Understand resource lifetimes: simulate object deletions to map dependencies and chain reactions."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Delete Simulator
          </div>
          <p>
            Storage lifecycles depend on relationships. Deleting containers automatically sweeps their local writable layers, but leaves Volumes and Host Folders intact.
          </p>
          <p>
            Conversely, deleting external host directories or volumes invalidates mount dependencies, causing running container engines to crash.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Schematic diagram of nodes (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          <div className="w-full max-w-sm grid grid-cols-2 gap-4 relative z-10 py-2">
            
            {/* Image Node */}
            <div className="transition-all duration-300">
              <NodePrimitive
                label="Base Image (node:22)"
                status={states.image.alive ? "idle" : "crashed"}
                icon={<Layers className="w-3.5 h-3.5 text-zinc-400" />}
                subtitle={states.image.alive ? "cached on disk" : "removed from disk"}
                className="py-2.5 rounded-[9px]"
              />
            </div>

            {/* Container Node */}
            <div className="transition-all duration-300">
              <NodePrimitive
                label="Container (app)"
                status={states.container.status}
                icon={<Box className="w-3.5 h-3.5 text-zinc-300" />}
                subtitle={!states.container.alive ? "wiped" : states.container.status === "crashed" ? "crashed" : "running"}
                className="py-2.5 rounded-[9px]"
              />
            </div>

            {/* Volume Node */}
            <div className="transition-all duration-300">
              <NodePrimitive
                label="Volume (db_data)"
                status={states.volume.alive ? "idle" : "crashed"}
                icon={<HardDrive className="w-3.5 h-3.5 text-zinc-450" />}
                subtitle={states.volume.alive ? "secured data" : "data deleted"}
                className="py-2.5 rounded-[9px]"
              />
            </div>

            {/* Host Folder Node */}
            <div className="transition-all duration-300">
              <NodePrimitive
                label="Host Folder (/src)"
                status={states.host.alive ? "idle" : "crashed"}
                icon={<Folder className="w-3.5 h-3.5 text-zinc-500" />}
                subtitle={states.host.alive ? "workspace safe" : "workspace empty"}
                className="py-2.5 rounded-[9px]"
              />
            </div>

          </div>

        </div>

        {/* Selected actions and details panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Deletion Console
            </span>
            <h4 className="text-sm font-extrabold text-white">Trigger removals</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text font-sans">
              Delete elements and trace dependencies cascade chain reactions.
            </p>
          </div>

          {/* Delete triggers buttons grid */}
          <div className="flex flex-col gap-2 flex-1 justify-center select-none font-sans">
            <button
              onClick={() => handleDelete("container")}
              className={cn(
                "w-full py-2 rounded-[8px] text-[9.5px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none",
                activeDeletion === "container"
                  ? "bg-white text-black border-transparent shadow-sm"
                  : "bg-[#1a1a1e] border-zinc-850 text-zinc-350 hover:border-zinc-700 hover:text-white"
              )}
            >
              Delete Container
            </button>
            <button
              onClick={() => handleDelete("volume")}
              className={cn(
                "w-full py-2 rounded-[8px] text-[9.5px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none",
                activeDeletion === "volume"
                  ? "bg-white text-black border-transparent shadow-sm"
                  : "bg-[#1a1a1e] border-zinc-850 text-zinc-350 hover:border-zinc-700 hover:text-white"
              )}
            >
              Delete Volume
            </button>
            <button
              onClick={() => handleDelete("image")}
              className={cn(
                "w-full py-2 rounded-[8px] text-[9.5px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none",
                activeDeletion === "image"
                  ? "bg-white text-black border-transparent shadow-sm"
                  : "bg-[#1a1a1e] border-zinc-850 text-zinc-350 hover:border-zinc-700 hover:text-white"
              )}
            >
              Delete Image
            </button>
            <button
              onClick={() => handleDelete("host")}
              className={cn(
                "w-full py-2 rounded-[8px] text-[9.5px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none",
                activeDeletion === "host"
                  ? "bg-white text-black border-transparent shadow-sm"
                  : "bg-[#1a1a1e] border-zinc-850 text-zinc-350 hover:border-zinc-700 hover:text-white"
              )}
            >
              Delete Host Folder
            </button>
          </div>

          {/* Diagnostic logs trace */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col min-h-[90px] overflow-hidden select-text font-sans">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0">
              <span className="text-[7.5px] font-mono text-zinc-550 font-bold">Trace output:</span>
            </div>
            <div className="p-3 font-mono text-[9px] leading-relaxed flex-1 overflow-y-auto flex flex-col gap-0.5">
              {terminalLog.split("\n").map((line, i) => {
                let className = "text-zinc-400";
                if (line.includes("[SUCCESS]") || line.toLowerCase().includes("success") || line.includes("✓")) {
                  className = "text-green-400 font-semibold";
                } else if (line.includes("[FAILURE]") || line.includes("[WARNING]") || line.toLowerCase().includes("error") || line.toLowerCase().includes("fatal") || line.toLowerCase().includes("failed") || line.includes("⚠")) {
                  className = "text-red-400 font-semibold";
                } else if (line.includes("$") || line.includes("docker")) {
                  className = "text-zinc-555 font-mono";
                }
                return (
                  <div key={i} className={className}>
                    {line}
                  </div>
                );
              })}
            </div>
          </div>

          {activeDeletion !== null && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none font-sans"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Simulator
            </button>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
