"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { AlertCircle, Play, RotateCcw, HelpCircle } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { Button } from "@/components/ui/button";
import { useAnimationStore } from "@/stores/animationStore";

interface LayerInfo {
  title: string;
  desc: string;
  overhead: "heavy" | "medium" | "none";
}

const LAYER_DETAILS: Record<string, LayerInfo> = {
  infra: { title: "Infrastructure", desc: "Physical host hardware, CPU, RAM, disk, or bare-metal cloud servers.", overhead: "none" },
  hostOS: { title: "Host OS", desc: "The host machine operating system kernel (e.g. Linux Kernel) running on the hardware.", overhead: "none" },
  hypervisor: { title: "Hypervisor", desc: "Software (Type-1 or Type-2, e.g. ESXi, KVM, VirtualBox) that splits physical hardware into virtual machines.", overhead: "medium" },
  guestOS: { title: "Guest OS", desc: "Full copy of operating system (kernel, userland, utilities). Highly resource intensive, typically >1GB footprint.", overhead: "heavy" },
  docker: { title: "Container Engine", desc: "Docker Daemon that communicates with Host OS kernel and isolates processes, sharing system resources directly.", overhead: "none" },
  vmApp: { title: "App + Libs (VM)", desc: "Application binaries and libraries wrapped inside guest OS boundaries.", overhead: "none" },
  containerApp: { title: "App + Libs (Docker)", desc: "Isolated application code and files. Extremely lightweight, usually only a few megabytes.", overhead: "none" }
};

