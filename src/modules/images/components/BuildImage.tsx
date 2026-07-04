"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { FileCode, Play, RotateCcw, HelpCircle, Layers, ShieldCheck, CheckCircle } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

interface ImageLayerItem {
  id: number;
  instruction: string;
  files: string[];
  size: string;
  desc: string;
  isCached: boolean;
}

const BUILD_LAYERS: ImageLayerItem[] = [
  {
    id: 5,
    instruction: "CMD [\"node\", \"server.js\"]",
    files: ["Metadata: ENTRYPOINT / CMD config"],
    size: "0 B",
    desc: "Specifies the default command execution when a container instance spins up. Adds runtime metadata boundaries, consuming zero extra storage space.",
    isCached: false
  },
  {
    id: 4,
    instruction: "COPY . .",
    files: ["server.js", "utils/db.js", "public/index.html"],
    size: "24.2 KB",
    desc: "Copies local project application files and components into the image directories.",
    isCached: false
  },
  {
    id: 3,
    instruction: "RUN npm install",
    files: ["node_modules/", "node_modules/.bin/", "package-lock.json"],
    size: "142.8 MB",
    desc: "Runs npm install inside the container sandbox to download, compile, and bundle node packages.",
    isCached: true
  },
  {
    id: 2,
    instruction: "COPY package.json package.json",
    files: ["package.json"],
    size: "820 B",
    desc: "Copies package.json configuration file. Isolated in its own layer to optimize container rebuild speeds if dependencies don't change.",
    isCached: true
  },
  {
    id: 1,
    instruction: "FROM node:22-alpine",
    files: ["Alpine Linux OS", "Node.js v22 Runtime", "npm v10 Package Manager"],
    size: "115.4 MB",
    desc: "The secure base operating system and application runtime template layer.",
    isCached: true
  }
];

