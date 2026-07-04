"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { useAnimationStore } from "@/stores/animationStore";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";
import { PacketPrimitive } from "@/components/primitives/PacketPrimitive";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { cn } from "@/lib/utils";
import { HelpCircle, Terminal, Radio, Server, Cpu, Box, ShieldCheck } from "lucide-react";

interface Subsystem {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  desc: string;
}

const SUBSYSTEMS: Subsystem[] = [
  { id: "cli", name: "Docker CLI", subtitle: "User Client interface", icon: <Terminal className="w-3.5 h-3.5" />, desc: "Accepts terminal instructions (e.g. docker run nginx) and parses them into REST API query packets." },
  { id: "rest", name: "Unix Socket / REST API", subtitle: "Transport protocol interface", icon: <Radio className="w-3.5 h-3.5" />, desc: "Conveys structured JSON payloads over the local unix socket at /var/run/docker.sock." },
  { id: "daemon", name: "Docker Daemon (dockerd)", subtitle: "Engine supervisor daemon", icon: <Server className="w-3.5 h-3.5" />, desc: "Coordinates networks, volume allocations, image registry authentication, and handles configuration schemas." },
  { id: "containerd", name: "containerd", subtitle: "Lifecycle manager supervisor", icon: <Cpu className="w-3.5 h-3.5" />, desc: "Supervises container execution states, fetches container image bundles, and handles low-level process triggers." },
  { id: "runc", name: "runc", subtitle: "Low-Level OCI process creator", icon: <Box className="w-3.5 h-3.5" />, desc: "Creates namespaces and control group resource boundaries, forks the execution script, and then exits." },
  { id: "kernel", name: "Linux Kernel", subtitle: "Host OS kernel executor", icon: <ShieldCheck className="w-3.5 h-3.5" />, desc: "Manages underlying namespaces isolation and control group resource boundaries, executing the sandbox." }
];

export default function EngineInternals() {
  const [activeStepId, setActiveStepId] = useState<string>("cli");
  const [animationState, setAnimationState] = useState<"idle" | "running" | "complete">("idle");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  const { setPlaying } = useAnimationStore();

  // Register timeline with playback controllers
  const { isPlaying } = useAnimationControls(timeline);

  const Y_MAP: Record<string, number> = {
    cli: 0,
    rest: 48,
    daemon: 96,
    containerd: 144,
    runc: 192,
    kernel: 240
  };

  const handleStepClick = (id: string) => {
    if (timeline) {
      timeline.pause();
    }
    setPlaying(false);
    setActiveStepId(id);
    gsap.to(packetRef.current, {
      y: Y_MAP[id],
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: "power2.out"
    });
  };

  useEffect(() => {
    // Reset positions
    setAnimationState("idle");
    setActiveStepId("cli");
    gsap.set(packetRef.current, { y: 0, opacity: 0, scale: 0 });

    const tl = gsap.timeline({
      paused: true,
      onStart: () => setAnimationState("running"),
      onComplete: () => setAnimationState("complete"),
    });

    setTimeline(tl);

    // Sequence of animations going down the vertical stack
    // Dev note: y values represent relative vertical offsets for each stack node layer
    tl.to(packetRef.current, { opacity: 1, scale: 1, duration: 0.15 })
      // CLI -> REST API
      .to(packetRef.current, {
        y: 48,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => setActiveStepId("rest"),
      })
      // REST API -> Daemon
      .to(packetRef.current, {
        y: 96,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => setActiveStepId("daemon"),
      })
      // Daemon -> containerd
      .to(packetRef.current, {
        y: 144,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => setActiveStepId("containerd"),
      })
      // containerd -> runc
      .to(packetRef.current, {
        y: 192,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => setActiveStepId("runc"),
      })
      // runc -> Linux Kernel
      .to(packetRef.current, {
        y: 240,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => setActiveStepId("kernel"),
      })
      // Success flash
      .to(packetRef.current, {
        scale: 1.5,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      });

    return () => {
      tl.kill();
    };
  }, []);

  const handleReset = () => {
    setAnimationState("idle");
    setActiveStepId("cli");
    setPlaying(false);
    if (timeline) {
      timeline.pause().progress(0);
    }
  };

  return (
    <VisualCanvas
      objective="Understand how Docker operates internally by tracing a client query through the engine daemon stack."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-[#FAFAFA]" />
            Is Docker a Hypervisor?
          </div>
          <p>
            No. Unlike a Hypervisor, Docker does not emulate hardware. It acts as an orchestrator that sends API directives to OCI runtimes (like <strong>runc</strong>), which instruct the host OS kernel to create namespaces and cgroup boundaries.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none">
        
        {/* Stack diagram list (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px]">
          
          {/* Centered relative wrapper to coordinate packet and dashed line positions perfectly */}
          <div className="w-full max-w-sm relative">
            {/* Connection pathway background line */}
            <div className="absolute top-[20px] bottom-[20px] left-1/2 -translate-x-1/2 w-0.5 border-l border-dashed border-zinc-800/40 z-0 pointer-events-none" />

            {/* Glowing execution packet */}
            <PacketPrimitive
              ref={packetRef}
              color="#FAFAFA"
              size={10}
              className="top-[15px] left-1/2 -translate-x-1/2 z-20"
            />

            {/* Vertical Subsystem Nodes */}
            <div className="w-full flex flex-col gap-2 relative z-10">
              {SUBSYSTEMS.map((sub) => {
                const isActive = activeStepId === sub.id;
                
                return (
                  <div key={sub.id} className="h-10">
                    <NodePrimitive
                      label={sub.name}
                      status={isActive ? "running" : "idle"}
                      icon={sub.icon}
                      subtitle={sub.subtitle}
                      onClick={() => handleStepClick(sub.id)}
                      className={cn(
                        "py-1.5 px-3.5 h-full rounded-[9px] transition-all duration-300",
                        isActive ? "scale-[1.01]" : "opacity-80"
                      )}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Layer Inspector panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn font-sans">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#A1A1AA] font-bold block mb-1">
              Stack Subsystem Detail
            </span>
            <h4 className="text-base font-extrabold text-white">
              {SUBSYSTEMS.find((s) => s.id === activeStepId)?.name}
            </h4>
            <span className="text-[10px] text-zinc-500 font-mono font-semibold block mt-0.5">
              {SUBSYSTEMS.find((s) => s.id === activeStepId)?.subtitle}
            </span>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-3 select-text">
              {SUBSYSTEMS.find((s) => s.id === activeStepId)?.desc}
            </p>
          </div>

          <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/20 text-[10px] text-zinc-450 leading-relaxed select-text mt-auto">
            <span className="font-bold block mb-0.5 text-zinc-200">Daemon Architecture:</span>
            Docker decouples commands via gRPC. Dockerd handles high-level config schemas, containerd monitors runtimes, and runc forks the namespaces.
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