export default function ContainersVsVMs() {
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [bootState, setBootState] = useState<"idle" | "booting" | "ready">("idle");
  const [vmProgress, setVmProgress] = useState(0);
  const [containerProgress, setContainerProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const vmStackRef = useRef<HTMLDivElement>(null);
  const containerStackRef = useRef<HTMLDivElement>(null);
  const vmStatsRef = useRef<HTMLDivElement>(null);
  const containerStatsRef = useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  const { isPlaying, setPlaying, setProgress } = useAnimationStore();

  // Assembly animation on mount (standalone, no timeline conflict)
  useEffect(() => {
    const ctx = gsap.context(() => {
      const vmLayers = vmStackRef.current?.querySelectorAll(".stack-layer");
      const containerLayers = containerStackRef.current?.querySelectorAll(".stack-layer");

      if (vmLayers && containerLayers) {
        gsap.fromTo([vmLayers, containerLayers],
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.05,
            duration: 0.5,
            ease: "back.out(1.2)"
          }
        );
      }
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const handleSimulateBoot = () => {
    setBootState("booting");
    setVmProgress(0);
    setContainerProgress(0);
    setPlaying(true);
    setProgress(0);
    
    // Hide stats initially
    gsap.set([vmStatsRef.current, containerStatsRef.current], { opacity: 0, y: 10 });

    const bootTimeline = gsap.timeline();
    setTimeline(bootTimeline);

    // 1. Container Boots instantly (0.15s)
    bootTimeline.to({}, {
      duration: 0.15,
      onUpdate: function() {
        setContainerProgress(Math.floor(this.progress() * 100));
      }
    })

    // 2. VM Boots slowly (takes 2.8s simulation time)
    .to({}, {
      duration: 2.8,
      ease: "power1.inOut",
      onUpdate: function() {
        setVmProgress(Math.floor(this.progress() * 100));
      }
    })

    // 3. Complete boot sequence and animate statistics
    .to({}, {
      duration: 0.05,
      onStart: () => {
        setBootState("ready");
        // Animate stats in
        gsap.to([vmStatsRef.current, containerStatsRef.current], {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out"
        });
      }
    });

    bootTimeline.play();
  };

  const handleResetBoot = () => {
    setBootState("idle");
    setVmProgress(0);
    setContainerProgress(0);
    setPlaying(false);
    setProgress(0);
    gsap.set([vmStatsRef.current, containerStatsRef.current], { opacity: 0, y: 10 });
    if (timeline) {
      timeline.pause().progress(0);
      setTimeline(null);
    }
  };

  return (
    <VisualCanvas
      objective="Compare the architectural structure, boot speed, and resource footprint of Virtual Machines vs Docker Containers."
      timeline={timeline}
      explanation={
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 font-bold text-[#FAFAFA]">
            <HelpCircle className="w-4 h-4 text-[#A1A1AA]" />
            What is the Guest OS overhead?
          </div>
          <p>
            Virtual Machines run on top of a Hypervisor. Each VM requires a complete <strong>Guest OS</strong> (which has its own kernel, system drivers, and background libraries), consuming gigabytes of storage and memory. This makes boot sequences slow (typically 15 to 30 seconds).
          </p>
          <p>
            Docker Containers share the host computer's <strong>OS Kernel</strong> directly. There is no hypervisor layer or guest operating system overhead. A container is simply an isolated host process, allowing it to boot in milliseconds and run with negligible memory usage.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none bg-[#0D0D0D]">
        
        {/* VM Layout Stack */}
        <div className="flex-1 flex flex-col items-center p-5 border border-[#2A2A2A] bg-[#111111] rounded-[12px] relative shadow-sm">
          <h4 className="text-xs font-bold text-[#FAFAFA] mb-6 flex flex-col items-center gap-1.5 text-center font-sans">
            Virtual Machines
            <span className="text-[8px] font-mono uppercase px-2 py-0.5 rounded-[6px] bg-[#171717] text-[#71717A] font-semibold border border-[#232323]">
              Hypervisor Isolation
            </span>
          </h4>

          {/* Stack Layers container */}
          <div ref={vmStackRef} className="w-full max-w-[220px] flex flex-col gap-1.5 relative">
            {/* App Binaries */}
            <button 
              onClick={() => setSelectedLayer("vmApp")}
              className={cn(
                "stack-layer h-10 rounded-[6px] text-xs font-bold flex items-center justify-center transition-all border cursor-pointer select-none font-sans",
                selectedLayer === "vmApp" 
                  ? "bg-[#FAFAFA] text-[#000000] border-[#FAFAFA]" 
                  : "bg-[#090909] text-[#A1A1AA] border-[#232323] hover:bg-[#151515] hover:text-[#FAFAFA] hover:border-[#A1A1AA]"
              )}
            >
              App Binary + Libs
            </button>

            {/* Guest OS */}
            <button 
              onClick={() => setSelectedLayer("guestOS")}
              className={cn(
                "stack-layer h-12 rounded-[6px] text-xs font-bold flex flex-col items-center justify-center transition-all border relative overflow-hidden cursor-pointer select-none font-sans",
                selectedLayer === "guestOS" 
                  ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/45" 
                  : "bg-[#EF4444]/5 text-[#EF4444]/80 border-[#EF4444]/15 hover:bg-[#EF4444]/10 hover:border-[#EF4444]/45"
              )}
            >
              <span className="text-[8px] uppercase tracking-wider text-[#EF4444] font-semibold block mb-0.5 font-mono">Heavy Guest OS</span>
              Guest OS (Ubuntu/Win)
              {bootState === "booting" && vmProgress < 100 && (
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-[#EF4444] transition-all duration-75"
                  style={{ width: `${vmProgress}%` }}
                />
              )}
            </button>

            {/* Hypervisor */}
            <button 
              onClick={() => setSelectedLayer("hypervisor")}
              className={cn(
                "stack-layer h-10 rounded-[6px] text-xs font-bold flex items-center justify-center transition-all border cursor-pointer select-none font-sans",
                selectedLayer === "hypervisor" 
                  ? "bg-[#FAFAFA] text-[#000000] border-[#FAFAFA]" 
                  : "bg-[#090909] text-[#A1A1AA] border-[#232323] hover:bg-[#151515] hover:text-[#FAFAFA] hover:border-[#A1A1AA]"
              )}
            >
              Hypervisor (Type-1/2)
            </button>

            {/* Host OS */}
            <button 
              onClick={() => setSelectedLayer("hostOS")}
              className={cn(
                "stack-layer h-10 rounded-[6px] text-xs font-bold flex items-center justify-center transition-all border cursor-pointer select-none font-sans",
                selectedLayer === "hostOS" 
                  ? "bg-[#FAFAFA] text-[#000000] border-[#FAFAFA]" 
                  : "bg-[#090909] text-[#A1A1AA] border-[#232323] hover:bg-[#151515] hover:text-[#FAFAFA] hover:border-[#A1A1AA]"
              )}
            >
              Host OS (Kernel)
            </button>

            {/* Infra */}
            <button 
              onClick={() => setSelectedLayer("infra")}
              className={cn(
                "stack-layer h-10 rounded-[6px] text-xs font-bold flex items-center justify-center transition-all border cursor-pointer select-none font-sans",
                selectedLayer === "infra" 
                  ? "bg-[#FAFAFA] text-[#000000] border-[#FAFAFA]" 
                  : "bg-[#090909] text-[#A1A1AA] border-[#232323] hover:bg-[#151515] hover:text-[#FAFAFA] hover:border-[#A1A1AA]"
              )}
            >
              Infrastructure
            </button>
          </div>

          {/* Boot Status Widget */}
          <div className="mt-5 w-full max-w-[220px] text-center font-mono text-[9px]">
            {bootState === "booting" && (
              <div className="text-[#71717A] flex flex-col gap-1">
                <span>Booting Guest OS...</span>
                <span className="text-xs font-bold text-[#A1A1AA]">{vmProgress}%</span>
              </div>
            )}
            {bootState === "ready" && (
              <span className="text-[#EF4444] font-bold uppercase tracking-wider block">VM Ready (~15s boot)</span>
            )}
            {bootState === "idle" && (
              <span className="text-[#71717A] uppercase font-semibold">VM Shutdown</span>
            )}
          </div>

          {/* VM Resource Usage (Only visible when ready) */}
          <div ref={vmStatsRef} className="mt-4 w-full max-w-[220px] bg-[#090909] p-3 rounded-[6px] border border-[#232323] flex flex-col gap-2.5 opacity-0 select-text">
            <span className="text-[8px] font-mono uppercase tracking-wider text-[#71717A] font-bold block">
              VM Resource Footprint
            </span>
            <div className="flex flex-col gap-1 text-[9px] text-[#A1A1AA] font-sans">
              <div className="flex justify-between">
                <span>Memory Overhead:</span>
                <span className="font-bold text-[#EF4444]">~2048 MB</span>
              </div>
              <div className="flex justify-between">
                <span>OS Storage:</span>
                <span className="font-bold text-[#EF4444]">~20 GB</span>
              </div>
              <div className="flex justify-between">
                <span>Idle CPU Load:</span>
                <span className="font-bold text-[#EF4444]">~25%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Container Layout Stack */}
        <div className="flex-1 flex flex-col items-center p-5 border border-[#2A2A2A] bg-[#111111] rounded-[12px] relative shadow-sm">
          <h4 className="text-xs font-bold text-[#FAFAFA] mb-6 flex flex-col items-center gap-1.5 text-center font-sans">
            Docker Containers
            <span className="text-[8px] font-mono uppercase px-2 py-0.5 rounded-[6px] bg-[#171717] text-[#0EA5E9] font-semibold border border-[#0EA5E9]/20">
              Shared Kernel Isolation
            </span>
          </h4>

          {/* Stack Layers container */}
          <div ref={containerStackRef} className="w-full max-w-[220px] flex flex-col gap-1.5 relative">
            {/* App Binaries */}
            <button 
              onClick={() => setSelectedLayer("containerApp")}
              className={cn(
                "stack-layer h-10 rounded-[6px] text-xs font-bold flex flex-col items-center justify-center transition-all border relative overflow-hidden cursor-pointer select-none font-sans",
                selectedLayer === "containerApp" 
                  ? "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/40" 
                  : "bg-[#090909] text-[#A1A1AA] border-[#232323] hover:bg-[#151515] hover:text-[#FAFAFA] hover:border-[#A1A1AA]"
              )}
            >
              App Binary + Libs
              {bootState === "booting" && containerProgress < 100 && (
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-[#22C55E] transition-all duration-75"
                  style={{ width: `${containerProgress}%` }}
                />
              )}
            </button>

            {/* Docker Engine */}
            <button 
              onClick={() => setSelectedLayer("docker")}
              className={cn(
                "stack-layer h-12 rounded-[6px] text-xs font-bold flex flex-col items-center justify-center transition-all border relative overflow-hidden cursor-pointer select-none font-sans",
                selectedLayer === "docker" 
                  ? "bg-[#0EA5E9]/15 text-[#0EA5E9] border-[#0EA5E9]/40" 
                  : "bg-[#0EA5E9]/5 text-[#0EA5E9]/80 border-[#0EA5E9]/15 hover:bg-[#0EA5E9]/10 hover:border-[#0EA5E9]/40"
              )}
            >
              <span className="text-[8px] uppercase tracking-wider text-[#0EA5E9] font-semibold block mb-0.5 font-mono">Shared OS Kernel</span>
              Container Engine (Docker)
            </button>

            {/* Spacer (NO GUEST OS) */}
            <div className="h-10 border border-dashed border-[#232323] bg-transparent rounded-[6px] flex items-center justify-center text-[10px] text-[#71717A] italic select-none font-sans">
              No Guest OS Layer
            </div>

            {/* Host OS */}
            <button 
              onClick={() => setSelectedLayer("hostOS")}
              className={cn(
                "stack-layer h-10 rounded-[6px] text-xs font-bold flex items-center justify-center transition-all border cursor-pointer select-none font-sans",
                selectedLayer === "hostOS" 
                  ? "bg-[#FAFAFA] text-[#000000] border-[#FAFAFA]" 
                  : "bg-[#090909] text-[#A1A1AA] border-[#232323] hover:bg-[#151515] hover:text-[#FAFAFA] hover:border-[#A1A1AA]"
              )}
            >
              Host OS (Kernel)
            </button>

            {/* Infra */}
            <button 
              onClick={() => setSelectedLayer("infra")}
              className={cn(
                "stack-layer h-10 rounded-[6px] text-xs font-bold flex items-center justify-center transition-all border cursor-pointer select-none font-sans",
                selectedLayer === "infra" 
                  ? "bg-[#FAFAFA] text-[#000000] border-[#FAFAFA]" 
                  : "bg-[#090909] text-[#A1A1AA] border-[#232323] hover:bg-[#151515] hover:text-[#FAFAFA] hover:border-[#A1A1AA]"
              )}
            >
              Infrastructure
            </button>
          </div>

          {/* Boot Status Widget */}
          <div className="mt-5 w-full max-w-[220px] text-center font-mono text-[9px]">
            {bootState === "booting" && (
              <div className="text-cyan-500 flex flex-col gap-1">
                <span>Instantiating Sandbox...</span>
                <span className="text-xs font-bold text-cyan-400">{containerProgress}%</span>
              </div>
            )}
            {bootState === "ready" && (
              <span className="text-[#22C55E] font-bold uppercase tracking-wider block">Running Container (&lt;50ms boot)</span>
            )}
            {bootState === "idle" && (
              <span className="text-[#71717A] uppercase font-semibold">Container Stopped</span>
            )}
          </div>

          {/* Container Resource Usage (Only visible when ready) */}
          <div ref={containerStatsRef} className="mt-4 w-full max-w-[220px] bg-[#090909] p-3 rounded-[6px] border border-[#232323] flex flex-col gap-2.5 opacity-0 select-text">
            <span className="text-[8px] font-mono uppercase tracking-wider text-[#71717A] font-bold block">
              Container Resource Footprint
            </span>
            <div className="flex flex-col gap-1 text-[9px] text-[#A1A1AA] font-sans">
              <div className="flex justify-between">
                <span>Memory Overhead:</span>
                <span className="font-bold text-[#22C55E]">~15 MB</span>
              </div>
              <div className="flex justify-between">
                <span>OS Storage:</span>
                <span className="font-bold text-[#22C55E]">~200 MB</span>
              </div>
              <div className="flex justify-between">
                <span>Idle CPU Load:</span>
                <span className="font-bold text-[#22C55E]">&lt; 0.1%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Explanations & Information overlay panel */}
        <div className="w-full md:w-80 p-5 rounded-[12px] border border-[#2A2A2A] bg-[#111111] flex flex-col gap-4 relative shrink-0 shadow-sm">
          <h4 className="text-xs font-bold text-[#FAFAFA] uppercase tracking-widest font-mono">
            Layer Inspector
          </h4>

          {selectedLayer ? (
            <div className="flex flex-col flex-1 select-text font-sans">
              <h5 className="text-sm font-bold text-[#FAFAFA] flex items-center gap-1.5">
                {LAYER_DETAILS[selectedLayer].title}
                {LAYER_DETAILS[selectedLayer].overhead === "heavy" && (
                  <span className="text-[8px] bg-[#EF4444]/10 text-[#EF4444] px-2 py-0.5 rounded-[6px] font-semibold uppercase font-mono">
                    Overhead
                  </span>
                )}
              </h5>
              <p className="text-xs text-[#A1A1AA] leading-relaxed font-normal mt-2">
                {LAYER_DETAILS[selectedLayer].desc}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center text-[#71717A] py-6 border border-dashed border-[#232323] rounded-[6px] select-text">
              <AlertCircle className="w-5 h-5 text-[#52525B] mb-2" />
              <p className="text-[10px] leading-relaxed max-w-[160px] font-medium font-sans">
                Click on any box in the diagram stacks above (e.g. Guest OS, Hypervisor, or Container Engine) to inspect its architectural details.
              </p>
            </div>
          )}

          {/* Boot action simulator widgets */}
          <div className="pt-4 border-t border-[#232323] mt-4 shrink-0">
            {bootState === "idle" ? (
              <button
                onClick={handleSimulateBoot}
                className="w-full bg-[#FAFAFA] text-[#000000] hover:bg-[#FAFAFA]/95 text-xs font-bold py-2.5 rounded-[9px] flex items-center justify-center gap-1.5 cursor-pointer border-0 shadow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-[#000000] text-[#000000]" />
                Simulate Boot Sequence
              </button>
            ) : (
              <button
                disabled={bootState === "booting"}
                onClick={handleResetBoot}
                className="w-full bg-[#171717] border border-[#2A2A2A] hover:bg-[#151515] hover:border-[#FAFAFA] text-[#FAFAFA] text-xs font-bold py-2.5 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Simulation
              </button>
            )}
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
