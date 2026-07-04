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
    kernelAction: "SIGSTOP signal passed. Freezer cgroups subsystems freeze all container PID states. Memory states remain cached."
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
    icon: <Trash2 className="w-4 h-4 text-zinc-600" />,
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
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px]">
          
          {/* Connection vectors in background */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Created -> Running */}
            <EdgePrimitive x1={150} y1={80} x2={270} y2={80} curveType="straight" active={activeStateId === "created" || activeStateId === "running"} />
            {/* Running -> Paused */}
            <EdgePrimitive x1={360} y1={80} x2={480} y2={80} curveType="straight" active={activeStateId === "running" || activeStateId === "paused"} />
            {/* Running -> Stopped */}
            <EdgePrimitive x1={315} y1={120} x2={315} y2={220} curveType="straight" active={activeStateId === "running" || activeStateId === "stopped"} />
            {/* Stopped -> Removed */}
            <EdgePrimitive x1={270} y1={260} x2={150} y2={260} curveType="straight" active={activeStateId === "stopped" || activeStateId === "removed"} />
          </svg>

          <div className="w-full max-w-xl h-72 relative z-10 flex flex-col justify-between py-2">
            {/* Top Row: Created, Running, Paused */}
            <div className="flex justify-between items-center w-full">
              <div 
                onClick={() => setActiveStateId("created")}
                className="w-36 cursor-pointer hover:scale-[1.01] transition-transform"
              >
                <NodePrimitive
                  label="Created"
                  status={activeStateId === "created" ? "running" : "idle"}
                  icon={<PlusCircle className="w-4 h-4 text-zinc-300" />}
                  className="py-2.5 px-3 rounded-[12px]"
                />
              </div>

              <div 
                onClick={() => setActiveStateId("running")}
                className="w-36 cursor-pointer hover:scale-[1.01] transition-transform"
              >
                <NodePrimitive
                  label="Running"
                  status={activeStateId === "running" ? "running" : "idle"}
                  icon={<PlayCircle className="w-4 h-4 text-white" />}
                  className="py-2.5 px-3 rounded-[12px]"
                />
              </div>

              <div 
                onClick={() => setActiveStateId("paused")}
                className="w-36 cursor-pointer hover:scale-[1.01] transition-transform"
              >
                <NodePrimitive
                  label="Paused"
                  status={activeStateId === "paused" ? "running" : "idle"}
                  icon={<PauseCircle className="w-4 h-4 text-zinc-400" />}
                  className="py-2.5 px-3 rounded-[12px]"
                />
              </div>
            </div>

            {/* Bottom Row: Removed, Stopped */}
            <div className="flex justify-start gap-[106px] items-center w-full">
              <div 
                onClick={() => setActiveStateId("removed")}
                className="w-36 cursor-pointer hover:scale-[1.01] transition-transform"
              >
                <NodePrimitive
                  label="Removed"
                  status={activeStateId === "removed" ? "running" : "idle"}
                  icon={<Trash2 className="w-4 h-4 text-zinc-650" />}
                  className="py-2.5 px-3 rounded-[12px]"
                />
              </div>

              <div 
                onClick={() => setActiveStateId("stopped")}
                className="w-36 cursor-pointer hover:scale-[1.01] transition-transform"
              >
                <NodePrimitive
                  label="Stopped"
                  status={activeStateId === "stopped" ? "running" : "idle"}
                  icon={<StopCircle className="w-4 h-4 text-zinc-500" />}
                  className="py-2.5 px-3 rounded-[12px]"
                />
              </div>
            </div>
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
          <div className="p-3 bg-[#0d0d0e] rounded-[9px] border border-zinc-850 font-mono text-[9px] text-zinc-400 select-text">
            <div className="text-zinc-200 font-bold flex items-center gap-1.5 mb-1 select-none">
              <ArrowRight className="w-3 h-3 text-zinc-450" />
              CLI Command:
            </div>
            <code className="text-white font-semibold">{activeState.cmd}</code>
          </div>

          {/* Linux kernel level detail */}
          <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/20 text-[9.5px] text-zinc-450 leading-relaxed flex-1 select-text font-sans">
            <span className="font-bold block mb-0.5 text-zinc-200">OS Kernel Transaction:</span>
            {activeState.kernelAction}
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
