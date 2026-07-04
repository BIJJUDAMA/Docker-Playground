"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { HelpCircle, Play, Pause, RotateCcw, ArrowRight, CheckCircle, FileText, Cpu, Layers, HardDrive } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

interface BuildInstruction {
  cmd: string;
  arg: string;
  desc: string;
  layerSize: string;
  layerFiles: string[];
  isCached: boolean;
  visualEffect: string;
}

const DOCKERFILE_INSTRUCTIONS: BuildInstruction[] = [
  {
    cmd: "FROM",
    arg: "node:22",
    desc: "Loads the Parent Node.js runtime base layer containing alpine Linux environment and core executable libraries.",
    layerSize: "115.4 MB",
    layerFiles: ["/bin/node", "/usr/local/bin/npm", "/lib/ld-musl-x86_64.so.1"],
    isCached: true,
    visualEffect: "base_layer"
  },
  {
    cmd: "WORKDIR",
    arg: "/app",
    desc: "Creates working folder path /app inside container namespaces and sets active context pointer directory.",
    layerSize: "0 B",
    layerFiles: ["/app/"],
    isCached: true,
    visualEffect: "workdir_dir"
  },
  {
    cmd: "COPY",
    arg: "package*.json .",
    desc: "Copies package manifest lists separate from code directories to preserve package installer caches on modifications.",
    layerSize: "820 B",
    layerFiles: ["/app/package.json", "/app/package-lock.json"],
    isCached: true,
    visualEffect: "manifest_copy"
  },
  {
    cmd: "RUN",
    arg: "npm install",
    desc: "Executes npm package installer compiling external dependencies down to local image storage directory.",
    layerSize: "142.8 MB",
    layerFiles: ["/app/node_modules/", "/app/node_modules/.bin/"],
    isCached: false,
    visualEffect: "npm_compile"
  },
  {
    cmd: "COPY",
    arg: ". .",
    desc: "Copies remaining local project code, modules, assets, and views inside the container active path directory.",
    layerSize: "24.2 KB",
    layerFiles: ["/app/server.js", "/app/utils/db.js", "/app/public/index.html"],
    isCached: false,
    visualEffect: "code_copy"
  },
  {
    cmd: "EXPOSE",
    arg: "3000",
    desc: "Documents the network container port that app process intends to bind on startup. Purely metadata.",
    layerSize: "0 B",
    layerFiles: ["Metadata: Ports mapping [3000]"],
    isCached: false,
    visualEffect: "expose_port"
  },
  {
    cmd: "CMD",
    arg: '["npm", "start"]',
    desc: "Registers default process boot entrypoint parameters configuration. Consumes zero space layers.",
    layerSize: "0 B",
    layerFiles: ["Metadata: ENTRYPOINT command"],
    isCached: false,
    visualEffect: "cmd_entry"
  }
];

