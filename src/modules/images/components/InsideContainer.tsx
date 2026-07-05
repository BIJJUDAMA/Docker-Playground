"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";
import { cn, formatMarkdownNode } from "@/lib/utils";
import { HelpCircle, Cpu, FileCode, Radio, ShieldAlert, Edit2, RotateCcw, ArrowRight, Layers, ArrowLeft, Variable } from "lucide-react";
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
    "config.json": { name: "config.json", status: "pristine", content: "{ \"debug\": false, \"port\": 80 }" }
  });
  
  const [containerBFiles, setContainerBFiles] = useState<Record<string, FileState>>({
    "server.js": { name: "server.js", status: "pristine", content: "const http = require('http');" },
    "config.json": { name: "config.json", status: "pristine", content: "{ \"debug\": false, \"port\": 80 }" }
  });

  const [activeTab, setActiveTab] = useState<"A" | "B">("A");
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const flyFileRef = useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  const { setPlaying, setProgress } = useAnimationStore();

  useAnimationControls(timeline);

  const handleReset = useCallback(() => {
    setContainerAFiles({
      "server.js": { name: "server.js", status: "pristine", content: "const http = require('http');" },
      "config.json": { name: "config.json", status: "pristine", content: "{ \"debug\": false, \"port\": 80 }" }
    });
    setContainerBFiles({
      "server.js": { name: "server.js", status: "pristine", content: "const http = require('http');" },
      "config.json": { name: "config.json", status: "pristine", content: "{ \"debug\": false, \"port\": 80 }" }
    });
    setIsAnimating(false);
    if (timeline) {
      timeline.pause().progress(0);
    }
    gsap.set(flyFileRef.current, { opacity: 0, scale: 0, x: 0, y: 0 });
  }, [timeline]);

  const handleModifyConfig = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const tl = gsap.timeline({
      onStart: () => {
        setPlaying(true);
      },
      onComplete: () => {
        setPlaying(false);
        setIsAnimating(false);
        if (activeTab === "A") {
          setContainerAFiles(prev => ({
            ...prev,
            "config.json": { ...prev["config.json"], status: "modified", content: "{ \"debug\": true, \"port\": 80 }" }
          }));
        } else {
          setContainerBFiles(prev => ({
            ...prev,
            "config.json": { ...prev["config.json"], status: "modified", content: "{ \"debug\": true, \"port\": 80 }" }
          }));
        }
        gsap.set(flyFileRef.current, { opacity: 0, scale: 0, x: 0, y: 0 });
      }
    });

    setTimeline(tl);

    // Initial position: center of base image (left card)
    // Destination: center of files section in container (middle/right card)
    gsap.set(flyFileRef.current, { x: -210, y: 50, scale: 0.8, opacity: 0 });

    tl.to(flyFileRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.3
    })
    .to(flyFileRef.current, {
      x: 100,
      y: 70,
      duration: 1.0,
      ease: "power2.inOut"
    })
    .to(flyFileRef.current, {
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

  const activeFiles = activeTab === "A" ? containerAFiles : containerBFiles;
  const isCurrentModified = activeFiles["config.json"].status === "modified";
  const isAnyModified = containerAFiles["config.json"].status === "modified" || containerBFiles["config.json"].status === "modified";

  return (
    <VisualCanvas
      objective="Inspect the runtime execution parameters, network ports, environment variables, and file isolation state inside running container instances."
      timeline={timeline}
      onStepBack={handleReset}
      zoomScale={1.05}
      fullscreenZoomScale={1.35}
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
            Toggling between Container A and B reveals how each container obtains its own virtual IP address, host port mapping, and sandboxed writable filesystem layer.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Sandbox Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[380px] overflow-hidden">
          
          <div className="w-full max-w-2xl flex flex-col lg:flex-row gap-6 relative items-stretch justify-center min-h-[290px]">
            
            {/* Flying Copy-on-Write indicator */}
            <div 
              ref={flyFileRef}
              className="absolute w-28 py-1.5 rounded-[8px] border border-zinc-700 bg-zinc-850 text-white font-mono text-[8px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-md pointer-events-none opacity-0 scale-0 z-20"
            >
              <FileCode className="w-3.5 h-3.5 text-zinc-350" />
              Copy-on-Write
            </div>

            {/* Left Column: Shared Template Image */}
            <div className="w-full lg:w-44 flex flex-col justify-center items-center gap-3 shrink-0">
              <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-zinc-550 text-center">
                Shared Image blueprint
              </span>
              
              <div className="w-full p-4 rounded-[12px] bg-[#16161a] border border-zinc-850 flex flex-col gap-3 shadow-md">
                <span className="text-[9px] font-bold text-white font-mono flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                  <Layers className="w-4 h-4 text-zinc-400" />
                  app-image:v1
                </span>
                
                <div className="flex flex-col gap-1.5 font-mono text-[8px] text-zinc-500">
                  <div className="p-2 rounded-[6px] bg-[#0d0d0e]/60 border border-zinc-900 flex justify-between items-center">
                    <span>server.js</span>
                    <span className="text-[6.5px] font-sans font-bold uppercase text-zinc-650">Locked</span>
                  </div>
                  <div className="p-2 rounded-[6px] bg-[#0d0d0e]/60 border border-zinc-900 flex justify-between items-center">
                    <span>config.json</span>
                    <span className="text-[6.5px] font-sans font-bold uppercase text-zinc-650">Locked</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Spacer Arrow */}
            <div className="hidden lg:flex items-center justify-center text-zinc-800 select-none">
              <ArrowRight className="w-5 h-5 animate-pulse" />
            </div>

            {/* Right/Center Column: Spacious Inspected Container Dashboard */}
            <div className="flex-1 p-5 rounded-[16px] bg-[#0d0d0e] border border-zinc-800 flex flex-col gap-4 shadow-2xl relative">
              
              {/* Dashboard Header */}
              <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    activeTab === "A" ? "bg-white animate-pulse" : "bg-white/80 animate-pulse"
                  )} />
                  <h4 className="text-xs font-bold text-white font-mono">
                    Container {activeTab} Specifications
                  </h4>
                </div>
                <div className="flex items-center gap-2 font-mono text-[8px] text-zinc-500">
                  <span>IP: {activeTab === "A" ? "172.17.0.2" : "172.17.0.3"}</span>
                  <span className="w-px h-3.5 bg-zinc-800" />
                  <span>Port: 80</span>
                </div>
              </div>

              {/* Specification Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* 1. CPU / Process list */}
                <div className="p-3 rounded-[10px] bg-[#121214] border border-zinc-850 flex flex-col gap-1.5">
                  <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                    Processes
                  </span>
                  <div className="font-mono text-[8px] text-zinc-450 flex flex-col gap-1">
                    <div className="flex justify-between border-b border-zinc-900 pb-1 text-zinc-550 font-bold">
                      <span>PID</span>
                      <span>CMD</span>
                    </div>
                    <div className="flex justify-between text-white font-bold mt-0.5">
                      <span>1</span>
                      <span>node server.js</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>14</span>
                      <span>sh</span>
                    </div>
                  </div>
                </div>

                {/* 2. Ports mapping */}
                <div className="p-3 rounded-[10px] bg-[#121214] border border-zinc-850 flex flex-col gap-1.5">
                  <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-550 flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-zinc-400" />
                    Network port
                  </span>
                  <div className="font-mono text-[8.5px] text-zinc-300 flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span className="text-zinc-550">Internal</span>
                      <span>80/TCP</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-900/60 pt-1 mt-0.5">
                      <span className="text-zinc-550">Host Map</span>
                      <span className="text-white font-bold">{activeTab === "A" ? "8081" : "8082"}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Environment */}
                <div className="p-3 rounded-[10px] bg-[#121214] border border-zinc-850 flex flex-col gap-1.5">
                  <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-550 flex items-center gap-1">
                    <Variable className="w-3.5 h-3.5 text-zinc-400" />
                    Variables
                  </span>
                  <div className="font-mono text-[8px] text-zinc-450 flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span className="text-zinc-550 font-bold">ENV</span>
                      <span>prod</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-900/60 pt-1 mt-0.5">
                      <span className="text-zinc-550 font-bold">NAME</span>
                      <span className="truncate max-w-[50px]">{activeTab === "A" ? "web-01" : "web-02"}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Writable layer Files List */}
              <div className="flex flex-col gap-2 mt-1">
                <span className="text-[7.5px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                  <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                  Inspected container Writable layer Files
                </span>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {Object.values(activeFiles).map((file) => {
                    const isModified = file.status === "modified";
                    return (
                      <div 
                        key={file.name}
                        className={cn(
                          "flex-1 p-3 rounded-[10px] border font-mono text-[9px] flex flex-col gap-1 transition-all duration-300 relative shadow-sm",
                          isModified 
                            ? "bg-white/5 border-white/10 text-white"
                            : "bg-[#121214]/60 border-zinc-850 text-zinc-450"
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-zinc-300">{file.name}</span>
                          <span className={cn(
                            "text-[6.5px] font-sans font-bold uppercase py-0.5 px-1.5 rounded-[4px] border",
                            isModified
                              ? "border-zinc-300 text-zinc-200"
                              : "border-transparent text-zinc-600"
                          )}>
                            {isModified ? "Writable Copy (CoW)" : "Shared Template"}
                          </span>
                        </div>
                        <span className="text-[7.5px] text-zinc-550 mt-1 select-text block overflow-x-auto truncate">{file.content}</span>
                      </div>
                    );
                  })}
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
              Inspect different container process environments and test file write isolation triggers.
            </p>
          </div>

          {/* Large container selection tabs */}
          <div className="flex flex-col gap-2">
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-500">
              Select Container to Inspect
            </span>
            <div className="flex gap-2">
              {(["A", "B"] as const).map((tab) => {
                const isModified = tab === "A" ? containerAFiles["config.json"].status === "modified" : containerBFiles["config.json"].status === "modified";
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 py-2.5 rounded-[9px] text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none",
                      activeTab === tab
                        ? "bg-white text-black border-transparent shadow-sm"
                        : "bg-[#1a1a1e] border-zinc-850 text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    Container {tab}
                    {isModified && (
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1 justify-center">
            <button
              onClick={handleModifyConfig}
              disabled={isCurrentModified || isAnimating}
              className="w-full py-2.5 rounded-[9px] text-[10px] font-bold bg-[#1a1a1e] border border-zinc-850 hover:border-zinc-700 text-white disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Modify config.json (Container {activeTab})
            </button>

            {/* Verification Alert Info */}
            <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/20 text-[9px] text-zinc-455 leading-relaxed select-text mt-2 flex flex-col gap-1.5">
              <ShieldAlert className="w-4 h-4 text-zinc-405" />
              {isCurrentModified ? (
                <span>
                  {formatMarkdownNode(`**Copy-on-Write Verified!** Modifying files inside **Container ${activeTab}** cloned it locally to its writable layer. Toggle inspection to the other container to verify it remains pristine.`)}
                </span>
              ) : (
                <span>
                  Modifying files writes a local copy to the active container's private UpperDir, leaving the underlying base image untouched.
                </span>
              )}
            </div>
          </div>

          {isAnyModified && (
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
