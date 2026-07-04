"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";
import { cn, formatMarkdownNode } from "@/lib/utils";
import { HelpCircle, Cpu, FileCode, Variable, Radio, ShieldAlert, Edit2, RotateCcw, ArrowUpRight } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";
import { useAnimationStore } from "@/stores/animationStore";
import { useAnimationControls } from "@/hooks/useAnimationControls";

interface FileState {
  name: string;
  status: "pristine" | "modified";
  content: string;
}

export default function InsideContainer() {
  const [containerAFiles, setContainerAFiles] = useState<Record<string, FileState>>({
    "server.js": { name: "server.js", status: "pristine", content: "const http = require('http');" },
    "config.json": { name: "config.json", status: "pristine", content: "{ \"env\": \"prod\", \"debug\": false }" }
  });
  
  const [containerBFiles, setContainerBFiles] = useState<Record<string, FileState>>({
    "server.js": { name: "server.js", status: "pristine", content: "const http = require('http');" },
    "config.json": { name: "config.json", status: "pristine", content: "{ \"env\": \"prod\", \"debug\": false }" }
  });

  const [activeTab, setActiveTab] = useState<"A" | "B">("A");
  const [hoveredContainerId, setHoveredContainerId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const flyCapsuleRef = useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  const { setPlaying, setProgress } = useAnimationStore();

  useAnimationControls(timeline);

  const handleReset = useCallback(() => {
    setContainerAFiles({
      "server.js": { name: "server.js", status: "pristine", content: "const http = require('http');" },
      "config.json": { name: "config.json", status: "pristine", content: "{ \"env\": \"prod\", \"debug\": false }" }
    });
    setContainerBFiles({
      "server.js": { name: "server.js", status: "pristine", content: "const http = require('http');" },
      "config.json": { name: "config.json", status: "pristine", content: "{ \"env\": \"prod\", \"debug\": false }" }
    });
    setHoveredContainerId(null);
    if (timeline) {
      timeline.pause().progress(0);
    }
    gsap.set(flyCapsuleRef.current, { opacity: 0, scale: 0, x: 0, y: 0 });
  }, [timeline]);

  const handleModifyConfig = (containerId: "A" | "B") => {
    const tl = gsap.timeline({
      onStart: () => {
        setPlaying(true);
      },
      onComplete: () => {
        setPlaying(false);
        if (containerId === "A") {
          setContainerAFiles(prev => ({
            ...prev,
            "config.json": { ...prev["config.json"], status: "modified", content: "{ \"env\": \"prod\", \"debug\": true }" }
          }));
        } else {
          setContainerBFiles(prev => ({
            ...prev,
            "config.json": { ...prev["config.json"], status: "modified", content: "{ \"env\": \"prod\", \"debug\": true }" }
          }));
        }
        gsap.set(flyCapsuleRef.current, { opacity: 0, scale: 0, x: 0, y: 0 });
      }
    });

    setTimeline(tl);

    // Initial position: center of the Base Image card (bottom center)
    // Destination: Left box (Container A) or Right box (Container B)
    const xDest = containerId === "A" ? -120 : 120;
    const yDest = -140;

    gsap.set(flyCapsuleRef.current, { x: 0, y: 80, scale: 0.8, opacity: 0 });

    tl.to(flyCapsuleRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.3
    })
    .to(flyCapsuleRef.current, {
      x: xDest,
      y: yDest,
      duration: 1.0,
      ease: "power2.inOut"
    })
    .to(flyCapsuleRef.current, {
      opacity: 0,
      scale: 0.5,
      duration: 0.2
    });
  };

  useEffect(() => {
    handleReset();
    return () => {
      if (timeline) timeline.kill();
    };
  }, []);

  const isAModified = containerAFiles["config.json"].status === "modified";
  const isBModified = containerBFiles["config.json"].status === "modified";

  return (
    <VisualCanvas
      objective="Inspect the runtime execution parameters, network ports, environment variables, and file isolation state inside running container instances."
      timeline={timeline}
      onStepBack={handleReset}
      zoomScale={0.88}
      fullscreenZoomScale={1.25}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Inside a Running Container
          </div>
          <p>
            When active, a container isolates its running processes, ports, environment variables, and filesystem changes from both the host operating system and other containers.
          </p>
          <p>
            Try modifying **config.json** inside Container A or B. Observe how the Copy-on-Write mechanism duplicates the file from the shared base image into the container's private writable layer.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Sandbox Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[380px] overflow-hidden">
          
          <div className="w-full max-w-xl flex flex-col gap-8 relative items-center justify-center min-h-[300px]">
            
            {/* Spawning capsule element (flies between bottom and top) */}
            <div 
              ref={flyCapsuleRef}
              className="absolute w-28 py-1 rounded-[8px] border border-zinc-700 bg-zinc-850 text-white font-mono text-[8px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-md pointer-events-none opacity-0 scale-0 z-20"
            >
              <FileCode className="w-3.5 h-3.5 text-zinc-300 animate-pulse" />
              Copy-on-Write
            </div>

            {/* Containers row */}
            <div className="w-full flex justify-between gap-6 z-10">
              
              {/* Container A */}
              <div 
                onMouseEnter={() => setHoveredContainerId("A")}
                onMouseLeave={() => setHoveredContainerId(null)}
                className={cn(
                  "flex-1 p-4 rounded-[14px] bg-[#0d0d0e] border transition-all duration-300 flex flex-col gap-3 shadow-inner relative",
                  hoveredContainerId === "A" ? "border-zinc-500 bg-[#0d0d0e]" : "border-zinc-850 bg-[#0d0d0e]/60"
                )}
              >
                <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                  <span className="text-[9px] font-bold text-white font-mono flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-full", isAModified ? "bg-zinc-300 animate-pulse" : "bg-zinc-650")} />
                    Container A
                  </span>
                  <span className="text-[7.5px] text-zinc-550 font-mono">172.17.0.2</span>
                </div>

                {/* Process / Port Specs */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[8px] font-mono text-zinc-450">
                    <span>PID 1: node server.js</span>
                    <span className="text-zinc-500">Port 80:8081</span>
                  </div>
                  <div className="flex justify-between text-[8px] font-mono text-zinc-450 border-t border-zinc-900/60 pt-1">
                    <span>ENV: NAME=web-app-01</span>
                    <span className="text-zinc-500">CPU: 0.4%</span>
                  </div>
                </div>

                {/* File list */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[7px] font-bold uppercase tracking-wider text-zinc-550">Writable layer files</span>
                  {Object.values(containerAFiles).map((file) => {
                    const isModified = file.status === "modified";
                    return (
                      <div 
                        key={file.name}
                        className={cn(
                          "p-2 rounded-[8px] border font-mono text-[8px] flex items-center justify-between transition-all duration-300",
                          isModified 
                            ? "bg-white/5 border-white/10 text-white"
                            : "bg-[#1a1a1e]/40 border-transparent text-zinc-450"
                        )}
                      >
                        <div className="flex flex-col">
                          <span className="font-bold">{file.name}</span>
                          <span className="text-[7px] text-zinc-600 mt-0.5 truncate max-w-[130px]">{file.content}</span>
                        </div>
                        <span className={cn(
                          "text-[6.5px] font-sans font-bold uppercase py-0.5 px-1 rounded-[4px] border",
                          isModified
                            ? "border-zinc-300 text-zinc-200"
                            : "border-transparent text-zinc-700"
                        )}>
                          {isModified ? "Modified (Copy)" : "Immutable"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Container B */}
              <div 
                onMouseEnter={() => setHoveredContainerId("B")}
                onMouseLeave={() => setHoveredContainerId(null)}
                className={cn(
                  "flex-1 p-4 rounded-[14px] bg-[#0d0d0e] border transition-all duration-300 flex flex-col gap-3 shadow-inner relative",
                  hoveredContainerId === "B" ? "border-zinc-500 bg-[#0d0d0e]" : "border-zinc-850 bg-[#0d0d0e]/60"
                )}
              >
                <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
                  <span className="text-[9px] font-bold text-white font-mono flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-full", isBModified ? "bg-zinc-300 animate-pulse" : "bg-zinc-650")} />
                    Container B
                  </span>
                  <span className="text-[7.5px] text-zinc-550 font-mono">172.17.0.3</span>
                </div>

                {/* Process / Port Specs */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[8px] font-mono text-zinc-450">
                    <span>PID 1: node server.js</span>
                    <span className="text-zinc-500">Port 80:8082</span>
                  </div>
                  <div className="flex justify-between text-[8px] font-mono text-zinc-450 border-t border-zinc-900/60 pt-1">
                    <span>ENV: NAME=web-app-02</span>
                    <span className="text-zinc-500">CPU: 0.4%</span>
                  </div>
                </div>

                {/* File list */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[7px] font-bold uppercase tracking-wider text-zinc-550">Writable layer files</span>
                  {Object.values(containerBFiles).map((file) => {
                    const isModified = file.status === "modified";
                    return (
                      <div 
                        key={file.name}
                        className={cn(
                          "p-2 rounded-[8px] border font-mono text-[8px] flex items-center justify-between transition-all duration-300",
                          isModified 
                            ? "bg-white/5 border-white/10 text-white"
                            : "bg-[#1a1a1e]/40 border-transparent text-zinc-450"
                        )}
                      >
                        <div className="flex flex-col">
                          <span className="font-bold">{file.name}</span>
                          <span className="text-[7px] text-zinc-600 mt-0.5 truncate max-w-[130px]">{file.content}</span>
                        </div>
                        <span className={cn(
                          "text-[6.5px] font-sans font-bold uppercase py-0.5 px-1 rounded-[4px] border",
                          isModified
                            ? "border-zinc-300 text-zinc-200"
                            : "border-transparent text-zinc-700"
                        )}>
                          {isModified ? "Modified (Copy)" : "Immutable"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Shared Image card at the bottom */}
            <div className="w-[360px] p-3 rounded-[12px] bg-[#16161a] border border-zinc-800 flex flex-col gap-2 z-10 shadow-md">
              <div className="flex justify-between items-center border-b border-zinc-850 pb-1.5">
                <span className="text-[8px] font-bold font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  Base Image Template (app-image:v1)
                </span>
                <span className="text-[7px] text-zinc-500 font-mono">Read-Only Layers</span>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 p-1.5 rounded-[6px] bg-[#0d0d0e]/40 border border-zinc-900 flex justify-between items-center text-[7.5px] font-mono text-zinc-500">
                  <span>server.js</span>
                  <span className="text-[6.5px] uppercase font-sans font-bold text-zinc-600">Locked</span>
                </div>
                <div className="flex-1 p-1.5 rounded-[6px] bg-[#0d0d0e]/40 border border-zinc-900 flex justify-between items-center text-[7.5px] font-mono text-zinc-500">
                  <span>config.json</span>
                  <span className="text-[6.5px] uppercase font-sans font-bold text-zinc-600">Locked</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Action Panel sidebar (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm font-sans animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Sandbox Console
            </span>
            <h4 className="text-sm font-extrabold text-white">Isolation Controls</h4>
            <p className="text-xs text-zinc-405 leading-relaxed font-normal mt-2 select-text">
              Simulate process configuration updates inside the running container instances.
            </p>
          </div>

          <div className="flex flex-col gap-2 flex-1 justify-center">
            <button
              onClick={() => handleModifyConfig("A")}
              disabled={isAModified}
              className="w-full py-2 rounded-[9px] text-[10px] font-bold bg-[#1a1a1e] border border-zinc-850 hover:border-zinc-700 text-white disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Modify config.json (Container A)
            </button>
            <button
              onClick={() => handleModifyConfig("B")}
              disabled={isBModified}
              className="w-full py-2 rounded-[9px] text-[10px] font-bold bg-[#1a1a1e] border border-zinc-850 hover:border-zinc-700 text-white disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Modify config.json (Container B)
            </button>

            {/* Verification Alert Info */}
            <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/20 text-[9px] text-zinc-455 leading-relaxed select-text mt-2 flex flex-col gap-1.5">
              <ShieldAlert className="w-4 h-4 text-zinc-405" />
              {(isAModified || isBModified) ? (
                <span>
                  {formatMarkdownNode(`**Copy-on-Write Verified!** Modifying files inside one container clones them locally to its writable layer, leaving both the original **app-image:v1** blueprint and other container instances completely untouched.`)}
                </span>
              ) : (
                <span>
                  Modifying files writes a local copy to the active container's private UpperDir, leaving the underlying base image untouched.
                </span>
              )}
            </div>
          </div>

          {(isAModified || isBModified) && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Simulation
            </button>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
