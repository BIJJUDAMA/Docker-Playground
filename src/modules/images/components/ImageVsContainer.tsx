"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Layers, Box, Play, Trash2, Edit3, HelpCircle, ShieldCheck, CheckCircle, RotateCcw } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

interface InstanceItem {
  id: string;
  name: string;
  status: "running" | "modified";
}

export default function ImageVsContainer() {
  const [instances, setInstances] = useState<InstanceItem[]>([
    { id: "A", name: "container-A", status: "running" },
    { id: "B", name: "container-B", status: "running" }
  ]);

  const handleRunAnother = () => {
    if (instances.length >= 3) return;
    
    // Find missing letter (A, B, or C)
    const activeIds = instances.map(i => i.id);
    let nextId = "C";
    if (!activeIds.includes("A")) nextId = "A";
    else if (!activeIds.includes("B")) nextId = "B";

    setInstances(prev => [...prev, { id: nextId, name: `container-${nextId}`, status: "running" as const }].sort((a,b) => a.id.localeCompare(b.id)));
  };

  const handleModifyInstance = (id: string) => {
    setInstances(prev => prev.map(inst => 
      inst.id === id ? { ...inst, status: "modified" as const } : inst
    ));
  };

  const handleDeleteInstance = (id: string) => {
    setInstances(prev => prev.filter(inst => inst.id !== id));
  };

  const handleReset = useCallback(() => {
    setInstances([
      { id: "A", name: "container-A", status: "running" as const },
      { id: "B", name: "container-B", status: "running" as const }
    ]);
  }, []);

  return (
    <VisualCanvas
      objective="Compare the structural differences between an immutable Image Blueprint and temporary, running Container Instances."
      timeline={null}
      onStepBack={handleReset}
      zoomScale={0.88}
      fullscreenZoomScale={1.2}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Image vs Container
          </div>
          <p>
            An **Image** is a static, read-only package that contains your application code, system libraries, and runtimes. It is reusable and never changes.
          </p>
          <p>
            A **Container** is a running instance of that image. It adds a thin writable layer, runs isolated OS processes, and maintains private runtime configurations.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Sandbox Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[380px] overflow-hidden">
          
          <div className="w-full max-w-lg flex flex-col sm:flex-row items-stretch justify-between gap-8 relative min-h-[300px]">
            
            {/* Left: Stacked Image blueprint */}
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-zinc-550">
                Shared Image Blueprint
              </span>
              
              {/* Stacked tower of image layers */}
              <div className="flex flex-col gap-1 w-full max-w-[150px] relative">
                {/* Layer 3 */}
                <div className="h-[36px] bg-[#1a1a20] border border-zinc-800 rounded-[8px] flex items-center justify-center px-3 relative shadow-sm">
                  <span className="text-[8.5px] font-mono text-zinc-300 font-bold">App Code (Layer 3)</span>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[6px] uppercase tracking-wider text-zinc-550 font-sans font-bold">R/O</span>
                </div>
                {/* Layer 2 */}
                <div className="h-[36px] bg-[#16161c] border border-zinc-850 rounded-[8px] flex items-center justify-center px-3 relative shadow-sm">
                  <span className="text-[8.5px] font-mono text-zinc-400">Node Modules (Layer 2)</span>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[6px] uppercase tracking-wider text-zinc-550 font-sans font-bold">R/O</span>
                </div>
                {/* Layer 1 */}
                <div className="h-[36px] bg-[#111116] border border-zinc-900 rounded-[8px] flex items-center justify-center px-3 relative shadow-sm">
                  <span className="text-[8.5px] font-mono text-zinc-550">Base Linux OS (Layer 1)</span>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[6px] uppercase tracking-wider text-zinc-650 font-sans font-bold">R/O</span>
                </div>
                
                {/* Shared blueprint label */}
                <div className="mt-2 text-center select-none">
                  <span className="text-[9px] font-bold text-white font-mono flex items-center justify-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-zinc-400" />
                    node-app:latest
                  </span>
                </div>
              </div>
            </div>

            {/* Middle connecting vector lines overlay */}
            <div className="hidden sm:block absolute left-[150px] right-[160px] top-0 bottom-0 pointer-events-none z-0">
              <svg className="w-full h-full">
                {instances.map((c, i) => {
                  const yTarget = (instances.length === 1) ? 116 : (instances.length === 2) ? (i === 0 ? 56 : 176) : (i === 0 ? 30 : i === 1 ? 116 : 202);
                  return (
                    <g key={c.id}>
                      {/* Connection from top layer (App Code) */}
                      <path 
                        d={`M 10,98 C 50,98 50,${yTarget + 20} 90,${yTarget + 20}`} 
                        fill="none" 
                        stroke={c.status === "modified" ? "#ffffff" : "#1f1f23"} 
                        strokeWidth={c.status === "modified" ? 1.5 : 1}
                        strokeDasharray={c.status === "modified" ? "0" : "3"}
                        className="transition-all duration-300"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Right: Container process replica stack */}
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-zinc-550">
                Running Container Instances
              </span>
              
              <div className="flex flex-col gap-3 w-full max-w-[160px] justify-center min-h-[220px]">
                {instances.length > 0 ? (
                  instances.map((c) => {
                    const isModified = c.status === "modified";
                    return (
                      <div 
                        key={c.id} 
                        className={cn(
                          "rounded-[12px] border p-2.5 flex flex-col gap-1.5 transition-all duration-300 shadow-inner",
                          isModified 
                            ? "border-zinc-500 bg-[#0d0d0e]" 
                            : "border-zinc-850 bg-[#0d0d0e]/60"
                        )}
                      >
                        {/* Container name */}
                        <div className="flex justify-between items-center border-b border-zinc-900/60 pb-1">
                          <span className="text-[8.5px] font-bold text-white font-mono flex items-center gap-1">
                            <Box className="w-3.5 h-3.5 text-zinc-400" />
                            {c.name}
                          </span>
                          <span className={cn(
                            "text-[6.5px] font-bold uppercase tracking-wide",
                            isModified ? "text-zinc-300 animate-pulse" : "text-zinc-650"
                          )}>
                            {isModified ? "Modified" : "Active"}
                          </span>
                        </div>
                        
                        {/* Visual stack representation */}
                        <div className="flex flex-col gap-0.5">
                          {/* Writable layer */}
                          <div className={cn(
                            "h-[12px] rounded-[3px] border flex items-center justify-center text-[6px] font-mono font-bold transition-all duration-300",
                            isModified 
                              ? "bg-white text-black border-transparent" 
                              : "bg-[#0d0d0e]/80 border-dashed border-zinc-800 text-zinc-550"
                          )}>
                            {isModified ? "Writable layer: config.json (Overridden)" : "Writable layer (Empty)"}
                          </div>
                          {/* Immutable reference layer block */}
                          <div className="h-[12px] rounded-[3px] bg-[#1a1a20]/30 border border-zinc-900/50 flex items-center justify-center text-[6px] font-mono text-zinc-600">
                            Shared Read-Only layers
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="border border-dashed border-zinc-850 rounded-[12px] p-5 text-center text-[9px] text-zinc-650 italic bg-[#0d0d0e]/15 flex flex-col items-center justify-center gap-1.5">
                    <Box className="w-5 h-5 text-zinc-750" />
                    <span>No instances running</span>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Selected actions and details panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Actions Sidebar
            </span>
            <h4 className="text-sm font-extrabold text-white">Compare lifecycles</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text font-sans">
              Interact with the instances stack to trace how writes scale independently.
            </p>
          </div>

          {/* List of active instances and controls */}
          <div className="flex flex-col gap-2 flex-1 justify-center">
            
            <button
              onClick={handleRunAnother}
              disabled={instances.length >= 3}
              className="w-full py-2 rounded-[9px] text-[10px] font-bold bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-all border-0 cursor-pointer flex items-center justify-center gap-1 select-none"
            >
              <Play className="w-3 h-3 fill-black text-black" />
              docker run (Spawn Instance)
            </button>

            {/* Grid control rows per container */}
            <div className="flex flex-col gap-1.5 mt-2">
              {instances.map((c) => (
                <div 
                  key={c.id}
                  className="p-2 rounded-[8px] border border-zinc-850 bg-[#0d0d0e] flex items-center justify-between font-mono text-[9px]"
                >
                  <span className="font-bold text-zinc-350">{c.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleModifyInstance(c.id)}
                      disabled={c.status === "modified"}
                      className="p-1 rounded bg-[#1a1a1e] border border-zinc-800 hover:border-zinc-600 text-zinc-300 disabled:opacity-40 cursor-pointer"
                      title="Simulate modifying config files inside instance"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteInstance(c.id)}
                      className="p-1 rounded bg-[#1a1a1e] border border-zinc-800 hover:border-red-900 text-zinc-300 cursor-pointer"
                      title="Destroy container instance process bounds"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Verify statement */}
          <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/25 text-[9px] text-zinc-455 leading-relaxed font-sans">
            <CheckCircle className="w-3.5 h-3.5 text-zinc-450 mb-1" />
            Deleting container nodes instantly updates the process tree list. Image blueprint layers remain completely unaffected.
          </div>

          {instances.length > 0 && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
            >
              Reset Sandbox
            </button>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
