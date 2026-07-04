"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn, formatMarkdownNode } from "@/lib/utils";
import { HelpCircle, RefreshCw, Layers, Clock, AlertTriangle, FileCode, CheckCircle2, ShieldAlert } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

interface CacheLayer {
  id: number;
  instruction: string;
  desc: string;
  status: "hit" | "rebuilt" | "skipped";
}

export default function LayerCachePlayground() {
  const [activeModification, setActiveModification] = useState<"none" | "package" | "readme" | "src" | "dockerfile">("none");
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [buildTime, setBuildTime] = useState<number>(4); // Default cached build time
  const [layers, setLayers] = useState<CacheLayer[]>([
    { id: 1, instruction: "FROM node:22", desc: "Base operating runtime layer", status: "hit" },
    { id: 2, instruction: "COPY package.json .", desc: "Import package dependency catalogs", status: "hit" },
    { id: 3, instruction: "RUN npm install", desc: "Download and compile node packages", status: "hit" },
    { id: 4, instruction: "COPY . .", desc: "Transfer remaining application files", status: "hit" },
    { id: 5, instruction: "CMD [\"npm\", \"start\"]", desc: "Attach startup CMD configuration", status: "hit" }
  ]);

  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);
  const buildBarRef = useRef<HTMLDivElement>(null);

  useAnimationControls(timeline);

  const calculateCacheStates = (mod: typeof activeModification) => {
    let nextTime = 48; // Full rebuild time
    const updatedLayers = layers.map((layer): CacheLayer => {
      switch (mod) {
        case "none":
          nextTime = 4;
          return { ...layer, status: "hit" };
        case "readme":
          // README.md is ignored in .dockerignore, so everything hits cache!
          nextTime = 2;
          return { ...layer, status: "hit" };
        case "src":
          // src changes code layer (id: 4) and CMD (id: 5)
          nextTime = 8;
          if (layer.id < 4) return { ...layer, status: "hit" };
          return { ...layer, status: "rebuilt" };
        case "package":
          // package changes package layer (id: 2) and all subsequent layers must rebuild!
          nextTime = 42;
          if (layer.id < 2) return { ...layer, status: "hit" };
          return { ...layer, status: "rebuilt" };
        case "dockerfile":
          // Dockerfile changes base image, everything invalidates
          nextTime = 52;
          return { ...layer, status: "rebuilt" };
      }
    });

    return { updatedLayers, nextTime };
  };

  const handleTriggerBuild = (mod: typeof activeModification) => {
    setIsBuilding(true);
    setActiveModification(mod);

    const { updatedLayers, nextTime } = calculateCacheStates(mod);

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsBuilding(false);
        setLayers(updatedLayers);
        setBuildTime(nextTime);
      }
    });

    setTimeline(tl);

    // Animate build progress bar
    gsap.set(buildBarRef.current, { width: "0%" });
    tl.to(buildBarRef.current, {
      width: "100%",
      duration: Math.max(0.6, nextTime / 15),
      ease: "power1.inOut"
    });

    // Staggered layers state update animation
    updatedLayers.forEach((layer) => {
      const elId = `#cache-layer-slab-${layer.id}`;
      tl.to(elId, {
        scale: 1.05,
        borderColor: layer.status === "hit" ? "#22c55e" : "#eab308",
        duration: 0.25,
        yoyo: true,
        repeat: 1
      }, "-=0.15");
    });
  };

  const handleReset = () => {
    setIsBuilding(false);
    setActiveModification("none");
    setBuildTime(4);
    setLayers(layers.map(l => ({ ...l, status: "hit" })));
    if (timeline) {
      timeline.pause().progress(0);
    }
    gsap.set(buildBarRef.current, { width: "0%" });
    layers.forEach(l => {
      gsap.set(`#cache-layer-slab-${l.id}`, { clearProps: "all" });
    });
  };

  return (
    <VisualCanvas
      objective="Experiment with cache invalidation rules to understand why the order of Dockerfile instructions matters for build speeds."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Layer Cache Mechanics
          </div>
          <p>
            Docker caches the results of build steps. During a rebuild, Docker checks if the step's files or commands changed. If a layer hits cache (Green), Docker reuses it instantly.
          </p>
          <p>
            **CRITICAL RULE**: If a layer is invalidated (Orange), all subsequent layers below/after it are automatically invalidated and must rebuild.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Sandbox Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          <div className="w-full flex flex-col sm:flex-row gap-6 items-center justify-center relative z-10 flex-1">
            
            {/* 1. Dockerfile Representation */}
            <div className="w-full sm:w-56 p-4 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 flex flex-col gap-2 shadow-inner">
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-550 flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5 text-zinc-500" />
                Active Dockerfile
              </span>
              <div className="flex flex-col gap-2 font-mono text-[9px] text-zinc-405 leading-relaxed">
                <div><span className="text-zinc-550 font-bold">FROM</span> node:22</div>
                <div className={cn("p-1 rounded transition-colors duration-300", activeModification === "package" && "bg-yellow-500/10 text-yellow-250 font-bold border border-yellow-500/20")}><span className="text-zinc-550 font-bold">COPY</span> package.json .</div>
                <div><span className="text-zinc-550 font-bold">RUN</span> npm install</div>
                <div className={cn("p-1 rounded transition-colors duration-300", activeModification === "src" && "bg-yellow-500/10 text-yellow-250 font-bold border border-yellow-500/20")}><span className="text-zinc-550 font-bold">COPY</span> . .</div>
                <div><span className="text-zinc-550 font-bold">CMD</span> ["npm", "start"]</div>
              </div>
            </div>

            {/* 2. Compiled Layer Statuses list */}
            <div className="flex-1 flex flex-col gap-1.5 justify-center max-w-sm w-full">
              {layers.map((layer) => {
                const isHit = layer.status === "hit";
                return (
                  <div
                    key={layer.id}
                    id={`cache-layer-slab-${layer.id}`}
                    className={cn(
                      "rounded-[9px] border p-2.5 flex items-center justify-between text-[9px] font-mono transition-all duration-300",
                      isHit 
                        ? "bg-[#0d0d0e]/60 border-zinc-850 text-zinc-400"
                        : "bg-yellow-950/5 border-yellow-500/20 text-yellow-200"
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-350">{layer.instruction}</span>
                      <span className="text-[7.5px] text-zinc-550 font-sans mt-0.5">{layer.desc}</span>
                    </div>
                    <span className={cn(
                      "text-[8px] font-sans font-bold uppercase py-0.5 px-2 rounded-[4px] border",
                      isHit 
                        ? "border-green-500/20 bg-green-950/10 text-green-400" 
                        : "border-yellow-500/20 bg-yellow-950/20 text-yellow-400"
                    )}>
                      {isHit ? "cache hit" : "rebuilt"}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

          {/* 3. Build time comparison bars at bottom */}
          <div className="w-full max-w-md mt-6 pt-4 border-t border-zinc-850/50 flex flex-col gap-2">
            <div className="flex justify-between items-center text-[9px] font-bold text-zinc-450 font-sans">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Rebuild execution speed:</span>
              <span className="font-mono text-white text-xs">{buildTime} s</span>
            </div>
            
            {/* Horizontal progress bar */}
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden relative">
              <div 
                ref={buildBarRef} 
                className="absolute left-0 top-0 bottom-0 bg-white"
                style={{ width: "0%" }}
              />
            </div>

            {/* Micro comparison labels */}
            <div className="grid grid-cols-2 gap-4 mt-1.5 text-[8.5px] font-mono text-zinc-550">
              <div>First Build: <span className="text-zinc-400 font-bold">48s</span></div>
              <div className="text-right">Cached Rebuild: <span className={cn("font-bold", buildTime > 10 ? "text-yellow-400" : "text-green-400")}>{buildTime}s</span></div>
            </div>
          </div>

        </div>

        {/* Selected actions and details panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Modifications Console
            </span>
            <h4 className="text-sm font-extrabold text-white">Trigger Cache Misses</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text">
              Click buttons to simulate code/config files updates on host and rebuild the image.
            </p>
          </div>

          {/* Button Grid triggers */}
          <div className="flex flex-col gap-2 flex-1 justify-center select-none">
            <button
              onClick={() => handleTriggerBuild("src")}
              disabled={isBuilding}
              className="w-full py-2.5 rounded-[9px] text-[10px] font-bold bg-[#1a1a1e] border border-zinc-850 hover:border-zinc-700 text-zinc-300 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Modify src/App.tsx
            </button>
            <button
              onClick={() => handleTriggerBuild("package")}
              disabled={isBuilding}
              className="w-full py-2.5 rounded-[9px] text-[10px] font-bold bg-[#1a1a1e] border border-zinc-850 hover:border-zinc-700 text-zinc-300 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Modify package.json
            </button>
            <button
              onClick={() => handleTriggerBuild("readme")}
              disabled={isBuilding}
              className="w-full py-2.5 rounded-[9px] text-[10px] font-bold bg-[#1a1a1e] border border-zinc-850 hover:border-zinc-700 text-zinc-300 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Modify README.md
            </button>
            <button
              onClick={() => handleTriggerBuild("dockerfile")}
              disabled={isBuilding}
              className="w-full py-2.5 rounded-[9px] text-[10px] font-bold bg-[#1a1a1e] border border-zinc-850 hover:border-zinc-700 text-zinc-300 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Modify Dockerfile parent image
            </button>
          </div>

          {/* Educational notice block */}
          <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/25 text-[9px] text-zinc-450 leading-relaxed select-text font-sans">
            {activeModification === "readme" ? (
              <span className="text-green-400 flex items-start gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <span>
                  {formatMarkdownNode("**CACHE HIT!** README.md matches exclusions inside `.dockerignore`. Docker completely ignores it during COPY, preventing cache invalidation!")}
                </span>
              </span>
            ) : activeModification === "package" ? (
              <span className="text-yellow-405 flex items-start gap-1">
                <ShieldAlert className="w-4 h-4 text-yellow-405 shrink-0 mt-0.5" />
                <span>
                  {formatMarkdownNode(`**CACHE BUSTED!** Modifying \`package.json\` invalidates step 3. Because \`npm install\` runs next, it must download and compile everything again, expanding build time to ${buildTime}s.`)}
                </span>
              </span>
            ) : activeModification === "src" ? (
              <span className="text-green-400 flex items-start gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <span>
                  {formatMarkdownNode(`**OPTIMIZED HIT!** Modifying source files invalidates only step 5. The base image and \`npm install\` packages are reused directly from cache, finishing in only ${buildTime}s!`)}
                </span>
              </span>
            ) : (
              <span className="flex items-start gap-1">
                <AlertTriangle className="w-4 h-4 text-zinc-450 shrink-0 mt-0.5" />
                <span>
                  Click modifications to test. Observe how isolating package copy logic caches heavy npm modules securely.
                </span>
              </span>
            )}
          </div>

          {activeModification !== "none" && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
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
