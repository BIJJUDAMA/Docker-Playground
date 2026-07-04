"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { HelpCircle, Sparkles, RefreshCw, Cpu, Layers, ArrowRight, ShieldCheck, Box, CheckCircle2, AlertTriangle } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

export default function MultiStageBuildVisualizer() {
  const [useMultiStage, setUseMultiStage] = useState<boolean>(false);
  const [buildStep, setBuildStep] = useState<"idle" | "compiling" | "copied" | "finished">("idle");
  const [terminalLog, setTerminalLog] = useState("Click 'Trigger Compile' to watch the build pipeline.");

  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const builderStageRef = useRef<HTMLDivElement>(null);
  const runtimeStageRef = useRef<HTMLDivElement>(null);
  const distFileRef = useRef<HTMLDivElement>(null);

  useAnimationControls(timeline);

  const handleReset = () => {
    setBuildStep("idle");
    setTerminalLog("Click 'Trigger Compile' to watch the build pipeline.");
    
    if (timeline) {
      timeline.pause().progress(0);
    }

    gsap.set(builderStageRef.current, { opacity: 1, scale: 1 });
    gsap.set(runtimeStageRef.current, { opacity: 0.2, scale: 0.95 });
    gsap.set(distFileRef.current, { opacity: 0, scale: 0, x: 0, y: 0 });
  };

  const handleCompile = () => {
    setBuildStep("compiling");
    setTerminalLog("builder$ go build -o app .\nCompiling source code inside SDK Builder container environment...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline();
    setTimeline(tl);

    if (useMultiStage) {
      // 1. Compile in builder
      tl.to(builderStageRef.current, {
        scale: 1.05,
        borderColor: "#FAFAFA",
        duration: 0.5,
        yoyo: true,
        repeat: 1
      })
      // 2. Reveal compiled file in builder (x: 0, y: 0)
      .to(distFileRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        onStart: () => {
          setBuildStep("copied");
          setTerminalLog("builder$ Compiled binary created at /src/app.\nInitiating copy to final stage...");
        }
      })
      // 3. Move file from builder (left) to runtime stage (right) (x: 180, y: 0)
      .to(distFileRef.current, {
        x: 170,
        duration: 1.2,
        ease: "power2.inOut"
      })
      // 4. Shrink/fade builder stage completely
      .to(builderStageRef.current, {
        opacity: 0.15,
        scale: 0.95,
        duration: 0.5
      })
      // 5. Expand and glow runtime stage
      .to(runtimeStageRef.current, {
        opacity: 1,
        scale: 1,
        borderColor: "#FAFAFA",
        duration: 0.5,
        onStart: () => {
          setBuildStep("finished");
          setTerminalLog("docker$ [SUCCESS] Copied compiled binary to lightweight Alpine layer. SDK Builder discarded.");
        }
      }, "-=0.3")
      .to(runtimeStageRef.current, {
        borderColor: "rgba(255, 255, 255, 0.1)",
        duration: 0.3
      });

    } else {
      // Single Stage: compiles and everything remains inside the same container
      tl.to(builderStageRef.current, {
        scale: 1.05,
        borderColor: "#FAFAFA",
        duration: 0.6,
        yoyo: true,
        repeat: 1
      })
      .to(distFileRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3
      })
      .call(() => {
        setBuildStep("finished");
        setTerminalLog("docker$ [SUCCESS] Build finished! Image size: 812 MB. Compiler tools remain packaged.");
      });
    }
  };

  useEffect(() => {
    handleReset();
  }, [useMultiStage]);

  return (
    <VisualCanvas
      objective="Compare Single-Stage vs Multi-Stage builds to understand how discarding compiler dependencies reduces production image sizes."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Multi-Stage Visualizer
          </div>
          <p>
            Compiling application code requires heavy SDK utilities (compilers, JDK modules, build tools). However, running the compiled binary in production only requires a minimal runtime env.
          </p>
          <p>
            **Multi-stage builds** solve this: you compile files in a temporary builder container, copy *only* the compiled binary into the final stage, and discard the heavy build environment.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Sandbox Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          {/* Strategy selection toggle */}
          <div className="flex gap-2 mb-6 shrink-0 relative z-10 select-none">
            <button
              onClick={() => setUseMultiStage(false)}
              disabled={buildStep !== "idle"}
              className={cn(
                "px-3 py-1.5 rounded-[8px] text-[9.5px] font-bold border transition-all cursor-pointer disabled:opacity-40",
                !useMultiStage
                  ? "bg-white text-black border-transparent"
                  : "bg-[#0d0d0e] border-zinc-850 text-zinc-450 hover:text-zinc-200"
              )}
            >
              Single-Stage (Bloated)
            </button>
            <button
              onClick={() => setUseMultiStage(true)}
              disabled={buildStep !== "idle"}
              className={cn(
                "px-3 py-1.5 rounded-[8px] text-[9.5px] font-bold border transition-all cursor-pointer disabled:opacity-40",
                useMultiStage
                  ? "bg-white text-black border-transparent"
                  : "bg-[#0d0d0e] border-zinc-850 text-zinc-450 hover:text-zinc-200"
              )}
            >
              Multi-Stage (Optimized)
            </button>
          </div>

          {/* Builder and Runtime Stages */}
          <div className="w-full max-w-sm flex items-center justify-between gap-6 relative min-h-[160px] py-4">
            
            {/* Stage 1: SDK Builder container */}
            <div 
              ref={builderStageRef}
              className="w-40 z-10 transition-all duration-500"
            >
              <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] p-3 text-center min-h-[120px] flex flex-col justify-between relative">
                <span className="text-[7.5px] uppercase font-bold text-zinc-550 block font-mono text-left">Stage 1: SDK Builder</span>
                
                <div className="flex flex-col gap-1 my-2">
                  <Cpu className="w-6 h-6 text-zinc-500 mx-auto animate-pulse" />
                  <span className="text-[8px] font-mono text-zinc-550 leading-relaxed">Golang SDK / compilers / npm caches (800MB)</span>
                </div>

                {/* Compiled binary file overlay */}
                <div 
                  ref={distFileRef}
                  className="absolute left-[38px] top-[48px] w-20 py-1 rounded-[6px] border border-zinc-750 bg-zinc-850 text-white font-mono text-[8px] flex items-center justify-center gap-1 shadow-md opacity-0 scale-0 z-20"
                >
                  <Box className="w-3 h-3 text-zinc-400" />
                  compiled-app
                </div>
              </div>
            </div>

            {/* Connecting copy arrow */}
            {useMultiStage && (
              <div className="hidden sm:flex flex-col items-center justify-center text-zinc-850 shrink-0 pointer-events-none select-none z-0">
                <span className="text-[6.5px] font-mono font-bold uppercase tracking-wider block mb-0.5">copy binary</span>
                <ArrowRight className="w-4 h-4 text-zinc-750" />
              </div>
            )}

            {/* Stage 2: Minimal Runtime container */}
            {useMultiStage && (
              <div 
                ref={runtimeStageRef}
                className="w-40 z-10 transition-all duration-500 opacity-20 scale-95"
              >
                <div className="rounded-[12px] border border-dashed border-zinc-800 bg-[#0d0d0e]/60 p-3 text-center min-h-[120px] flex flex-col justify-between relative">
                  <span className="text-[7.5px] uppercase font-bold text-zinc-550 block font-mono text-left">Stage 2: Slim Runtime</span>
                  
                  <div className="flex flex-col gap-1 my-2">
                    <Layers className="w-6 h-6 text-zinc-700 mx-auto" />
                    <span className="text-[8px] font-mono text-zinc-550 leading-relaxed">Alpine OS / runtimes only (12MB)</span>
                  </div>

                  <div className="w-full h-4 border border-transparent" />
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Selected actions and details panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Build Controls
            </span>
            <h4 className="text-sm font-extrabold text-white">Trigger compilation</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text font-sans">
              Watch what remains inside the final output bundle after compilation.
            </p>
          </div>

          <div className="flex flex-col gap-2 select-none">
            <button
              onClick={handleCompile}
              disabled={buildStep !== "idle"}
              className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5 font-sans"
            >
              Trigger Compile
            </button>
          </div>

          {/* Time and Size output logs */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col min-h-[90px] overflow-hidden select-text font-sans">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0">
              <span className="text-[7.5px] font-mono text-zinc-550 font-bold">Terminal logs:</span>
            </div>
            <div className="p-3 font-mono text-[9px] text-zinc-400 leading-relaxed flex-1 overflow-y-auto">
              {terminalLog}
            </div>
          </div>

          {/* Size readout cards */}
          {buildStep === "finished" && (
            <div className="p-3.5 rounded-[12px] border border-zinc-800/25 bg-[#0d0d0e] flex flex-col gap-2 animate-fadeIn select-text font-sans">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500">Output image metrics:</span>
              
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-zinc-550">Final Image Size:</span>
                <span className={cn("text-xs font-mono font-bold", useMultiStage ? "text-green-400" : "text-red-405")}>
                  {useMultiStage ? "17.5 MB" : "812.4 MB"}
                </span>
              </div>
              <div className="text-[9px] text-zinc-450 border-t border-zinc-850/50 pt-2 leading-relaxed">
                {useMultiStage ? (
                  <span className="text-green-405 flex items-start gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                    <span>SDK and libraries discarded! Production image size reduced by **97%**.</span>
                  </span>
                ) : (
                  <span className="text-red-405 flex items-start gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span>Compilers and dependencies remain packaged, bloating space and security surfaces.</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {buildStep !== "idle" && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Build
            </button>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
