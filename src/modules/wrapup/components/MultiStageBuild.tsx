"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle, Sparkles } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

export default function MultiStageBuild() {
  const [useMultiStage, setUseMultiStage] = useState<boolean>(false);

  const getDockerfile = () => {
    if (useMultiStage) {
      return `# Stage 1: Compile application
FROM golang:1.20-alpine AS builder
WORKDIR /src
COPY . .
RUN go build -o app

# Stage 2: Minimal final runtime
FROM alpine:3.18
WORKDIR /app
COPY --from=builder /src/app .
CMD ["./app"]`;
    }

    return `# Single Stage: Compile and run in same SDK
FROM golang:1.20-alpine
WORKDIR /app
COPY . .
RUN go build -o app
CMD ["./app"]`;
  };

  const currentSize = useMultiStage ? 17.5 : 812.4;
  const percentage = (currentSize / 812.4) * 100;

  return (
    <VisualCanvas
      objective="Compare Single-Stage vs Multi-Stage builds to understand how discarding compiler dependencies reduces production images footprint."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            What is a Multi-stage build?
          </div>
          <p>
            Compiling code requires heavy SDK compilers (Go compiler, JDK, node-gyp packages). However, running the compiled binary in production only requires minimal runtimes.
          </p>
          <p>
            **Multi-Stage builds** allow you to define a `builder` stage, compile the binary, and copy *only* the output file into a fresh, lightweight production container, discarding compiler bloat.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Dockerfile Editor (Left) */}
        <div className="flex-1 flex flex-col rounded-[18px] border border-zinc-800/40 bg-[#121214] overflow-hidden relative shadow-sm min-h-[300px]">
          <div className="bg-[#1a1a1e] px-4 py-2 border-b border-zinc-800/30 flex items-center justify-between shrink-0">
            <span className="text-[8px] font-mono text-zinc-500 font-bold">Dockerfile</span>
          </div>

          <div className="flex-1 p-5 font-mono text-[9.5px] leading-relaxed bg-[#0d0d0e] text-zinc-400 select-text overflow-y-auto custom-scrollbar">
            <pre className="whitespace-pre">{getDockerfile()}</pre>
          </div>
        </div>

        {/* Size Gauge visual comparison (Middle) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[300px]">
          <h4 className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest mb-4">
            Final Image Size
          </h4>

          <div className="w-full max-w-[180px] h-48 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 p-4 relative flex flex-col justify-end overflow-hidden shadow-inner">
            {/* Color fills representing size */}
            <div 
              className={cn(
                "absolute inset-x-0 bottom-0 transition-all duration-500 ease-in-out",
                useMultiStage ? "bg-white/5" : "bg-red-955/5"
              )}
              style={{ height: `${percentage}%` }}
            />

            <div className="z-10 text-center relative flex flex-col items-center justify-center h-full">
              <span className="text-2xl font-bold font-mono text-zinc-200">
                {currentSize} <span className="text-xs font-sans">MB</span>
              </span>
              <span className={cn(
                "text-[8.5px] font-mono font-bold uppercase tracking-wider mt-1 px-2.5 py-0.5 rounded-full border",
                useMultiStage 
                  ? "bg-white/10 border-white/20 text-white font-sans" 
                  : "bg-red-955/15 border-red-900/30 text-red-400 font-sans"
              )}>
                {useMultiStage ? "Multi-Stage (Optimized)" : "Single Stage (Bloated)"}
              </span>
            </div>
          </div>
        </div>

        {/* Sync controllers (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Build Controller
            </span>
            <h4 className="text-sm font-extrabold text-white font-sans">Select Build Strategy</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text font-sans">
              Toggle build stage pipelines to modify size allocations live.
            </p>
          </div>

          {/* Sync toggle */}
          <div className="p-3 rounded-[12px] border border-zinc-800/25 bg-[#0d0d0e] flex items-center justify-between select-none">
            <div className="flex flex-col pr-2">
              <span className="text-[11px] font-bold text-zinc-200">
                Use Multi-Stage builds
              </span>
              <span className="text-[8px] text-zinc-550 leading-normal mt-0.5">
                Splits builder stage compilation.
              </span>
            </div>
            
            <button
              onClick={() => setUseMultiStage(!useMultiStage)}
              className={cn(
                "relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                useMultiStage ? "bg-white" : "bg-zinc-800"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out",
                  useMultiStage ? "translate-x-4 bg-black" : "translate-x-0 bg-white"
                )}
              />
            </button>
          </div>

          {/* Warnings context */}
          <div className="p-3.5 rounded-[12px] border border-zinc-800/25 bg-[#0d0d0e] text-left flex items-start gap-2 flex-1 select-text">
            <Sparkles className="w-4 h-4 text-zinc-450 shrink-0 mt-0.5" />
            <div className="text-[9px] text-zinc-450 leading-relaxed font-normal">
              {useMultiStage 
                ? "Excellent! Discarding the golang:alpine builder OS image saves 795MB. The final image contains only alpine (5.5MB) + the compiled static binary (12MB)."
                : "The output image contains all build utilities, standard package caches, and compiler dependency binaries that are completely useless at runtime."
              }
            </div>
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