export default function BuildImage() {
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedLayerId, setSelectedLayerId] = useState<number | null>(null);
  const [isMerged, setIsMerged] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const layersWrapperRef = useRef<HTMLDivElement>(null);
  const rotatingImageRef = useRef<HTMLDivElement>(null);

  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  useAnimationControls(timeline);

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStep(-1);
    setSelectedLayerId(null);
    setIsMerged(false);

    if (timeline) {
      timeline.pause().progress(0);
    }

    // Reset styles
    BUILD_LAYERS.forEach((layer) => {
      gsap.set(`#layer-slab-${layer.id}`, { y: -80, opacity: 0, scale: 0.9 });
    });
    gsap.set(rotatingImageRef.current, { opacity: 0, scale: 0.7, rotateY: 0 });
    gsap.set(layersWrapperRef.current, { opacity: 1, scale: 1 });
  };

  const handleBuild = () => {
    setIsPlaying(true);
    setActiveStep(0);
    setSelectedLayerId(null);
    setIsMerged(false);

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsPlaying(false);
        setIsMerged(true);
        setSelectedLayerId(1); // Default select base layer on finish

        // Compress layers into the premium 3D image artifact
        gsap.timeline()
          .to(layersWrapperRef.current, {
            opacity: 0,
            scale: 0.8,
            duration: 0.4,
            ease: "power2.inOut"
          })
          .to(rotatingImageRef.current, {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.2)"
          }, "-=0.2")
          .to(rotatingImageRef.current, {
            rotateY: 360,
            duration: 20,
            repeat: -1,
            ease: "none"
          });
      }
    });

    setTimeline(tl);

    // Initial state: hide everything
    BUILD_LAYERS.forEach((layer) => {
      gsap.set(`#layer-slab-${layer.id}`, { y: -80, opacity: 0, scale: 0.9 });
    });
    gsap.set(rotatingImageRef.current, { opacity: 0, scale: 0.7, rotateY: 0 });
    gsap.set(layersWrapperRef.current, { opacity: 1, scale: 1 });

    // Step-by-step layer additions
    BUILD_LAYERS.slice().reverse().forEach((layer, idx) => {
      const isFirst = idx === 0;
      tl.to({}, { duration: 0.2 })
        .to({}, {
          duration: 0.1,
          onStart: () => setActiveStep(layer.id)
        })
        .to(`#layer-slab-${layer.id}`, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: "power3.out"
        }, isFirst ? "+=0.1" : "-=0.2");
    });

    // Add compression pause
    tl.to({}, { duration: 0.8 });
  };

  useEffect(() => {
    handleReset();
    return () => {
      if (timeline) timeline.kill();
    };
  }, []);

  const selectedLayer = BUILD_LAYERS.find(l => l.id === selectedLayerId);

  return (
    <VisualCanvas
      objective="Understand that a Docker Image is built step-by-step from immutable filesystem layers defined in a Dockerfile."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            What is a Docker Image?
          </div>
          <p>
            An **Image** is a passive blueprint or snapshot. It consists of multiple read-only layers. Each instruction in a Dockerfile creates a new layer on top of the previous one.
          </p>
          <p>
            When built, these layers are compressed together. The resulting image is completely **immutable (read-only)** and acts as the template to spawn container instances.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Sandbox Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          {/* Dockerfile & Visual Canvas columns */}
          <div className="w-full flex flex-col sm:flex-row gap-6 items-center justify-center relative z-10 flex-1">
            
            {/* 1. Dockerfile Code Panel */}
            <div className="w-full sm:w-56 p-4 rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col gap-2 shadow-inner">
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5 text-zinc-450" />
                Dockerfile Blueprint
              </span>
              
              <div className="flex flex-col gap-1.5 font-mono text-[9px] text-zinc-450 select-text leading-relaxed">
                {BUILD_LAYERS.slice().reverse().map((layer) => {
                  const isActive = activeStep === layer.id;
                  return (
                    <div 
                      key={layer.id}
                      className={cn(
                        "p-1.5 rounded-[6px] border border-transparent transition-all duration-300",
                        isActive && "bg-white/5 border-white/10 text-white font-bold pl-2.5",
                        isMerged && "opacity-60"
                      )}
                    >
                      <span className={cn(isActive ? "text-[#FAFAFA]" : "text-zinc-550", "font-bold mr-1")}>
                        {layer.instruction.split(" ")[0]}
                      </span>
                      {layer.instruction.split(" ").slice(1).join(" ")}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visualizer output area */}
            <div className="flex-1 min-h-[220px] relative flex items-center justify-center">
              
              {/* Stacked layers view (Visible during build) */}
              <div 
                ref={layersWrapperRef}
                className="flex flex-col-reverse gap-1 items-center justify-center w-52 transition-all duration-300"
              >
                {BUILD_LAYERS.map((layer) => {
                  const isSelected = selectedLayerId === layer.id;
                  return (
                    <div
                      key={layer.id}
                      id={`layer-slab-${layer.id}`}
                      onClick={() => isMerged && setSelectedLayerId(layer.id)}
                      className={cn(
                        "w-full py-2.5 px-3 rounded-[9px] border text-[8.5px] font-mono flex flex-col justify-center gap-0.5 transition-all duration-200",
                        isMerged ? "cursor-pointer" : "pointer-events-none",
                        isSelected
                          ? "bg-white text-black border-transparent shadow-[0_0_12px_rgba(255,255,255,0.2)] scale-[1.03]"
                          : "bg-[#0d0d0e]/60 border-zinc-850 text-zinc-400 hover:border-zinc-700"
                      )}
                    >
                      <div className="flex justify-between items-center font-bold">
                        <span className={isSelected ? "text-black" : "text-zinc-350"}>
                          Layer {layer.id}
                        </span>
                        <span className="text-[7.5px] opacity-75">{layer.size}</span>
                      </div>
                      <span className="text-[7.5px] opacity-60 overflow-hidden text-ellipsis whitespace-nowrap block">
                        {layer.instruction}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* 3D Finished Artifact View (Visible on build finish) */}
              <div 
                ref={rotatingImageRef}
                style={{ perspective: 1000 }}
                className="absolute inset-0 flex flex-col items-center justify-center opacity-0 scale-0 pointer-events-none transition-all duration-300"
              >
                {/* 3D Rotating Stack Layer Container */}
                <div 
                  className="w-32 h-36 relative flex flex-col justify-center items-center"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Layers className="w-12 h-12 text-white animate-pulse" />
                  <span className="text-[9.5px] font-bold text-white uppercase tracking-widest mt-3 block text-center font-sans">
                    app-image:v1
                  </span>
                  <span className="text-[7px] text-zinc-500 font-mono tracking-wider mt-1 block uppercase">
                    Immutable Image
                  </span>
                  <div className="absolute inset-0 rounded-[20px] border border-dashed border-zinc-800/60 pointer-events-none scale-105" />
                </div>
              </div>

            </div>

          </div>

          {/* Stepper info line */}
          {!isMerged && (
            <span className="text-[8.5px] text-zinc-550 font-mono mt-4 uppercase tracking-wider block text-center">
              {activeStep === -1 && "Press build to construct the snapshot image"}
              {activeStep > 0 && `Running instruction: ${BUILD_LAYERS.find(l => l.id === activeStep)?.instruction}`}
            </span>
          )}
          {isMerged && (
            <span className="text-[8.5px] text-white font-bold font-sans mt-4 flex items-center gap-1 animate-fadeIn">
              <CheckCircle className="w-3.5 h-3.5 text-zinc-350" />
              Build Complete! Click layers to inspect filesystem contents.
            </span>
          )}

        </div>

        {/* Selected Layer detail panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              {isMerged ? `Layer ${selectedLayerId} details` : "Action Console"}
            </span>
            <h4 className="text-sm font-extrabold text-white">
              {isMerged ? selectedLayer?.instruction : "Compile Blueprint"}
            </h4>
            <p className="text-xs text-zinc-450 leading-relaxed font-normal mt-2 select-text font-sans">
              {isMerged 
                ? selectedLayer?.desc
                : "Trigger Dockerfile execution commands to stack operations into a single immutable image blueprint artifact."
              }
            </p>
          </div>

          {isMerged ? (
            <div className="flex flex-col gap-3 flex-1 select-text">
              
              {/* Files in layer */}
              <div className="p-3 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 flex flex-col gap-2 min-h-[90px]">
                <span className="text-[8.5px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                  Files added in layer:
                </span>
                <div className="flex flex-col gap-1 font-mono text-[9px] text-zinc-350">
                  {selectedLayer?.files.map((file, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-zinc-600" />
                      <span>{file}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Immutable metadata properties grid */}
              <div className="grid grid-cols-2 gap-2 text-[9px] font-sans font-bold">
                <div className="p-2.5 rounded-[9px] bg-[#0d0d0e] border border-zinc-800/25 flex flex-col gap-0.5">
                  <span className="text-zinc-550 uppercase text-[7px] tracking-wider font-mono">Layer Size</span>
                  <span className="text-zinc-200">{selectedLayer?.size}</span>
                </div>
                <div className="p-2.5 rounded-[9px] bg-[#0d0d0e] border border-zinc-800/25 flex flex-col gap-0.5">
                  <span className="text-zinc-550 uppercase text-[7px] tracking-wider font-mono">Status</span>
                  <span className="text-zinc-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-450" />
                    Read-Only
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col gap-2 flex-1 justify-center">
              <button
                onClick={handleBuild}
                disabled={isPlaying}
                className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                Build Docker Image
              </button>
            </div>
          )}

          {isMerged && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
