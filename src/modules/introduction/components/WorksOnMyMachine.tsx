"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";
import { PacketPrimitive } from "@/components/primitives/PacketPrimitive";
import { useAnimationStore } from "@/stores/animationStore";

export default function WorksOnMyMachine() {
  const [isDockerized, setIsDockerized] = useState<boolean>(false);
  const [devStatus, setDevStatus] = useState<"idle" | "running" | "healthy" | "crashed">("idle");
  const [qaStatus, setQaStatus] = useState<"idle" | "booting" | "healthy" | "crashed">("idle");
  const [prodStatus, setProdStatus] = useState<"idle" | "booting" | "healthy" | "crashed">("idle");

  const containerRef = useRef<HTMLDivElement>(null);
  const devConsoleRef = useRef<HTMLDivElement>(null);
  const qaConsoleRef = useRef<HTMLDivElement>(null);
  const prodConsoleRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  const { isPlaying, setPlaying, setProgress } = useAnimationStore();

  useAnimationControls(timeline);

  const handleReset = useCallback(() => {
    setDevStatus("idle");
    setQaStatus("idle");
    setProdStatus("idle");

    if (devConsoleRef.current) devConsoleRef.current.textContent = "Ready to run app...";
    if (qaConsoleRef.current) qaConsoleRef.current.textContent = "Awaiting deployment...";
    if (prodConsoleRef.current) prodConsoleRef.current.textContent = "Awaiting deployment...";

    if (timeline) {
      timeline.pause().progress(0);
    }
    gsap.set(packetRef.current, { scale: 0, opacity: 0, x: 0 });
  }, [timeline]);

  // Setup GSAP animation
  useEffect(() => {
    handleReset();

    const tl = gsap.timeline({
      paused: true,
      onStart: () => {
        setPlaying(true);
        setDevStatus("running");
      },
      onUpdate: () => {
        if (tl) setProgress(tl.progress() * 100);
      },
      onComplete: () => {
        setPlaying(false);
      },
    });

    setTimeline(tl);

    gsap.set(packetRef.current, { scale: 0, opacity: 0, x: 0, backgroundColor: isDockerized ? "#FAFAFA" : "#A1A1AA" });

    if (!isDockerized) {
      // --- SCENARIO 1: WITHOUT DOCKER (FAILS IN QA & PROD) ---
      // Step 1: Dev runs app successfully
      tl.to({}, { duration: 0.1, onStart: () => setDevStatus("running") })
        .to(devConsoleRef.current, {
          textContent: "python app.py\nPython 3.10 loaded.\nImporting fastapi...\n\n[SUCCESS] listening on port 8000",
          duration: 1.2,
          ease: "none",
          onComplete: () => setDevStatus("healthy"),
        })
        // Step 2: Push code to QA (Fails due to missing package)
        .to(packetRef.current, { opacity: 1, scale: 1, duration: 0.2 })
        .to(packetRef.current, {
          x: 230, // move to QA node
          duration: 1.0,
          ease: "power2.inOut",
          onStart: () => setQaStatus("booting"),
        })
        .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.2 })
        .to(qaConsoleRef.current, {
          textContent: "python app.py\nPython 3.10 loaded.\nImporting fastapi...\n\nTraceback:\n  ModuleNotFoundError: No module named 'fastapi'\n\n[CRASH] Process exited with status 1",
          duration: 1.8,
          ease: "none",
          onComplete: () => setQaStatus("crashed"),
        })
        // Step 3: Fixed QA dependency locally, push code to Prod (Fails due to OS Python version difference)
        .to(packetRef.current, { x: 0, opacity: 0, duration: 0.1 }) // reset packet to dev
        .to(packetRef.current, { opacity: 1, scale: 1, duration: 0.2 })
        .to(packetRef.current, {
          x: 460, // move past QA to Prod node
          duration: 1.5,
          ease: "power2.inOut",
          onStart: () => setProdStatus("booting"),
        })
        .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.2 })
        .to(prodConsoleRef.current, {
          textContent: "python app.py\nPython 3.8 loaded.\nImporting fastapi...\n\nTraceback:\n  ImportError: cannot import name 'Annotated' from 'typing'\n\n[CRASH] OS version mismatch",
          duration: 1.8,
          ease: "none",
          onComplete: () => setProdStatus("crashed"),
        });
    } else {
      // --- SCENARIO 2: WITH DOCKER (ISOLATED DOCKER CONTAINER IMAGE RUNS EVERYWHERE) ---
      // Step 1: Package container image on Dev
      tl.to({}, { duration: 0.1, onStart: () => setDevStatus("running") })
        .to(devConsoleRef.current, {
          textContent: "docker build -t webapp .\n[BUILD] packaging dependencies...\n[BUILD] Python 3.10 container OS\n[BUILD] image webapp:latest ready",
          duration: 1.5,
          ease: "none",
          onComplete: () => setDevStatus("healthy"),
        })
        // Step 2: Deploy identical container to QA
        .to(packetRef.current, { opacity: 1, scale: 1, duration: 0.2 })
        .to(packetRef.current, {
          x: 230,
          duration: 1.0,
          ease: "power2.inOut",
          onStart: () => setQaStatus("booting"),
        })
        .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.2 })
        .to(qaConsoleRef.current, {
          textContent: "docker run webapp\n[DOCKER] pulling base image...\n[DOCKER] matching engine config...\n[SUCCESS] container up on port 8000",
          duration: 1.5,
          ease: "none",
          onComplete: () => setQaStatus("healthy"),
        })
        // Step 3: Deploy same image container to Prod
        .to(packetRef.current, { x: 0, opacity: 0, duration: 0.1 })
        .to(packetRef.current, { opacity: 1, scale: 1, duration: 0.2 })
        .to(packetRef.current, {
          x: 460,
          duration: 1.2,
          ease: "power2.inOut",
          onStart: () => setProdStatus("booting"),
        })
        .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.2 })
        .to(prodConsoleRef.current, {
          textContent: "docker run webapp\n[DOCKER] pulling base image...\n[DOCKER] loading layer volumes...\n[SUCCESS] container up on port 8000",
          duration: 1.5,
          ease: "none",
          onComplete: () => setProdStatus("healthy"),
        });
    }

    return () => {
      tl.kill();
    };
  }, [isDockerized, setPlaying, setProgress]);

  return (
    <VisualCanvas
      objective="Demonstrate how packaging code with Docker prevents environmental runtime differences."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            What is environmental drift?
          </div>
          <p>
            Without Docker, code depends on packages and Python versions installed directly on the host computer. QA servers might lack dependencies, while production servers might run older OS/Python runtimes, causing runtime failures.
          </p>
          <p>
            Docker fixes this by bundling the application script, dependencies (FastAPI), and the runtime execution engine (Python 3.10) into a single immutable container image that runs identically on all environments.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col items-center justify-center relative min-h-[300px] font-sans">
        {/* Toggle switch between Without/With Docker */}
        <div className="mb-6 p-1.5 rounded-[6px] bg-[#111111] border border-[#2A2A2A] flex items-center gap-1 shadow-sm select-none z-10 font-sans">
          <button
            onClick={() => {
              setIsDockerized(false);
            }}
            disabled={isPlaying}
            className={cn(
              "px-4 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer",
              !isDockerized
                ? "bg-[#FAFAFA] text-[#000000] shadow-sm"
                : "text-[#A1A1AA] hover:text-[#FAFAFA] disabled:opacity-40"
            )}
          >
            Without Docker
          </button>
          <button
            onClick={() => {
              setIsDockerized(true);
            }}
            disabled={isPlaying}
            className={cn(
              "px-4 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer",
              isDockerized
                ? "bg-[#FAFAFA] text-[#000000] shadow-sm"
                : "text-[#A1A1AA] hover:text-[#FAFAFA] disabled:opacity-40"
            )}
          >
            With Docker
          </button>
        </div>

        {/* 3-Column sandbox simulation grid */}
        <div ref={containerRef} className="w-full max-w-3xl relative flex flex-col md:flex-row items-stretch justify-between gap-6 py-6 min-h-0 select-none">
          {/* Animated data packet */}
          <PacketPrimitive
            ref={packetRef}
            color={isDockerized ? "#FAFAFA" : "#A1A1AA"}
            size={12}
            className="top-[36px] left-[110px]"
          />

          {/* Background connection wire */}
          <div className="hidden md:block absolute top-[41px] left-[120px] right-[120px] h-0.5 border-t border-dashed border-[#232323] z-0 pointer-events-none" />

          {/* Node 1: Dev */}
          <NodePrimitive
            label="Dev Machine"
            type="laptop"
            status={devStatus}
            subtitle="macOS · Python 3.10"
            className="flex-1 w-full relative z-15"
          >
            <div className="font-mono text-[8px] text-[#A1A1AA] select-text leading-normal bg-[#090909] p-2.5 rounded-[6px] border border-[#232323] overflow-hidden h-[88px]">
              <div ref={devConsoleRef} className="whitespace-pre-line">Ready to run app...</div>
            </div>
          </NodePrimitive>

          {/* Node 2: QA */}
          <NodePrimitive
            label="QA Server"
            type="server"
            status={qaStatus}
            subtitle="Ubuntu · Python 3.10"
            className="flex-1 w-full relative z-15"
          >
            <div className="font-mono text-[8px] text-[#A1A1AA] select-text leading-normal bg-[#090909] p-2.5 rounded-[6px] border border-[#232323] overflow-hidden h-[88px]">
              <div ref={qaConsoleRef} className="whitespace-pre-line">Awaiting deployment...</div>
            </div>
          </NodePrimitive>

          {/* Node 3: Production */}
          <NodePrimitive
            label="Production Server"
            type="server"
            status={prodStatus}
            subtitle="RedHat · Python 3.8"
            className="flex-1 w-full relative z-15"
          >
            <div className="font-mono text-[8px] text-[#A1A1AA] select-text leading-normal bg-[#090909] p-2.5 rounded-[6px] border border-[#232323] overflow-hidden h-[88px]">
              <div ref={prodConsoleRef} className="whitespace-pre-line">Awaiting deployment...</div>
            </div>
          </NodePrimitive>
        </div>
      </div>
    </VisualCanvas>
  );
}
