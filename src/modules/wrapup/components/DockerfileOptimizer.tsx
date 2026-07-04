"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { HelpCircle } from "lucide-react";

interface OptimizerState {
  useAlpine: boolean;
  combineLayers: boolean;
  cleanCache: boolean;
}

export default function DockerfileOptimizer() {
  const [state, setState] = useState<OptimizerState>({
    useAlpine: false,
    combineLayers: false,
    cleanCache: false
  });

  // Calculate metrics
  const getMetrics = () => {
    const baseSize = state.useAlpine ? 5.5 : 180.2;
    const packagesSize = state.useAlpine ? 24.5 : 98.4;
    const cacheSize = state.cleanCache ? 0.0 : (state.useAlpine ? 8.2 : 46.8);
    const packagesOverhead = state.combineLayers ? 0.0 : (state.useAlpine ? 12.0 : 35.0);
    const sourceSize = 12.4;

    const totalSize = baseSize + packagesSize + cacheSize + packagesOverhead + sourceSize;
    let layersCount = 3;
    
    if (state.combineLayers) {
      layersCount += 1;
    } else {
      layersCount += 3;
    }

    let grade = "F";
    let gradeColor = "text-red-500 border-red-500/20 bg-red-950/15";
    let ratingDesc = "Unoptimized: heavy base OS, bloated layers, and cached junk files.";

    if (state.useAlpine && state.combineLayers && state.cleanCache) {
      grade = "A";
      gradeColor = "text-zinc-100 border-zinc-700 bg-zinc-800/50";
      ratingDesc = "Excellent! Minimal Alpine OS base, combined dependencies, and no cache build bloat.";
    } else if (state.useAlpine && (state.combineLayers || state.cleanCache)) {
      grade = "B";
      gradeColor = "text-zinc-200 border-zinc-800 bg-zinc-900/40";
      ratingDesc = "Very Good: small Alpine base, but package layers could be consolidated further.";
    } else if (state.useAlpine) {
      grade = "C";
      gradeColor = "text-zinc-300 border-zinc-800 bg-zinc-900/20";
      ratingDesc = "Average: Alpine base OS saves space, but separate layers and cache are unoptimized.";
    } else if (state.combineLayers && state.cleanCache) {
      grade = "D";
      gradeColor = "text-zinc-400 border-zinc-800/10 bg-zinc-950/20";
      ratingDesc = "Below Average: efficient package commands, but still using a bloated Ubuntu base OS.";
    }

    return {
      size: totalSize.toFixed(1),
      layers: layersCount,
      grade,
      gradeColor,
      ratingDesc
    };
  };

  const metrics = getMetrics();

  const getDockerfileCode = () => {
    const baseLine = state.useAlpine 
      ? "FROM python:3.10-alpine" 
      : "FROM ubuntu:22.04";

    const envLine = state.useAlpine 
      ? "" 
      : "ENV DEBIAN_FRONTEND=noninteractive\n";

    let installInstructions = "";
    if (state.useAlpine) {
      if (state.combineLayers) {
        installInstructions = `RUN apk add --no-cache \\
    curl \\
    python3 \\
    py3-pip`;
      } else {
        installInstructions = `RUN apk update
RUN apk add curl
RUN apk add python3 py3-pip`;
      }
    } else {
      if (state.combineLayers && state.cleanCache) {
        installInstructions = `RUN apt-get update && apt-get install -y \\
    curl \\
    python3 \\
    python3-pip \\
    && rm -rf /var/lib/apt/lists/*`;
      } else if (state.combineLayers) {
        installInstructions = `RUN apt-get update && apt-get install -y \\
    curl \\
    python3 \\
    python3-pip`;
      } else if (state.cleanCache) {
        installInstructions = `RUN apt-get update
RUN apt-get install -y curl python3 python3-pip
RUN rm -rf /var/lib/apt/lists/*`;
      } else {
        installInstructions = `RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y python3 python3-pip`;
      }
    }

    return `${baseLine}
${envLine}WORKDIR /app

${installInstructions}

COPY . /app

CMD ["python3", "app.py"]`;
  };

  const codeString = getDockerfileCode();

  return (
    <VisualCanvas
      objective="Optimize Dockerfile configurations to reduce image size and consolidate layer stack footprint."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-400" />
            Dockerfile Optimization Tips
          </div>
          <p>
            1. **Select light base images**: Alpine Linux is only 5.5MB, whereas Ubuntu is over 180MB.
          </p>
          <p>
            2. **Consolidate commands**: Every `RUN` instruction creates a new filesystem layer. Combining command sequences using `&&` and backslashes reduces size and metadata layer count.
          </p>
          <p>
            3. **Clean temp caches**: Remove package manager download cache lists (like `/var/lib/apt/lists/*`) within the same `RUN` command to prevent temporary installer files from bloating read-only layers.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch gap-6 min-h-0 select-none font-sans">
        
        {/* Code Editor Column (Left) */}
        <div className="flex-1 flex flex-col rounded-[18px] border border-zinc-800/40 bg-[#121214] overflow-hidden relative shadow-sm min-h-[300px]">
          <div className="bg-[#1a1a1e] px-4 py-1.5 border-b border-zinc-800/30 flex items-center shrink-0 justify-between">
            <span className="text-[8px] font-mono text-zinc-500">Dockerfile</span>
          </div>

          <div className="flex-1 p-5 font-mono text-[10px] text-zinc-300 overflow-y-auto leading-relaxed bg-[#0d0d0e] custom-scrollbar select-text">
            <pre className="whitespace-pre">{codeString}</pre>
          </div>
        </div>

        {/* Metrics Grading Sidebar panel (Right) */}
        <div className="w-full md:w-80 flex flex-col gap-4 shrink-0">
          {/* Grade summary card */}
          <div className="p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex flex-col font-sans">
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
                  Image Score Rating
                </span>
                <span className="text-sm font-bold text-zinc-200 mt-1">
                  Optimization Grade
                </span>
              </div>

              {/* Glowing circular grade badge */}
              <div className={cn(
                "w-12 h-12 rounded-full border border-zinc-800/40 flex items-center justify-center font-bold text-xl tracking-tight transition-all duration-300 bg-[#0d0d0e] shadow-sm select-text",
                metrics.gradeColor
              )}>
                {metrics.grade}
              </div>
            </div>

            <p className="text-[10px] text-zinc-450 leading-relaxed font-normal select-text">
              {metrics.ratingDesc}
            </p>

            {/* Parameters metrics values grid */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/35 mt-2 select-text">
              <div className="p-3 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/30">
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">
                  Image Size
                </span>
                <span className="text-base font-bold text-zinc-200 block mt-1 font-mono">
                  {metrics.size} <span className="text-[10px] text-zinc-400 font-sans">MB</span>
                </span>
              </div>

              <div className="p-3 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/30">
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">
                  Layer Count
                </span>
                <span className="text-base font-bold text-zinc-200 block mt-1 font-mono">
                  {metrics.layers} <span className="text-[10px] text-zinc-400 font-sans">layers</span>
                </span>
              </div>
            </div>
          </div>

          {/* Optimizations controls list */}
          <div className="p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative overflow-hidden flex-1 shadow-sm select-none">
            <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Optimization Controls
            </h5>

            <div className="flex flex-col gap-4 mt-2">
              {/* Control 1: Alpine base */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-zinc-200">
                    Use Alpine Linux Base
                  </span>
                  <span className="text-[9px] text-zinc-500 leading-normal mt-0.5">
                    Replaces heavy Ubuntu OS (180MB) with Alpine (5.5MB).
                  </span>
                </div>
                <button
                  onClick={() => setState(prev => ({ ...prev, useAlpine: !prev.useAlpine }))}
                  className={cn(
                    "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    state.useAlpine ? "bg-white" : "bg-zinc-700/60"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-3 w-3 transform rounded-full shadow transition duration-200 ease-in-out",
                      state.useAlpine ? "translate-x-3 bg-black" : "translate-x-0 bg-white"
                    )}
                  />
                </button>
              </div>

              {/* Control 2: Combine RUNs */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-zinc-200">
                    Combine RUN Instructions
                  </span>
                  <span className="text-[9px] text-zinc-500 leading-normal mt-0.5">
                    Consolidates multiple RUN layers into a single image layer.
                  </span>
                </div>
                <button
                  onClick={() => setState(prev => ({ ...prev, combineLayers: !prev.combineLayers }))}
                  className={cn(
                    "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    state.combineLayers ? "bg-white" : "bg-zinc-700/60"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-3 w-3 transform rounded-full shadow transition duration-200 ease-in-out",
                      state.combineLayers ? "translate-x-3 bg-black" : "translate-x-0 bg-white"
                    )}
                  />
                </button>
              </div>

              {/* Control 3: Clean cache */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-zinc-200">
                    Clean Package Manager Cache
                  </span>
                  <span className="text-[9px] text-zinc-500 leading-normal mt-0.5">
                    Removes temporary downloader logs inside the installation layer.
                  </span>
                </div>
                <button
                  onClick={() => setState(prev => ({ ...prev, cleanCache: !prev.cleanCache }))}
                  className={cn(
                    "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    state.cleanCache ? "bg-white" : "bg-zinc-700/60"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-3 w-3 transform rounded-full shadow transition duration-200 ease-in-out",
                      state.cleanCache ? "translate-x-3 bg-black" : "translate-x-0 bg-white"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
