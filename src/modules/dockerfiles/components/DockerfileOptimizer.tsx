"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle, RefreshCw, Layers, Sparkles, AlertTriangle, ShieldCheck, ArrowDown } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

interface MetricScore {
  size: number; // stars 1-5
  cache: number;
  speed: number;
  security: number;
  sizeMb: number;
}

export default function DockerfileOptimizer() {
  // Optimization states
  const [baseImage, setBaseImage] = useState<"node-full" | "node-alpine">("node-full");
  const [instructionOrder, setInstructionOrder] = useState<"bad" | "optimized">("bad");
  const [installCmd, setInstallCmd] = useState<"install" | "ci">("install");
  const [multiStage, setMultiStage] = useState<boolean>(false);

  const handleReset = () => {
    setBaseImage("node-full");
    setInstructionOrder("bad");
    setInstallCmd("install");
    setMultiStage(false);
  };

  // Calculate scores and sizes dynamically
  const calculateMetrics = (): MetricScore => {
    let sizeMb = 1350; // 1.35 GB
    let sizeStars = 1;
    let cacheStars = 1;
    let speedStars = 2;
    let securityStars = 1;

    // 1. Base Image impact
    if (baseImage === "node-alpine") {
      sizeMb -= 900; // alpine is much smaller
      sizeStars += 2;
      securityStars += 1; // alpine has smaller exploit surface
    }

    // 2. Order optimization impact
    if (instructionOrder === "optimized") {
      cacheStars += 3;
      speedStars += 1;
    }

    // 3. Command choice impact
    if (installCmd === "ci") {
      speedStars += 1;
      securityStars += 1; // npm ci locks packages securely
    }

    // 4. Multi-stage impact
    if (multiStage) {
      sizeMb = baseImage === "node-alpine" ? 82 : 240; // runtime container has no build tools!
      sizeStars = 5;
      securityStars = 5; // build tools and compiler caches stripped
      cacheStars = Math.min(5, cacheStars + 1);
    }

    // Caps
    sizeStars = Math.min(5, sizeStars);
    cacheStars = Math.min(5, cacheStars);
    speedStars = Math.min(5, speedStars);
    securityStars = Math.min(5, securityStars);

    return { size: sizeStars, cache: cacheStars, speed: speedStars, security: securityStars, sizeMb };
  };

  const metrics = calculateMetrics();

  const renderStars = (score: number) => {
    return (
      <div className="flex gap-0.5 text-xs select-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <span 
            key={i} 
            className={cn(
              "font-mono leading-none",
              i < score ? "text-white" : "text-zinc-800"
            )}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <VisualCanvas
      objective="Optimize the build configuration to minimize target image sizes and secure faster cache pipeline builds."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Dockerfile Optimization Lab
          </div>
          <p>
            Writing optimized Dockerfiles is an art. Changing base tags to `-alpine` slashes base image sizes. Ordering commands so package installs run before copying app code prevents rebuild cache invalidation.
          </p>
          <p>
            **Multi-stage builds** compile files in a temporary builder container, and only copy compiled output to the final slim image—completely stripping heavy build libraries and package tools from production.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Visualizer Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          <div className="w-full flex flex-col sm:flex-row gap-6 items-center justify-center relative z-10 flex-1">
            
            {/* 1. Dockerfile instructions list */}
            <div className="w-full sm:w-[240px] p-4 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 flex flex-col gap-2 shadow-inner">
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-550 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                Active Dockerfile Configuration
              </span>
              
              <div className="flex flex-col gap-1.5 font-mono text-[8.5px] text-zinc-400 select-text leading-relaxed">
                <div className="flex items-center gap-1">
                  <span className="text-zinc-550 font-bold">FROM</span>
                  <span className="text-white font-bold">{baseImage === "node-alpine" ? "node:22-alpine" : "node:22"}</span>
                </div>

                {instructionOrder === "bad" ? (
                  <>
                    <div className="p-1 rounded bg-red-950/5 border border-red-500/10 flex items-center justify-between">
                      <span><span className="text-zinc-550 font-bold">COPY</span> . .</span>
                      <button 
                        onClick={() => setInstructionOrder("optimized")}
                        className="text-[7.5px] px-1 py-0.5 rounded bg-zinc-850 hover:bg-zinc-700 text-zinc-300 border-0 cursor-pointer font-bold"
                        title="Move COPY package.json before copying source code to preserve caching"
                      >
                        Swap Down
                      </button>
                    </div>
                    <div>
                      <span className="text-zinc-550 font-bold">RUN</span> {installCmd === "ci" ? "npm ci" : "npm install"}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-1 rounded bg-green-950/5 border border-green-500/10 flex items-center justify-between">
                      <div>
                        <span className="text-zinc-550 font-bold">COPY</span> package.json .
                      </div>
                      <button 
                        onClick={() => setInstructionOrder("bad")}
                        className="text-[7.5px] px-1 py-0.5 rounded bg-zinc-850 hover:bg-zinc-700 text-zinc-300 border-0 cursor-pointer font-bold"
                      >
                        Undo Swap
                      </button>
                    </div>
                    <div>
                      <span className="text-zinc-550 font-bold">RUN</span> {installCmd === "ci" ? "npm ci" : "npm install"}
                    </div>
                    <div>
                      <span className="text-zinc-550 font-bold">COPY</span> . .
                    </div>
                  </>
                )}

                <div><span className="text-zinc-550 font-bold">CMD</span> ["npm", "start"]</div>

                {multiStage && (
                  <div className="border-t border-dashed border-zinc-800/60 pt-2 mt-1">
                    <span className="text-zinc-550 uppercase text-[7px] block font-bold mb-1">--- Stage 2: Runner ---</span>
                    <div><span className="text-zinc-550 font-bold">FROM</span> alpine:3.20</div>
                    <div><span className="text-zinc-550 font-bold">COPY --from=builder</span> /app/dist .</div>
                    <div><span className="text-zinc-550 font-bold">CMD</span> ["node", "server.js"]</div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Visualizing dynamic image capsule sizing */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-[160px] relative">
              <div 
                className="rounded-[20px] border border-zinc-800 bg-[#0d0d0e] flex flex-col items-center justify-center relative transition-all duration-700 shadow-inner"
                style={{ 
                  width: `${Math.max(100, (metrics.sizeMb / 1350) * 160)}px`,
                  height: `${Math.max(100, (metrics.sizeMb / 1350) * 165)}px`
                }}
              >
                <Layers className="w-8 h-8 text-zinc-300 animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider mt-2.5 block text-center font-mono">
                  {metrics.sizeMb >= 1000 ? `${(metrics.sizeMb / 1000).toFixed(2)} GB` : `${metrics.sizeMb} MB`}
                </span>
                <span className="text-[7px] text-zinc-550 uppercase tracking-widest font-bold mt-1 block">Compiled Image</span>
                
                {/* Multi stage banner */}
                {multiStage && (
                  <span className="absolute -top-2.5 bg-white text-black font-sans font-bold text-[7.5px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3 text-black" />
                    Multi-Stage Optimized
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* 3. Metric Scoreboard Cards */}
          <div className="w-full max-w-md mt-6 pt-4 border-t border-zinc-850/50 grid grid-cols-4 gap-2">
            <div className="p-2 rounded-[8px] bg-[#0d0d0e] border border-zinc-850 flex flex-col gap-0.5">
              <span className="text-zinc-550 uppercase text-[6.5px] tracking-wider font-bold">Image Size</span>
              {renderStars(metrics.sizeMb > 1000 ? 1 : metrics.sizeMb > 200 ? 3 : 5)}
            </div>
            <div className="p-2 rounded-[8px] bg-[#0d0d0e] border border-zinc-850 flex flex-col gap-0.5">
              <span className="text-zinc-550 uppercase text-[6.5px] tracking-wider font-bold">Cache Hit Rate</span>
              {renderStars(metrics.cache)}
            </div>
            <div className="p-2 rounded-[8px] bg-[#0d0d0e] border border-zinc-850 flex flex-col gap-0.5">
              <span className="text-zinc-550 uppercase text-[6.5px] tracking-wider font-bold">Build Speed</span>
              {renderStars(metrics.speed)}
            </div>
            <div className="p-2 rounded-[8px] bg-[#0d0d0e] border border-zinc-850 flex flex-col gap-0.5">
              <span className="text-zinc-550 uppercase text-[6.5px] tracking-wider font-bold">Security Probes</span>
              {renderStars(metrics.security)}
            </div>
          </div>

        </div>

        {/* Selected actions and details panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Optimizers Console
            </span>
            <h4 className="text-sm font-extrabold text-white">Optimize direct settings</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text">
              Rearrange the parameters below to trigger image shrinkage and speed boosts.
            </p>
          </div>

          <div className="flex flex-col gap-3 flex-1 justify-center select-none font-sans">
            
            {/* Toggle 1: Parent Image */}
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-zinc-300">Base Image OS:</span>
              <div className="flex rounded-[6px] border border-zinc-800 bg-[#0d0d0e] p-0.5 overflow-hidden">
                <button
                  onClick={() => setBaseImage("node-full")}
                  className={cn(
                    "px-2 py-1 rounded-[4px] border-0 text-[8px] font-bold transition-all cursor-pointer",
                    baseImage === "node-full" ? "bg-white text-black" : "bg-transparent text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  node:22 (Full)
                </button>
                <button
                  onClick={() => setBaseImage("node-alpine")}
                  className={cn(
                    "px-2 py-1 rounded-[4px] border-0 text-[8px] font-bold transition-all cursor-pointer",
                    baseImage === "node-alpine" ? "bg-white text-black" : "bg-transparent text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  node:alpine
                </button>
              </div>
            </div>

            {/* Toggle 2: npm Install command */}
            <div className="flex items-center justify-between text-[10px] font-bold border-t border-zinc-850/50 pt-3">
              <span className="text-zinc-300">Install Command:</span>
              <div className="flex rounded-[6px] border border-zinc-800 bg-[#0d0d0e] p-0.5 overflow-hidden">
                <button
                  onClick={() => setInstallCmd("install")}
                  className={cn(
                    "px-2 py-1 rounded-[4px] border-0 text-[8px] font-bold transition-all cursor-pointer",
                    installCmd === "install" ? "bg-white text-black" : "bg-transparent text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  npm install
                </button>
                <button
                  onClick={() => setInstallCmd("ci")}
                  className={cn(
                    "px-2 py-1 rounded-[4px] border-0 text-[8px] font-bold transition-all cursor-pointer",
                    installCmd === "ci" ? "bg-white text-black" : "bg-transparent text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  npm ci (Lock)
                </button>
              </div>
            </div>

            {/* Toggle 3: Multi stage builds */}
            <div className="flex items-center justify-between text-[10px] font-bold border-t border-zinc-850/50 pt-3">
              <div className="flex flex-col">
                <span className="text-zinc-300">Multi-Stage Build:</span>
                <span className="text-[7.5px] text-zinc-550 font-normal">Strips compilers on build finish.</span>
              </div>
              <button
                onClick={() => setMultiStage(!multiStage)}
                className={cn(
                  "px-3 py-1 rounded-[6px] text-[8.5px] font-bold border transition-all cursor-pointer",
                  multiStage 
                    ? "bg-white text-black border-transparent" 
                    : "bg-[#0d0d0e] border-zinc-850 text-zinc-550 hover:text-zinc-300"
                )}
              >
                {multiStage ? "ON" : "OFF"}
              </button>
            </div>

          </div>

          {/* Warnings and alerts context */}
          <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/25 text-[9px] text-zinc-450 leading-relaxed select-text font-sans">
            {metrics.sizeMb < 100 ? (
              <span className="text-green-400 flex items-start gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                <span>
                  **ULTRA OPTIMIZED!** Multi-stage builds and Alpine OS reduced your runtime image to only **82 MB** with zero bloat packages!
                </span>
              </span>
            ) : instructionOrder === "bad" ? (
              <span className="text-yellow-405 flex items-start gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-405 shrink-0 mt-0.5" />
                <span>
                  **CACHE WARNING**: Running `COPY . .` before installing dependencies triggers package downloads on EVERY code edit. Click "Swap Down" to optimize.
                </span>
              </span>
            ) : (
              <span>
                Try toggling Multi-Stage build. Stripping Node runtime compiler cache folders from production reduces security risk and slashes disk footprints.
              </span>
            )}
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Optimizer
          </button>

        </div>

      </div>
    </VisualCanvas>
  );
}
// Inline visual utility
function CheckCircle2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
