"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { AlertTriangle, FileText, HelpCircle, Eye, ArrowUp, RefreshCw } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

export default function CopyOnWrite() {
  const [animationState, setAnimationState] = useState<"idle" | "reading" | "copying" | "modified">("idle");
  const [terminalLog, setTerminalLog] = useState("Follow the steps below to observe how container reading and editing are handled.");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const cloneFileRef = useRef<HTMLDivElement>(null);
  const readPulseRef = useRef<HTMLDivElement>(null);
  const indexHtmlRef = useRef<HTMLDivElement>(null);
  const readOnlyAppJsRef = useRef<HTMLDivElement>(null);

  const [packetText, setPacketText] = useState<string>("REQ");
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  useAnimationControls(timeline);

  const handleReset = useCallback(() => {
    setAnimationState("idle");
    setTerminalLog("Follow the steps below to observe how container reading and editing are handled.");
    
    if (timeline) {
      timeline.pause().progress(0);
    }

    gsap.set(cloneFileRef.current, { scale: 0, opacity: 0, x: 0, y: 0 });
    gsap.set(readPulseRef.current, { scale: 0, opacity: 0, x: 0, y: 0 });
    gsap.set(readOnlyAppJsRef.current, { scale: 1, borderColor: "", opacity: 1 });
    gsap.set(indexHtmlRef.current, { scale: 1, borderColor: "", opacity: 1 });
    setPacketText("REQ");
  }, [timeline]);

  const handleRead = () => {
    setAnimationState("reading");
    setTerminalLog("container$ cat index.html\nAccessing container file storage...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setAnimationState("idle");
        setTerminalLog("container$ cat index.html\n<!DOCTYPE html><html>...</html>\n[SUCCESS] File read directly from underlying read-only image layer (zero copy overhead).");
      }
    });

    setTimeline(tl);

    tl.set(readPulseRef.current, { x: 0, y: 0, scale: 1, opacity: 1 })
      .to(readPulseRef.current, {
        x: -56,
        y: 120,
        duration: 0.7,
        ease: "power2.inOut",
        onStart: () => setPacketText("REQ")
      })
      .to(indexHtmlRef.current, {
        scale: 1.08,
        borderColor: "#FAFAFA",
        duration: 0.25,
        yoyo: true,
        repeat: 1
      })
      .to(readPulseRef.current, {
        duration: 0.1,
        onStart: () => setPacketText("OK")
      })
      .to(readPulseRef.current, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "power2.inOut"
      })
      .to(readPulseRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.2
      });
  };

  const handleWrite = () => {
    setAnimationState("copying");
    setTerminalLog("container$ echo 'console.log(v2)' >> app.js\nInitiating Copy-on-Write transaction...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setAnimationState("modified");
        setTerminalLog("container$ echo 'console.log(v2)' >> app.js\n[SUCCESS] File cloned to writable container layer.\nOriginal app.js in image layer is now shadowed.");
      }
    });

    setTimeline(tl);

    gsap.set(cloneFileRef.current, { x: 56, y: 120, scale: 0.85, opacity: 0 });

    tl.set(readPulseRef.current, { x: 0, y: 0, scale: 1, opacity: 1 })
      .to(readPulseRef.current, {
        x: 56,
        y: 120,
        duration: 0.7,
        ease: "power2.inOut",
        onStart: () => setPacketText("REQ")
      })
      .to(readOnlyAppJsRef.current, {
        scale: 1.08,
        borderColor: "#FAFAFA",
        duration: 0.25,
        yoyo: true,
        repeat: 1
      })
      .to(readPulseRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.15
      })
      .to(cloneFileRef.current, {
        opacity: 0.6,
        duration: 0.2
      })
      .to(cloneFileRef.current, {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 1.0,
        ease: "power2.inOut"
      })
      .to(cloneFileRef.current, {
        scale: 1.08,
        duration: 0.15,
        yoyo: true,
        repeat: 1
      });
  };

  return (
    <VisualCanvas
      objective="Understand how containers optimize host storage using the Copy-on-Write (CoW) allocation strategy."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            What is Copy-on-Write?
          </div>
          <p>
            When a container is started, Docker stacks a thin, writeable **Container Layer** on top of the read-only **Image Layers**. 
          </p>
          <p>
            When reading files, the container accesses the image layers directly. When you edit a file, Docker copies that file from the read-only layer up into the writeable layer first, making modifications there while preserving the clean baseline image.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Simulation Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px]">
          <h4 className="text-[10px] font-bold text-zinc-450 uppercase tracking-widest mb-6">
            Filesystem Layers Sandbox
          </h4>

          <div className="w-full flex-1 flex flex-col gap-8 justify-center max-w-sm relative py-6 min-h-[250px]">
            
            {/* 1. Writable Container Layer */}
            <div className="rounded-[12px] border border-dashed border-zinc-800 bg-[#0d0d0e] p-4 min-h-[80px] relative flex flex-col justify-center items-center">
              <span className="absolute top-2.5 left-3 text-[7px] uppercase tracking-wider font-bold text-zinc-450">
                Writable Container Layer (UpperDir)
              </span>

              {/* Spawned clone file block */}
              <div 
                ref={cloneFileRef}
                className="absolute w-28 py-2 rounded-[9px] border border-zinc-700 bg-zinc-850 text-white flex items-center justify-center gap-1.5 shadow-sm pointer-events-none opacity-0 scale-0 z-20"
              >
                <FileText className="w-3.5 h-3.5 text-zinc-300" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-zinc-200 font-mono">app.js</span>
                  <span className="text-[7px] text-[#FAFAFA] uppercase font-bold">Modified</span>
                </div>
              </div>

              {/* Centered request packet orb */}
              <div 
                ref={readPulseRef}
                className="absolute w-5 h-5 rounded-full bg-white text-black text-[6.5px] font-extrabold font-mono shadow-[0_0_8px_rgba(255,255,255,0.7)] opacity-0 scale-0 z-30 pointer-events-none flex items-center justify-center select-none"
              >
                {packetText}
              </div>

              {animationState === "idle" && (
                <span className="text-[9px] text-zinc-650 font-mono italic">Writable layer is empty</span>
              )}
              {animationState === "reading" && (
                <span className="text-[9px] text-zinc-500 font-mono italic animate-pulse">Reading index.html...</span>
              )}
              {animationState === "copying" && (
                <span className="text-[9px] text-zinc-450 font-mono italic animate-pulse">Cloning app.js to UpperDir...</span>
              )}
            </div>

            {/* Connection pathway marker */}
            <div className="absolute top-[80px] left-1/2 -translate-x-1/2 bottom-[125px] w-0.5 border-l border-dashed border-zinc-800/40 pointer-events-none z-0" />

            {/* 2. Read-Only Image Layers */}
            <div className="rounded-[12px] border border-zinc-800/40 bg-[#0d0d0e] p-4 min-h-[110px] relative flex flex-col justify-center shadow-sm">
              <span className="absolute top-2.5 left-3 text-[7px] uppercase tracking-wider font-bold text-zinc-500">
                Read-Only Image Layers (LowerDir)
              </span>

              <div className="flex gap-4 items-center justify-center mt-3">
                {/* index.html block */}
                <div 
                  ref={indexHtmlRef}
                  className="w-24 py-2.5 rounded-[9px] border border-zinc-850 bg-[#1a1a1e] flex flex-col items-center justify-center gap-0.5 z-10 relative transition-all duration-300"
                >
                  <FileText className="w-3.5 h-3.5 text-zinc-450" />
                  <span className="text-[9px] font-bold text-zinc-300 font-mono">index.html</span>
                  <span className="text-[7px] text-zinc-550 font-bold uppercase tracking-wider font-mono">Read-Only</span>
                </div>

                {/* app.js block */}
                <div 
                  ref={readOnlyAppJsRef}
                  className={cn(
                    "w-24 py-2.5 rounded-[9px] border flex flex-col items-center justify-center gap-0.5 z-10 transition-all duration-300 relative",
                    animationState === "modified" 
                      ? "bg-[#121214] border-zinc-900 text-zinc-650 opacity-30" 
                      : "bg-[#1a1a1e] border-zinc-850 text-zinc-400"
                  )}
                >
                  <FileText className="w-3.5 h-3.5 text-zinc-550" />
                  <span className="text-[9px] font-bold text-zinc-300 font-mono">app.js</span>
                  {animationState === "modified" ? (
                    <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Shadowed</span>
                  ) : (
                    <span className="text-[7px] text-zinc-550 font-bold uppercase tracking-wider font-mono">Read-Only</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sandbox controls sidebar (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Sandbox Controller
            </span>
            <h4 className="text-sm font-extrabold text-white">Filesystem Actions</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text">
              Follow the steps below to observe how container reading and editing are handled.
            </p>
          </div>

          {/* Interactive Steps Walkthrough */}
          <div className="p-3 rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col gap-2 font-sans select-text">
            <span className="text-[8.5px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
              Trace Walkthrough Steps:
            </span>
            <div className="flex flex-col gap-2.5">
              {/* Step 1 */}
              <div className="flex items-start gap-2.5 text-[10px]">
                <div className={cn(
                  "w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 font-mono text-[8px] mt-0.5 transition-all duration-300",
                  terminalLog.includes("zero copy")
                    ? "bg-white border-transparent text-black font-bold"
                    : "border-zinc-800 text-zinc-500"
                )}>
                  {terminalLog.includes("zero copy") ? "✓" : "1"}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className={cn(
                    "font-bold transition-all duration-300",
                    terminalLog.includes("zero copy") ? "text-zinc-500 line-through" : "text-zinc-200"
                  )}>
                    Step 1: Read index.html
                  </span>
                  <span className="text-[9px] text-zinc-500 leading-normal">
                    Learn how reading accesses the read-only layer directly with no extra copies.
                  </span>
                </div>
              </div>
              {/* Step 2 */}
              <div className="flex items-start gap-2.5 text-[10px]">
                <div className={cn(
                  "w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 font-mono text-[8px] mt-0.5 transition-all duration-300",
                  animationState === "modified"
                    ? "bg-white border-transparent text-black font-bold"
                    : "border-zinc-800 text-zinc-500"
                )}>
                  {animationState === "modified" ? "✓" : "2"}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className={cn(
                    "font-bold transition-all duration-300",
                    animationState === "modified" ? "text-zinc-500 line-through" : "text-zinc-200"
                  )}>
                    Step 2: Modify app.js
                  </span>
                  <span className="text-[9px] text-zinc-500 leading-normal">
                    Observe Copy-on-Write duplicate and modify the file inside UpperDir.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleRead}
              disabled={animationState === "reading" || animationState === "copying"}
              className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-[#1a1a1e] text-zinc-200 hover:bg-zinc-800 transition-all border border-zinc-800/30 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 inline mr-1 text-zinc-400" />
              Read index.html
            </button>
            <button
              onClick={handleWrite}
              disabled={animationState === "reading" || animationState === "copying" || animationState === "modified"}
              className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all border-0 disabled:opacity-40 cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5 inline mr-1 text-black" />
              Modify app.js
            </button>
          </div>

          {/* Terminal log */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] overflow-hidden flex flex-col min-h-[90px] shadow-sm select-text">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0">
              <span className="text-[8px] font-mono text-zinc-500 font-bold">trace output</span>
            </div>
            <div className="p-3 font-mono text-[9px] text-zinc-400 overflow-y-auto leading-relaxed flex-1">
              {terminalLog}
            </div>
          </div>

          {/* Context Concept Note */}
          <div className="p-3.5 rounded-[12px] border border-zinc-800/25 bg-[#0d0d0e] text-left flex items-start gap-2 flex-1 select-text">
            <AlertTriangle className="w-4 h-4 text-zinc-450 shrink-0 mt-0.5" />
            <div className="text-[9px] text-zinc-450 leading-relaxed font-normal">
              {animationState === "modified" 
                ? "Since app.js now exists in the writable container layer, any reads or edits by the running container app will access the writable copy. The original app.js inside the image remains secure and unchanged for other containers."
                : "Reads pass through container boundaries directly to the underlying read-only layers. Since no copies are made, multiple containers can share the exact same image layers simultaneously without memory duplication!"
              }
            </div>
          </div>

          {/* Reset button trigger */}
          {animationState !== "idle" && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Simulation
            </button>
          )}
        </div>

      </div>
    </VisualCanvas>
  );
}
