"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { HelpCircle, ArrowRight } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";
import { PacketPrimitive } from "@/components/primitives/PacketPrimitive";

interface TimelineStep {
  title: string;
  desc: string;
  source: "client" | "daemon" | "socket";
}

const COMMAND_STEPS: Record<string, { cmd: string; steps: TimelineStep[] }> = {
  run: {
    cmd: "docker run -d -p 8080:80 nginx",
    steps: [
      { title: "Command Parsing", desc: "Docker CLI parses flags (-d detached, -p port mapping, nginx image reference).", source: "client" },
      { title: "Socket Call", desc: "Client sends HTTP POST /containers/create payload over Unix Socket (/var/run/docker.sock).", source: "socket" },
      { title: "Layer Verification", desc: "Daemon checks local storage. Pulls nginx image layers if not found.", source: "daemon" },
      { title: "Namespace Isolation", desc: "Daemon makes syscalls to allocate isolated Network namespaces and cgroup bounds.", source: "daemon" },
      { title: "Process Start", desc: "Daemon mounts read-write layer, spins Nginx process, and replies with container ID.", source: "daemon" },
      { title: "Stdout Response", desc: "Client prints Container ID string to terminal and exits.", source: "client" }
    ]
  },
  ps: {
    cmd: "docker ps",
    steps: [
      { title: "Command Parsing", desc: "Docker CLI parses command (defaults to list only running containers).", source: "client" },
      { title: "Socket Call", desc: "Client sends HTTP GET /containers/json over docker.sock.", source: "socket" },
      { title: "Active Scan", desc: "Daemon polls active runtime container list metadata structures.", source: "daemon" },
      { title: "Table Formatting", desc: "Daemon responds with JSON array. Client formats columns (ID, IMAGE, PORTS, STATUS).", source: "client" }
    ]
  },
  exec: {
    cmd: "docker exec -it container_id sh",
    steps: [
      { title: "Command Parsing", desc: "Client parses flags (-i interactive, -t allocate tty terminal, 'sh' shell execution).", source: "client" },
      { title: "Socket Call", desc: "Client sends HTTP POST /containers/container_id/exec with bash command payload.", source: "socket" },
      { title: "Namespace Entry", desc: "Daemon uses setns() syscall to enter container's target process namespace namespace.", source: "daemon" },
      { title: "Process Fork", desc: "Daemon forks and spawns 'sh' shell inside the container namespace process tree.", source: "daemon" },
      { title: "Terminal I/O Stream", desc: "Daemon establishes bidirection raw TCP streams linking container stdin/stdout to Client keyboard.", source: "socket" }
    ]
  }
};

