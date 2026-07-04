"use client";

import React, { useState } from "react";
import { PlusCircle, PlayCircle, PauseCircle, StopCircle, Trash2, ArrowRight, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";
import EdgePrimitive from "@/components/primitives/EdgePrimitive";

interface LifecycleState {
  id: string;
  name: string;
  cmd: string;
  icon: React.ReactNode;
  desc: string;
  kernelAction: string;
}

const LIFECYCLE_STATES: LifecycleState[] = [
  {
    id: "created",
    name: "Created",
    cmd: "docker create --name web nginx",
    icon: <PlusCircle className="w-4 h-4 text-zinc-350" />,
    desc: "The container is initialized. Docker creates the thin writeable layer (UpperDir) and registers namespaces configurations, but does NOT start the process.",
    kernelAction: "UpperDir writable directory allocated. Processes namespace configurations registered but no fork() syscall executed."
  },
  {
    id: "running",
    name: "Running",
    cmd: "docker start web  /  docker run",
    icon: <PlayCircle className="w-4 h-4 text-white" />,
    desc: "The container is active. The engine forks the runtime boundary, registers host namespaces/cgroups boundaries, and executes the primary startup command (PID 1).",
    kernelAction: "Syscalls clone() namespace process boundaries. Namespace CPU/Memory allocations locked via cgroups. PID 1 process executes."
  },
  {
    id: "paused",
    name: "Paused",
    cmd: "docker pause web",
    icon: <PauseCircle className="w-4 h-4 text-zinc-400" />,
    desc: "The container is suspended. The engine utilizes the cgroups freezer subsystem to freeze all active processes in place. The CPU allocations are halted, but RAM states persist.",
    kernelAction: "SIGSTOP signal passed. Freezer cgroups subsystems freeze all container PID states. Memory states remain frozen in RAM."
  },
  {
    id: "stopped",
    name: "Stopped",
    cmd: "docker stop web",
    icon: <StopCircle className="w-4 h-4 text-zinc-500" />,
    desc: "The container is halted. The engine sends a SIGTERM signal, giving the process 10 seconds to gracefully exit before terminating it with a SIGKILL signal.",
    kernelAction: "SIGTERM signal passed to PID 1. If unresponsive after 10s, SIGKILL forcefully kills namespaces. Process tree cleared."
  },
  {
    id: "removed",
    name: "Removed",
    cmd: "docker rm web",
    icon: <Trash2 className="w-4 h-4 text-zinc-650" />,
    desc: "The container is deleted. The engine removes the writable UpperDir directory files and destroys all registered host namespace/cgroups structure configurations.",
    kernelAction: "Local writable UpperDir folder deleted recursively. Subsystem namespaces and cgroups directory configurations destroyed."
  }
];

export default function ContainerLifecycle() {
  const [activeStateId, setActiveStateId] = useState<string>("created");

  const activeState = LIFECYCLE_STATES.find(s => s.id === activeStateId) || LIFECYCLE_STATES[0];

  return (
    <VisualCanvas
      objective="Trace the core stages of the container process lifecycle and understand the CLI commands that trigger state transitions."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            What is a container process lifecycle?
          </div>
          <p>
            Unlike a Virtual Machine (which runs a permanent guest OS), a container is simply an isolated process. When that process exits or is stopped, the container namespaces are suspended. Deleting the container destroys the temporary writeable filesystem layer.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* State Machine Graph Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          {/* Scalable Container to lock coordinates and prevent line drift */}
          <div className="origin-center transition-all duration-305 flex items-center justify-center shrink-0 w-full scale-[0.8] xs:scale-[0.85] sm:scale-100 md:scale-[1.05] lg:scale-[1.15]">
            <div className="w-[500px] h-[220px] relative shrink-0">
              
              {/* Connection vectors in background */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {/* Created -> Running (x1: 164, y1: 42 -> x2: 182, y2: 42) */}
                <EdgePrimitive x1={164} y1={42} x2={182} y2={42} curveType="straight" active={activeStateId === "created" || activeStateId === "running"} />
                {/* Running -> Paused (x1: 326, y1: 42 -> x2: 344, y2: 42) */}
                <EdgePrimitive x1={326} y1={42} x2={344} y2={42} curveType="straight" active={activeStateId === "running" || activeStateId === "paused"} />
                {/* Running -> Stopped (x1: 254, y1: 64 -> x2: 254, y2: 160) */}
                <EdgePrimitive x1={254} y1={64} x2={254} y2={160} curveType="straight" active={activeStateId === "running" || activeStateId === "stopped"} />
                {/* Stopped -> Removed (x1: 182, y1: 182 -> x2: 164, y2: 182) */}
                <EdgePrimitive x1={182} y1={182} x2={164} y2={182} curveType="straight" active={activeStateId === "stopped" || activeStateId === "removed"} />
              </svg>

              {/* Absolute positioned state Nodes */}
              
              {/* 1. Created */}
              <div 
                onClick={() => setActiveStateId("created")}
                className="absolute left-[20px] top-[20px] w-36 cursor-pointer hover:scale-[1.01] transition-transform z-10"
              >
                <NodePrimitive
                  label="Created"
                  status={activeStateId === "created" ? "running" : "idle"}
                  icon={<PlusCircle className="w-4 h-4 text-zinc-300" />}
                  className="py-2 px-3 rounded-[9px]"
                />
              </div>

              {/* 2. Running */}
              <div 
                onClick={() => setActiveStateId("running")}
                className="absolute left-[182px] top-[20px] w-36 cursor-pointer hover:scale-[1.01] transition-transform z-10"
              >
                <NodePrimitive
                  label="Running"
                  status={activeStateId === "running" ? "running" : "idle"}
                  icon={<PlayCircle className="w-4 h-4 text-white" />}
                  className="py-2 px-3 rounded-[9px]"
                />
              </div>

              {/* 3. Paused */}
              <div 
                onClick={() => setActiveStateId("paused")}
                className="absolute left-[344px] top-[20px] w-36 cursor-pointer hover:scale-[1.01] transition-transform z-10"
              >
                <NodePrimitive
                  label="Paused"
                  status={activeStateId === "paused" ? "running" : "idle"}
                  icon={<PauseCircle className="w-4 h-4 text-zinc-400" />}
                  className="py-2 px-3 rounded-[9px]"
                />
              </div>

              {/* 4. Stopped */}
              <div 
                onClick={() => setActiveStateId("stopped")}
                className="absolute left-[182px] top-[160px] w-36 cursor-pointer hover:scale-[1.01] transition-transform z-10"
              >
                <NodePrimitive
                  label="Stopped"
                  status={activeStateId === "stopped" ? "running" : "idle"}
                  icon={<StopCircle className="w-4 h-4 text-zinc-500" />}
                  className="py-2 px-3 rounded-[9px]"
                />
              </div>

              {/* 5. Removed */}
              <div 
                onClick={() => setActiveStateId("removed")}
                className="absolute left-[20px] top-[160px] w-36 cursor-pointer hover:scale-[1.01] transition-transform z-10"
              >
                <NodePrimitive
                  label="Removed"
                  status={activeStateId === "removed" ? "running" : "idle"}
                  icon={<Trash2 className="w-4 h-4 text-zinc-650" />}
                  className="py-2 px-3 rounded-[9px]"
                 />
              </div>

            </div>
          </div>

          {/* Living Container Simulator */}
          <div className="mt-8 border-t border-zinc-800/40 pt-6 w-full flex flex-col items-center justify-center gap-2 select-text font-sans">
            <style>{`
              @keyframes barGrow {
                0%, 100% { transform: scaleY(0.3); }
                50% { transform: scaleY(1); }
              }
              .animate-bar-grow {
                animation: barGrow 1.2s ease-in-out infinite;
                transform-origin: bottom;
              }
            `}</style>
            
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-550 mb-1">
              Active Container Runtime Simulation
            </span>

            {activeStateId === "removed" ? (
              <div className="h-28 w-64 border border-dashed border-red-500/20 bg-red-950/5 rounded-[12px] flex flex-col items-center justify-center text-center gap-2 animate-pulse">
                <Trash2 className="w-6 h-6 text-red-500/60" />
                <div>
                  <span className="text-[10px] font-bold text-red-400 block uppercase tracking-wider font-mono">[DESTROYED]</span>
                  <span className="text-[8.5px] text-zinc-500 block mt-0.5 max-w-[200px]">Writable layer and namespace parameters fully removed.</span>
                </div>
              </div>
            ) : (
              <div className={cn(
                "h-28 w-64 rounded-[14px] bg-[#0d0d0e] border p-4 flex flex-col justify-between transition-all duration-300 relative shadow-inner",
                activeStateId === "created" && "border-zinc-800 opacity-60",
                activeStateId === "running" && "border-zinc-500 shadow-[0_0_8px_rgba(255,255,255,0.05)]",
                activeStateId === "paused" && "border-yellow-900/40 opacity-75 animate-pulse",
                activeStateId === "stopped" && "border-zinc-900 opacity-40"
              )}>
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-zinc-850/40 pb-1.5">
                  <span className="text-[9px] font-bold text-white font-mono flex items-center gap-1.5">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      activeStateId === "created" && "bg-zinc-650",
                      activeStateId === "running" && "bg-white animate-pulse",
                      activeStateId === "paused" && "bg-yellow-500 animate-ping",
                      activeStateId === "stopped" && "bg-zinc-800"
                    )} />
                    nginx-container
                  </span>
                  <span className={cn(
                    "text-[7px] font-mono font-bold uppercase py-0.5 px-1.5 rounded-[4px] border",
                    activeStateId === "created" && "border-zinc-800 text-zinc-550 bg-zinc-900/10",
                    activeStateId === "running" && "border-white/10 bg-white/5 text-white",
                    activeStateId === "paused" && "border-yellow-500/20 bg-yellow-950/20 text-yellow-405",
                    activeStateId === "stopped" && "border-zinc-900 text-zinc-700 bg-zinc-950/10"
                  )}>
                    {activeStateId === "created" && "Dormant"}
                    {activeStateId === "running" && "Running"}
                    {activeStateId === "paused" && "Paused"}
                    {activeStateId === "stopped" && "Stopped"}
                  </span>
                </div>

                {/* Heartbeat / CPU Wave representation */}
                <div className="flex items-end gap-1.5 flex-1 justify-center my-1.5 h-8">
                  {activeStateId === "running" ? (
                    [3, 5, 8, 4, 9, 6, 2, 7, 5, 3].map((h, i) => (
                      <div 
                        key={i} 
                        className="w-[3px] bg-white rounded-t-full animate-bar-grow"
                        style={{ 
                          height: "100%",
                          animationDelay: `${i * 0.08}s` 
                        }} 
                      />
                    ))
                  ) : activeStateId === "paused" ? (
                    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4].map((h, i) => (
                      <div 
                        key={i} 
                        className="w-[3px] bg-yellow-500/60 rounded-t-full" 
                        style={{ height: "40%" }}
                      />
                    ))
                  ) : (
                    <div className="w-full h-px bg-zinc-900/80 relative self-center">
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[6.5px] uppercase tracking-widest font-mono text-zinc-700 select-none">No Process Active</span>
                    </div>
                  )}
                </div>

                {/* Subtitle */}
                <div className="text-[7.5px] font-mono text-zinc-550 flex justify-between select-none">
                  <span>PID 1: nginx -g daemon off;</span>
                  <span>CPU: {activeStateId === "running" ? "1.2%" : "0.0%"}</span>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* State Detail Inspector (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              State Detail Inspector
            </span>
            <h4 className="text-base font-extrabold text-white flex items-center gap-1.5 font-sans">
              {activeState.icon}
              {activeState.name}
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-3 select-text font-sans">
              {activeState.desc}
            </p>
          </div>

          {/* Trigger Command block */}
          <div className="p-3 bg-[#0d0d0e] rounded-[9px] border border-zinc-850 font-mono text-[9px] text-zinc-450 select-text">
            <div className="text-zinc-200 font-bold flex items-center gap-1.5 mb-1 select-none font-sans">
              <ArrowRight className="w-3 h-3 text-zinc-450" />
              CLI Command:
            </div>
            <code className="text-white font-semibold">{activeState.cmd}</code>
          </div>

          {/* Linux kernel level detail */}
          <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/25 text-[9px] text-zinc-450 leading-relaxed flex-1 select-text font-sans">
            <span className="font-bold block mb-0.5 text-zinc-200">OS Kernel Transaction:</span>
            {activeState.kernelAction}
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
