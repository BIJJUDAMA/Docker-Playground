"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Layers, Box, Play, Trash2, Edit3, HelpCircle, ArrowRight, ShieldCheck, CheckCircle } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";

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

  const handleReset = () => {
    setInstances([
      { id: "A", name: "container-A", status: "running" as const },
      { id: "B", name: "container-B", status: "running" as const }
    ]);
  };

  return (
    <VisualCanvas
      objective="Compare the structural differences between an immutable Image Blueprint and temporary, running Container Instances."
      timeline={null}
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
        
        {/* Graph Sandbox (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          {/* Split comparison cards */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-6">
            {/* Image blueprint card */}
            <div className="p-3 bg-[#0d0d0e]/60 rounded-[12px] border border-zinc-850 flex flex-col gap-1.5 shadow-inner">
              <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                Passive Blueprint
              </span>
              <span className="text-[10px] font-extrabold text-white flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                Docker Image
              </span>
              <ul className="text-[8.5px] text-zinc-450 flex flex-col gap-0.5 mt-1 list-none font-semibold">
                <li>• 100% Read-Only</li>
                <li>• Reusable Template</li>
                <li>• Immutable & Static</li>
                <li>• Shares Base Layers</li>
              </ul>
            </div>

            {/* Container instance card */}
            <div className="p-3 bg-[#0d0d0e]/60 rounded-[12px] border border-zinc-850 flex flex-col gap-1.5 shadow-inner">
              <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-550">
                Running Instance
              </span>
              <span className="text-[10px] font-extrabold text-white flex items-center gap-1 font-sans">
                <Box className="w-3.5 h-3.5 text-white animate-pulse" />
                Active Container
              </span>
              <ul className="text-[8.5px] text-zinc-450 flex flex-col gap-0.5 mt-1 list-none font-semibold">
                <li>• Writable верхDir</li>
                <li>• Isolated process tree</li>
                <li>• Temporary runtime</li>
                <li>• Unique network ports</li>
              </ul>
            </div>
          </div>

          {/* Interactive Relationship Graph */}
          <div className="w-full max-w-sm flex items-center justify-between gap-6 relative min-h-[120px]">
            
            {/* Background connection links */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden sm:block">
              {instances.map((c, i) => {
                const yTarget = (instances.length === 1) ? 60 : (instances.length === 2) ? (i === 0 ? 36 : 84) : (i === 0 ? 12 : i === 1 ? 60 : 108);
                return (
                  <line
                    key={c.id}
                    x1={80}
                    y1={60}
                    x2={240}
                    y2={yTarget}
                    stroke={c.status === "modified" ? "#FAFAFA" : "#1f1f23"}
                    strokeWidth={c.status === "modified" ? 1.5 : 1}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>

            {/* Image Node */}
            <div className="w-32 z-10 shrink-0">
              <NodePrimitive
                label="app-image"
                status="idle"
                icon={<Layers className="w-3.5 h-3.5 text-zinc-300" />}
                className="py-2.5 rounded-[9px] bg-[#0d0d0e] border-zinc-850"
              />
            </div>

            {/* Containers Stack Node */}
            <div className="w-40 flex flex-col gap-2 min-h-[110px] justify-center shrink-0 z-10">
              {instances.length > 0 ? (
                instances.map((c, i) => {
                  const isModified = c.status === "modified";
                  return (
                    <div key={c.id} className="animate-fadeIn">
                      <NodePrimitive
                        label={c.name}
                        status={isModified ? "running" : "idle"}
                        icon={<Box className="w-3.5 h-3.5 text-white" />}
                        subtitle={isModified ? "Modified layer active" : "Pristine replica"}
                        className={cn(
                          "py-1 px-2.5 rounded-[8px] transition-all duration-300",
                          isModified 
                            ? "bg-white text-black border-transparent shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                            : "bg-[#0d0d0e]/60 border-zinc-850"
                        )}
                      />
                    </div>
                  );
                })
              ) : (
                <span className="text-[9px] text-zinc-650 italic text-center font-mono">No instances running</span>
              )}
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
          <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/25 text-[9px] text-zinc-450 leading-relaxed font-sans">
            <CheckCircle className="w-3.5 h-3.5 text-zinc-450 mb-1" />
            Deleting container nodes instantly updates the process tree list. Image blueprint layers remain completely unaffected.
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
          >
            Reset Sandbox
          </button>

        </div>

      </div>
    </VisualCanvas>
  );
}