export default function CommandFlow() {
  const [selectedCmdKey, setSelectedCmdKey] = useState<string>("run");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isPlayingSeq, setIsPlayingSeq] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string>("Select a command to trace the socket step sequence...");
  const [packetLabel, setPacketLabel] = useState<string>("POST");
  const [containerActive, setContainerActive] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const clientCardRef = useRef<HTMLDivElement>(null);
  const daemonCardRef = useRef<HTMLDivElement>(null);
  const socketPulseRef = useRef<HTMLDivElement>(null);
  
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  const handleReset = useCallback(() => {
    setIsPlayingSeq(false);
    setCurrentStepIndex(-1);
    setTerminalOutput("Select a command to trace the socket step sequence...");
    setContainerActive(false);
    setPacketLabel("POST");
    
    if (timeline) {
      timeline.pause().progress(0);
    }

    gsap.set(socketPulseRef.current, { scale: 0, opacity: 0, x: 0 });
  }, [timeline]);

  const activeCmdData = COMMAND_STEPS[selectedCmdKey];

  useEffect(() => {
    handleReset();

    const tl = gsap.timeline({
      paused: true,
      onStart: () => {
        setIsPlayingSeq(true);
        setCurrentStepIndex(0);
        setTerminalOutput(`Executing: ${activeCmdData.cmd}\nConnecting to daemon socket...`);
      }
    });

    setTimeline(tl);

    gsap.set(socketPulseRef.current, { scale: 0, opacity: 0, x: 0, y: 0 });

    activeCmdData.steps.forEach((step, index) => {
      const stepDuration = 2.4;

      tl.to({}, {
        duration: 0.25,
        onStart: () => {
          setCurrentStepIndex(index);
          setTerminalOutput(`[Step ${index + 1}/${activeCmdData.steps.length}] ${step.title}\n${step.desc}`);
          if (selectedCmdKey === "run" && index === 4) {
            setContainerActive(true);
          }
        }
      });

      if (step.source === "socket") {
        tl.to(socketPulseRef.current, {
          scale: 1,
          opacity: 1,
          duration: 0.25,
          onStart: () => {
            setPacketLabel(selectedCmdKey === "run" ? "POST /create" : selectedCmdKey === "ps" ? "GET /containers" : "POST /exec");
          }
        })
        .to(socketPulseRef.current, {
          x: 154,
          duration: 1.6,
          ease: "power1.inOut"
        })
        .to(socketPulseRef.current, {
          duration: 0.15,
          onStart: () => {
            setPacketLabel(selectedCmdKey === "run" ? "201 Created" : selectedCmdKey === "ps" ? "200 OK" : "101 Switching");
          }
        })
        .to(socketPulseRef.current, {
          x: 0,
          duration: 1.6,
          ease: "power1.inOut"
        })
        .to(socketPulseRef.current, {
          scale: 0,
          opacity: 0,
          duration: 0.25
        });
      } else {
        tl.to({}, { duration: stepDuration });
      }
    });

    // Add a final step to complete the sequence cleanly (prevents constructor callback overwrite bug)
    tl.to({}, {
      duration: 0.05,
      onStart: () => {
        setIsPlayingSeq(false);
        setCurrentStepIndex(activeCmdData.steps.length - 1);
        if (selectedCmdKey === "run") {
          setTerminalOutput(`$ ${activeCmdData.cmd}\n9a74421b8a5fc7c6a0d0d8e20f1885913ef0102b489a20a4b865bd278cd5b6bb\n\n[SUCCESS] nginx container started in background.`);
        } else if (selectedCmdKey === "ps") {
          setTerminalOutput(`$ ${activeCmdData.cmd}\nCONTAINER ID   IMAGE     COMMAND                  STATUS          PORTS\n9a74421b8a5f   nginx     "/docker-entrypoint…"    Up 42 seconds   0.0.0.0:8080->80/tcp`);
        } else {
          setTerminalOutput(`$ ${activeCmdData.cmd}\n# _ (Shell stream open. Interactive stdin connected)`);
        }
      }
    });

    return () => {
      tl.kill();
    };
  }, [selectedCmdKey]);

  // Bind to global controllers
  useAnimationControls(timeline);

  return (
    <VisualCanvas
      objective="Trace how CLI commands convey API instructions over the Unix socket to communicate with the Daemon."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-[#FAFAFA]" />
            What is docker.sock?
          </div>
          <p>
            The Docker Client (CLI) does not run your container directly. Instead, it converts your command parameters into HTTP REST payloads and passes them over the local file socket at `/var/run/docker.sock` to the Daemon process (dockerd).
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none">
        
        {/* CLI/Socket/Daemon Playground (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[300px]">
          
          {/* Centered relative playground workspace (fixed width to prevent layout shifts) */}
          <div className="w-[470px] h-[140px] relative shrink-0">
            
            {/* Physical Unix Socket Conduit Pipe (centered vertically with the cards) */}
            <div className="absolute left-[160px] w-[150px] top-[32px] h-[16px] border-t border-b border-zinc-800/80 bg-[#0b0b0c] rounded-[2px] flex items-center justify-center pointer-events-none z-0">
              <div className="w-full h-0.5 border-t border-dashed border-zinc-800/60" />
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[6.5px] font-bold text-zinc-550 uppercase tracking-wider font-mono">
                docker.sock
              </span>
            </div>

            {/* Glowing Request/Response Capsule Packet Orb */}
            <div
              ref={socketPulseRef}
              className="absolute left-[150px] top-[29px] px-2 py-0.5 rounded-full bg-white text-black text-[7px] font-bold font-mono shadow-[0_0_8px_rgba(255,255,255,0.75)] opacity-0 scale-0 z-20 pointer-events-none whitespace-nowrap flex items-center justify-center leading-none"
            >
              {packetLabel}
            </div>

            {/* Docker Client CLI Card (Left) */}
            <div className="absolute left-0 top-0 w-40">
              <NodePrimitive
                label="Docker CLI"
                type="laptop"
                status={currentStepIndex >= 0 && activeCmdData.steps[currentStepIndex]?.source === "client" ? "running" : "idle"}
                className="w-full"
              >
                <div className="font-mono text-[9px] text-zinc-450 leading-relaxed bg-[#0d0d0e] p-2.5 rounded-[12px] border border-zinc-800/30 overflow-hidden flex flex-col justify-center min-h-[44px]">
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-500">$</span>
                    <span className="text-zinc-300 font-bold">
                      {selectedCmdKey === "run" && "docker run"}
                      {selectedCmdKey === "ps" && "docker ps"}
                      {selectedCmdKey === "exec" && "docker exec"}
                    </span>
                  </div>
                  <span className="text-[6.5px] text-zinc-500 font-mono mt-0.5">
                    {currentStepIndex === 0 && "parsing arguments..."}
                    {currentStepIndex === 1 && "sending payload..."}
                    {currentStepIndex === 5 && "exiting cleanly..."}
                    {currentStepIndex === -1 && "waiting..."}
                  </span>
                </div>
              </NodePrimitive>
            </div>

            {/* Docker Daemon Card (Right) */}
            <div className="absolute right-0 top-0 w-40">
              <NodePrimitive
                label="Docker Daemon"
                type="server"
                status={currentStepIndex >= 0 && activeCmdData.steps[currentStepIndex]?.source === "daemon" ? "running" : "idle"}
                className="w-full"
              >
                <div className="font-mono text-[9px] text-zinc-450 leading-relaxed bg-[#0d0d0e] p-2.5 rounded-[12px] border border-zinc-800/30 overflow-hidden flex flex-col gap-1 min-h-[44px]">
                  <div className="text-zinc-300 font-bold flex justify-between items-center font-sans">
                    <span>dockerd</span>
                    {containerActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-200 animate-ping" />
                    )}
                  </div>
                  <div className="flex gap-1.5 text-[6.5px] text-zinc-500 font-bold justify-between">
                    <span className={cn("transition-colors", currentStepIndex >= 2 ? "text-zinc-300" : "")}>
                      Layers
                    </span>
                    <span>•</span>
                    <span className={cn("transition-colors", currentStepIndex >= 3 ? "text-zinc-300" : "")}>
                      Net
                    </span>
                    <span>•</span>
                    <span className={cn("transition-colors", currentStepIndex >= 4 ? "text-zinc-300" : "")}>
                      Sandbox
                    </span>
                  </div>
                </div>
              </NodePrimitive>
            </div>

            {/* Running Container Process Box (appears under Daemon card when created) */}
            <div className={cn(
              "absolute right-0 top-[90px] w-40 h-8 rounded-[8px] border bg-[#0d0d0e]/60 flex items-center justify-center gap-1.5 transition-all duration-500 select-text",
              containerActive
                ? "opacity-100 scale-100 border-zinc-850 shadow-[0_0_8px_rgba(255,255,255,0.06)]"
                : "opacity-0 scale-95 border-zinc-800 pointer-events-none"
            )}>
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[8px] font-mono text-zinc-250 font-bold">nginx_web (running)</span>
            </div>

          </div>

          {/* Stepper Timeline Progression track */}
          <div className="w-full flex justify-between items-start gap-1 max-w-md shrink-0 mt-8 select-none">
            {activeCmdData.steps.map((step, i) => {
              const isDone = i < currentStepIndex;
              const isActive = i === currentStepIndex;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className={cn(
                      "h-1 w-full rounded-full transition-all duration-300",
                      isDone && "bg-[#FAFAFA]",
                      isActive && "bg-[#FAFAFA] animate-pulse",
                      !isDone && !isActive && "bg-zinc-800"
                    )} 
                  />
                  <span className={cn(
                    "text-[7.5px] uppercase tracking-wider font-semibold font-mono mt-1 text-center leading-normal whitespace-normal w-full max-w-[65px] break-words",
                    isActive ? "text-[#FAFAFA] font-bold" : "text-zinc-650"
                  )}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Command console & Terminal Output (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm font-sans">
          {/* Command selector tab rows */}
          <div className="flex flex-col gap-2">
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
              Select CLI Command
            </span>
            <div className="flex flex-col gap-1.5">
              {Object.keys(COMMAND_STEPS).map((cmdKey) => (
                <button
                  key={cmdKey}
                  onClick={() => setSelectedCmdKey(cmdKey)}
                  disabled={isPlayingSeq}
                  className={cn(
                    "w-full px-3 py-2 rounded-[9px] text-left font-mono text-[9px] font-bold transition-all cursor-pointer border border-zinc-800/30",
                    selectedCmdKey === cmdKey
                      ? "bg-zinc-800 text-white border-zinc-700"
                      : "bg-[#0d0d0e] text-zinc-450 hover:bg-zinc-850"
                  )}
                >
                  {COMMAND_STEPS[cmdKey].cmd}
                </button>
              ))}
            </div>
          </div>

          {/* Trace Output Log console window */}
          <div className="rounded-[12px] border border-zinc-800/35 bg-[#0d0d0e] overflow-hidden flex flex-col h-[90px] shadow-inner select-text">
            <div className="bg-[#1a1a1e] px-3.5 py-1 border-b border-zinc-800/30 flex items-center shrink-0">
              <span className="text-[8px] font-mono text-zinc-500">trace output</span>
            </div>
            <div className="p-2.5 font-mono text-[9px] text-zinc-450 leading-relaxed overflow-y-auto flex-1">
              {terminalOutput}
            </div>
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