export default function DockerfileBuilder() {
  const [activeStepIdx, setActiveStepIdx] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hoveredLayerIdx, setHoveredLayerIdx] = useState<number | null>(null);
  const [buildComplete, setBuildComplete] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string>("Ready to compile Dockerfile. Click 'Build' to start.");

  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  const containerBlockRef = useRef<HTMLDivElement>(null);
  const filesRef = useRef<HTMLDivElement>(null);
  const terminalLogRef = useRef<HTMLDivElement>(null);

  useAnimationControls(timeline);

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStepIdx(-1);
    setBuildComplete(false);
    setHoveredLayerIdx(null);
    setTerminalOutput("Ready to compile Dockerfile. Click 'Build' to start.");

    if (timeline) {
      timeline.pause().progress(0);
    }

    DOCKERFILE_INSTRUCTIONS.forEach((_, idx) => {
      gsap.set(`#builder-layer-${idx}`, { opacity: 0, y: -40, scale: 0.9 });
    });
    gsap.set("#base-image-node", { opacity: 0, scale: 0.8 });
    gsap.set("#workdir-folder-node", { opacity: 0, y: 15 });
    gsap.set("#files-cluster-node", { opacity: 0, scale: 0.7 });
    gsap.set("#npm-progress-node", { opacity: 0, width: "0%" });
    gsap.set("#ports-badge-node", { opacity: 0, scale: 0.5 });
    gsap.set("#cmd-badge-node", { opacity: 0, y: 10 });
  };

  const handleBuild = () => {
    setIsPlaying(true);
    setBuildComplete(false);
    setActiveStepIdx(0);
    setHoveredLayerIdx(null);

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsPlaying(false);
        setBuildComplete(true);
        setActiveStepIdx(DOCKERFILE_INSTRUCTIONS.length - 1);
        setTerminalOutput("Successfully built image locally! Mapped tag: app-server:latest");
        setHoveredLayerIdx(DOCKERFILE_INSTRUCTIONS.length - 1);
      }
    });

    setTimeline(tl);

    // Reset initial states
    DOCKERFILE_INSTRUCTIONS.forEach((_, idx) => {
      gsap.set(`#builder-layer-${idx}`, { opacity: 0, y: -40, scale: 0.9 });
    });
    gsap.set("#base-image-node", { opacity: 0, scale: 0.8 });
    gsap.set("#workdir-folder-node", { opacity: 0, y: 15 });
    gsap.set("#files-cluster-node", { opacity: 0, scale: 0.7 });
    gsap.set("#npm-progress-node", { opacity: 0, width: "0%" });
    gsap.set("#ports-badge-node", { opacity: 0, scale: 0.5 });
    gsap.set("#cmd-badge-node", { opacity: 0, y: 10 });

    // Step 0: FROM node:22
    tl.to({}, { duration: 0.2 })
      .call(() => {
        setActiveStepIdx(0);
        setTerminalOutput("Step 1/7 : FROM node:22\nFetching Alpine Node base image...");
      })
      .to("#base-image-node", { opacity: 1, scale: 1, duration: 0.5 })
      .to("#builder-layer-0", { opacity: 1, y: 0, scale: 1, duration: 0.4 }, "-=0.2")

      // Step 1: WORKDIR /app
      .to({}, { duration: 0.4 })
      .call(() => {
        setActiveStepIdx(1);
        setTerminalOutput("Step 2/7 : WORKDIR /app\nCreating directory paths and setting workspace context...");
      })
      .to("#workdir-folder-node", { opacity: 1, y: 0, duration: 0.4 })
      .to("#builder-layer-1", { opacity: 1, y: 0, scale: 1, duration: 0.4 }, "-=0.2")

      // Step 2: COPY package*.json .
      .to({}, { duration: 0.4 })
      .call(() => {
        setActiveStepIdx(2);
        setTerminalOutput("Step 3/7 : COPY package*.json .\nTransferring dependency catalogs to context directory...");
      })
      .to("#files-cluster-node", { opacity: 0.7, scale: 0.9, duration: 0.3 })
      .to("#builder-layer-2", { opacity: 1, y: 0, scale: 1, duration: 0.4 }, "-=0.2")

      // Step 3: RUN npm install
      .to({}, { duration: 0.4 })
      .call(() => {
        setActiveStepIdx(3);
        setTerminalOutput("Step 4/7 : RUN npm install\nInstalling packages. Compiling dependencies tree...");
      })
      .to("#npm-progress-node", { opacity: 1, width: "100%", duration: 1.2 })
      .to("#builder-layer-3", { opacity: 1, y: 0, scale: 1, duration: 0.4 }, "-=0.2")

      // Step 4: COPY . .
      .to({}, { duration: 0.4 })
      .call(() => {
        setActiveStepIdx(4);
        setTerminalOutput("Step 5/7 : COPY . .\nImporting application code and scripts...");
      })
      .to("#files-cluster-node", { opacity: 1, scale: 1.05, duration: 0.4 })
      .to("#builder-layer-4", { opacity: 1, y: 0, scale: 1, duration: 0.4 }, "-=0.2")

      // Step 5: EXPOSE 3000
      .to({}, { duration: 0.4 })
      .call(() => {
        setActiveStepIdx(5);
        setTerminalOutput("Step 6/7 : EXPOSE 3000\nConfiguring virtual port mappings...");
      })
      .to("#ports-badge-node", { opacity: 1, scale: 1, duration: 0.4 })
      .to("#builder-layer-5", { opacity: 1, y: 0, scale: 1, duration: 0.4 }, "-=0.2")

      // Step 6: CMD ["npm", "start"]
      .to({}, { duration: 0.4 })
      .call(() => {
        setActiveStepIdx(6);
        setTerminalOutput("Step 7/7 : CMD [\"npm\", \"start\"]\nAttaching execution startup CMD parameters...");
      })
      .to("#cmd-badge-node", { opacity: 1, y: 0, duration: 0.4 })
      .to("#builder-layer-6", { opacity: 1, y: 0, scale: 1, duration: 0.4 }, "-=0.2")

      .to({}, { duration: 0.5 });
  };

  const handleNext = () => {
    if (activeStepIdx < DOCKERFILE_INSTRUCTIONS.length - 1) {
      const target = activeStepIdx + 1;
      setActiveStepIdx(target);
      setHoveredLayerIdx(target);
      gsap.to(`#builder-layer-${target}`, { opacity: 1, y: 0, scale: 1, duration: 0.3 });
      
      // Update visual nodes corresponding to step
      if (target === 0) gsap.to("#base-image-node", { opacity: 1, scale: 1 });
      if (target === 1) gsap.to("#workdir-folder-node", { opacity: 1, y: 0 });
      if (target === 2) gsap.to("#files-cluster-node", { opacity: 0.7, scale: 0.9 });
      if (target === 3) gsap.to("#npm-progress-node", { opacity: 1, width: "100%" });
      if (target === 4) gsap.to("#files-cluster-node", { opacity: 1, scale: 1.05 });
      if (target === 5) gsap.to("#ports-badge-node", { opacity: 1, scale: 1 });
      if (target === 6) {
        gsap.to("#cmd-badge-node", { opacity: 1, y: 0 });
        setBuildComplete(true);
      }
      
      setTerminalOutput(`Step ${target + 1}/7 : ${DOCKERFILE_INSTRUCTIONS[target].cmd} ${DOCKERFILE_INSTRUCTIONS[target].arg}`);
    }
  };

  const handlePrev = () => {
    if (activeStepIdx > -1) {
      const target = activeStepIdx;
      gsap.to(`#builder-layer-${target}`, { opacity: 0, y: -40, scale: 0.9, duration: 0.3 });
      
      // Revert visual node states
      if (target === 0) gsap.to("#base-image-node", { opacity: 0, scale: 0.8 });
      if (target === 1) gsap.to("#workdir-folder-node", { opacity: 0, y: 15 });
      if (target === 2) gsap.to("#files-cluster-node", { opacity: 0, scale: 0.7 });
      if (target === 3) gsap.to("#npm-progress-node", { opacity: 0, width: "0%" });
      if (target === 4) gsap.to("#files-cluster-node", { opacity: 0.7, scale: 0.9 });
      if (target === 5) gsap.to("#ports-badge-node", { opacity: 0, scale: 0.5 });
      if (target === 6) {
        gsap.to("#cmd-badge-node", { opacity: 0, y: 10 });
        setBuildComplete(false);
      }

      const nextActive = activeStepIdx - 1;
      setActiveStepIdx(nextActive);
      setHoveredLayerIdx(nextActive >= 0 ? nextActive : null);
      setTerminalOutput(nextActive >= 0 
        ? `Step ${nextActive + 1}/7 : ${DOCKERFILE_INSTRUCTIONS[nextActive].cmd} ${DOCKERFILE_INSTRUCTIONS[nextActive].arg}`
        : "Ready to compile Dockerfile. Click 'Build' to start."
      );
    }
  };

  useEffect(() => {
    handleReset();
    return () => {
      if (timeline) timeline.kill();
    };
  }, []);

  const activeInspectIdx = hoveredLayerIdx !== null ? hoveredLayerIdx : (activeStepIdx >= 0 ? activeStepIdx : 0);
  const inspectLayer = DOCKERFILE_INSTRUCTIONS[activeInspectIdx];

  return (
    <VisualCanvas
      objective="Understand how Docker turns application source code into a layered, executable image blueprint."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Dockerfile Compilation Sequence
          </div>
          <p>
            A **Dockerfile** is a list of sequential instructions. When you build the image, Docker processes each line one by one, creating a new storage layer segment for actions that modify files, and appending metadata parameters for configuration lines.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Three-Panel Layout: 1. Dockerfile | 2. Center Animation Canvas | 3. Growing Image Layers */}
        <div className="flex-1 flex flex-col xl:flex-row gap-4 items-stretch justify-center p-4 border border-zinc-800/40 bg-[#121214] rounded-[18px] min-h-[350px] relative overflow-hidden">
          
          {/* Panel 1: Dockerfile (Left) */}
          <div className="flex-1 xl:flex-none xl:w-[220px] flex flex-col p-4 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 shadow-inner">
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-zinc-450" />
              Dockerfile Editor
            </span>
            <div className="flex flex-col gap-1.5 font-mono text-[9px] text-zinc-450 select-text leading-relaxed">
              {DOCKERFILE_INSTRUCTIONS.map((step, idx) => {
                const isActive = activeStepIdx === idx;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "p-1.5 rounded-[6px] border border-transparent transition-all duration-300",
                      isActive && "bg-white/5 border-white/10 text-white font-bold pl-2.5"
                    )}
                  >
                    <span className={cn(isActive ? "text-[#FAFAFA]" : "text-zinc-550", "font-bold mr-1")}>
                      {step.cmd}
                    </span>
                    {step.arg}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel 2: Animation Center Canvas (Middle) */}
          <div className="flex-1 flex flex-col p-4 bg-[#0d0d0e]/60 rounded-[12px] border border-zinc-850 relative justify-center items-center min-h-[220px]">
            
            {/* Visual simulation stage nodes */}
            <div className="w-full max-w-xs flex flex-col gap-4 items-center justify-center relative min-h-[160px]">
              
              {/* Node 1: Base Image Container */}
              <div 
                id="base-image-node" 
                className="w-full py-2.5 px-3 rounded-[9px] border border-zinc-800 bg-[#0d0d0e] text-[9px] font-mono text-zinc-350 flex items-center justify-between shadow-sm opacity-0 scale-90 transition-all duration-300"
              >
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-zinc-500" />
                  <span>node:22 Base Image</span>
                </div>
                <span className="text-[7.5px] uppercase tracking-wider text-zinc-550 font-bold">Base Layer</span>
              </div>

              {/* Node 2: Workspace Directory */}
              <div 
                id="workdir-folder-node"
                className="w-full p-2.5 rounded-[9px] border border-dashed border-zinc-800 bg-[#121214]/60 text-[9px] font-mono text-zinc-400 flex flex-col gap-1.5 opacity-0 translate-y-[15px] transition-all duration-300"
              >
                <span className="text-[7.5px] uppercase font-bold text-zinc-550 tracking-wider">Workspace: /app</span>
                
                {/* Node 3: Copy Files inside directories */}
                <div 
                  id="files-cluster-node" 
                  className="w-full py-1.5 px-2 rounded-[6px] border border-zinc-850 bg-[#0d0d0e]/80 text-[8px] flex items-center justify-between opacity-0 scale-95 transition-all duration-300"
                >
                  <span className="text-zinc-300">source files + manifests</span>
                  <span className="text-[7px] text-zinc-650 font-bold uppercase">COPY</span>
                </div>

                {/* Node 4: RUN package downloads */}
                <div className="w-full flex flex-col gap-1">
                  <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden relative">
                    <div 
                      id="npm-progress-node" 
                      className="absolute left-0 top-0 bottom-0 bg-white opacity-0"
                      style={{ width: "0%" }}
                    />
                  </div>
                  <span className="text-[7px] text-zinc-550 text-right uppercase tracking-wider font-sans block">npm installation dependencies</span>
                </div>
              </div>

              {/* Toggles & Badges: Ports & CMD config */}
              <div className="w-full flex gap-2">
                {/* Ports Badge */}
                <div 
                  id="ports-badge-node"
                  className="flex-1 py-1.5 px-2.5 rounded-[6px] border border-zinc-800 bg-[#0d0d0e]/60 text-[8px] font-mono text-zinc-350 flex items-center justify-between opacity-0 scale-90 transition-all duration-300"
                >
                  <span>Exposed Port</span>
                  <span className="font-bold text-white">3000</span>
                </div>
                {/* CMD Badge */}
                <div 
                  id="cmd-badge-node"
                  className="flex-1 py-1.5 px-2.5 rounded-[6px] border border-zinc-800 bg-[#0d0d0e]/60 text-[8px] font-mono text-zinc-350 flex items-center justify-between opacity-0 translate-y-[10px] transition-all duration-300"
                >
                  <span>Startup CMD</span>
                  <span className="font-bold text-white">npm start</span>
                </div>
              </div>

            </div>

          </div>

          {/* Panel 3: Growing Layer Stack (Right) */}
          <div className="flex-1 xl:flex-none xl:w-[220px] flex flex-col p-4 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 shadow-inner">
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-550 mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              Growing Image layers
            </span>
            <div className="flex flex-col-reverse gap-1 justify-end flex-1">
              {DOCKERFILE_INSTRUCTIONS.map((layer, idx) => {
                const isActive = activeStepIdx >= idx;
                const isInspected = activeInspectIdx === idx;
                return (
                  <div
                    key={idx}
                    id={`builder-layer-${idx}`}
                    onMouseEnter={() => buildComplete && setHoveredLayerIdx(idx)}
                    onMouseLeave={() => buildComplete && setHoveredLayerIdx(null)}
                    className={cn(
                      "w-full py-1.5 px-2.5 rounded-[8px] border text-[8px] font-mono flex items-center justify-between transition-all duration-300 cursor-default opacity-0 -translate-y-10 scale-90",
                      isInspected 
                        ? "bg-white border-transparent text-black font-bold shadow-[0_0_8px_rgba(255,255,255,0.2)]" 
                        : "bg-[#121214] border-zinc-850 text-zinc-400"
                    )}
                  >
                    <span>Layer {idx + 1} ({layer.cmd})</span>
                    <span className="text-[7px] opacity-70">{layer.layerSize}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Console & Inspector Details Panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm">
          
          {/* Section 1: Console Controls */}
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Builder Controls
            </span>
            <h4 className="text-sm font-extrabold text-white">Instruction compiler</h4>
            
            {/* Playback Button Group */}
            <div className="grid grid-cols-2 gap-2 mt-3 select-none">
              <button
                onClick={handleBuild}
                disabled={isPlaying}
                className="py-2 px-2.5 rounded-[8px] text-[10px] font-bold bg-white text-black hover:bg-zinc-200 transition-all border-0 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1"
              >
                <Play className="w-3 h-3 fill-black text-black" />
                Build Stack
              </button>
              <button
                onClick={handleReset}
                className="py-2 px-2.5 rounded-[8px] text-[10px] font-bold bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Stepper controls */}
            <div className="grid grid-cols-2 gap-2 mt-2 select-none">
              <button
                onClick={handlePrev}
                disabled={isPlaying || activeStepIdx <= -1}
                className="py-1.5 rounded-[6px] text-[9px] font-semibold bg-[#121214] border border-zinc-850 text-zinc-400 hover:text-zinc-200 transition-all disabled:opacity-30 cursor-pointer"
              >
                Previous Step
              </button>
              <button
                onClick={handleNext}
                disabled={isPlaying || activeStepIdx >= DOCKERFILE_INSTRUCTIONS.length - 1}
                className="py-1.5 rounded-[6px] text-[9px] font-semibold bg-[#121214] border border-zinc-850 text-zinc-400 hover:text-zinc-200 transition-all disabled:opacity-30 cursor-pointer"
              >
                Next Step
              </button>
            </div>
          </div>

          {/* Section 2: Terminal Logs output */}
          <div 
            ref={terminalLogRef}
            className="p-3 bg-[#0d0d0e] rounded-[10px] border border-zinc-850 font-mono text-[9px] text-zinc-400 min-h-[75px] select-text flex-1"
          >
            <span className="text-[7.5px] uppercase font-bold text-zinc-550 block mb-1">Terminal compilation output:</span>
            <code className="leading-normal block whitespace-pre-wrap flex flex-col gap-0.5">
              {terminalOutput.split("\n").map((line, i) => {
                let className = "text-zinc-400";
                if (line.toLowerCase().includes("successfully") || line.toLowerCase().includes("exporting") || line.toLowerCase().includes("finished") || line.toLowerCase().includes("cached") || line.includes("✓") || line.toLowerCase().includes("success")) {
                  className = "text-green-400 font-semibold";
                } else if (line.toLowerCase().includes("error") || line.toLowerCase().includes("failed") || line.toLowerCase().includes("fatal") || line.includes("⚠") || line.toLowerCase().includes("warning")) {
                  className = "text-red-400 font-semibold";
                } else if (line.includes("$") || line.includes("STEP") || line.includes("Building")) {
                  className = "text-zinc-550 font-mono";
                }
                return (
                  <div key={i} className={className}>
                    {line}
                  </div>
                );
              })}
            </code>
          </div>

          {/* Section 3: Layer Details Inspector */}
          <div className="p-4 bg-[#0d0d0e] rounded-[12px] border border-zinc-800/25 flex flex-col gap-2 font-sans select-text">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500">
              Layer {activeInspectIdx + 1} Inspection:
            </span>
            <h4 className="text-[10px] font-extrabold text-white">
              Instruction: <code className="text-zinc-200">{inspectLayer.cmd} {inspectLayer.arg}</code>
            </h4>
            <p className="text-[9.5px] text-zinc-450 leading-relaxed font-normal mt-0.5">
              {inspectLayer.desc}
            </p>
            <div className="flex flex-col gap-1 border-t border-zinc-850/50 pt-2 mt-1">
              <div className="flex justify-between items-center text-[8.5px] font-bold">
                <span className="text-zinc-500">Layer size impact:</span>
                <span className="text-zinc-300 font-mono">{inspectLayer.layerSize}</span>
              </div>
              <div className="flex justify-between items-center text-[8.5px] font-bold">
                <span className="text-zinc-500">Cache inheritance:</span>
                <span className="text-zinc-300 font-mono">{inspectLayer.isCached ? "Layer matches local cache" : "Rebuilt cache misses"}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </VisualCanvas>
  );
}
