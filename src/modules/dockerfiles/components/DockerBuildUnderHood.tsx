"use client";

import React, { useState } from "react";
import { cn, formatMarkdownNode } from "@/lib/utils";
import { HelpCircle, Terminal, Cpu, FileCheck, Layers, GitCommit, HardDrive, ShieldAlert, Sparkles } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

interface PipelineStage {
  id: string;
  name: string;
  desc: string;
  details: string;
  icon: React.ReactNode;
}

export default function DockerBuildUnderHood() {
  const [activeStageId, setActiveStageId] = useState<string>("parser");
  const [hasDockerignore, setHasDockerignore] = useState<boolean>(false);

  const PIPELINE_STAGES: PipelineStage[] = [
    {
      id: "parser",
      name: "Dockerfile Parser",
      desc: "Validates and parses instruction directives into standard command-line lexer tokens.",
      details: "Docker reads the Dockerfile top-to-bottom, verifying command legality (FROM, RUN, COPY, etc.) and converting directives into token sets for step-by-step executor execution.",
      icon: <FileCheck className="w-4 h-4" />
    },
    {
      id: "context",
      name: "Build Context",
      desc: hasDockerignore 
        ? "Excludes directories via .dockerignore, sending a tiny build package."
        : "Packages the entire root directory workspace folder to send to Daemon.",
      details: hasDockerignore
        ? "With .dockerignore active, huge node_modules, local logs, git history, and markdown test suites are excluded, reducing context transfer payload size from 240 MB to only 15 KB! Instantly accelerates builds."
        : "Without .dockerignore, all files in the current folder (including heavy directories, local caches, and temporary folders) are compressed and uploaded to the Docker Daemon, slowing build startup times.",
      icon: <Terminal className="w-4 h-4" />
    },
    {
      id: "cache",
      name: "Cache Check",
      desc: "Calculates file hashes to verify if steps match pre-compiled cached layers.",
      details: "For COPY steps, Docker computes hashes of local source files and compares them against cached layer signatures. If hashes match and the parent layer is unchanged, it reuses the layer instantly without recompilation.",
      icon: <Cpu className="w-4 h-4" />
    },
    {
      id: "filesystem",
      name: "Filesystem Execution",
      desc: "Spins up temporary containers, runs commands, and commits changes as layers.",
      details: "For instructions that modify files (like RUN npm install), Docker spins up a micro temporary container, executes the command, records directory additions, commits that snapshot delta as a new layer, and deletes the temporary container.",
      icon: <GitCommit className="w-4 h-4" />
    },
    {
      id: "manifest",
      name: "Image Manifest",
      desc: "Assembles layer reference hashes and appends environment configuration metadata.",
      details: "Once all layers are compiled, Docker packages them into a manifest JSON schema. This lists the exact sequential order of layer hashes, environment parameters, port specifications, and runtime starting commands.",
      icon: <Layers className="w-4 h-4" />
    },
    {
      id: "image",
      name: "Final Local Image",
      desc: "Tags and registers the immutable image inside local engine storage.",
      details: "The completed layers are registered under the local storage driver (overlay2). Docker tags this stack (e.g. app:v1) inside the local images list. The image is now fully ready to instantiate running container instances.",
      icon: <HardDrive className="w-4 h-4" />
    }
  ];

  const activeStage = PIPELINE_STAGES.find(s => s.id === activeStageId) || PIPELINE_STAGES[0];

  return (
    <VisualCanvas
      objective="Understand the internal execution engine: how Docker compiles token streams, handles context transfers, uses build containers, and outputs image manifests."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Under the Hood of Docker Build
          </div>
          <p>
            Docker build is not magic. It runs a parsing step, uploads a workspace folder (**Build Context**), calculates cache hashes, spins up temporary containers to execute operations, and structures references inside an **Image Manifest**.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Visual Pipeline (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          {/* Draggable/clickable pipeline slots */}
          <div className="w-full max-w-sm flex flex-col gap-2 relative z-10 py-4">
            
            {PIPELINE_STAGES.map((stage, idx) => {
              const isActive = activeStageId === stage.id;
              
              return (
                <div 
                  key={stage.id} 
                  onClick={() => setActiveStageId(stage.id)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  {/* Circle number index */}
                  <div className={cn(
                    "w-7 h-7 rounded-full border text-[9px] font-mono font-bold flex items-center justify-center transition-all duration-300",
                    isActive
                      ? "bg-white text-black border-transparent shadow-sm"
                      : "bg-[#0d0d0e] border-zinc-850 text-zinc-550 group-hover:border-zinc-700"
                  )}>
                    {idx + 1}
                  </div>

                  {/* Visual Node */}
                  <div className={cn(
                    "flex-1 p-2 rounded-[9px] border text-[9.5px] font-mono flex items-center gap-2 transition-all duration-300",
                    isActive
                      ? "bg-white/5 border-white/10 text-white font-bold pl-3.5"
                      : "bg-[#0d0d0e]/60 border-transparent text-zinc-400 group-hover:bg-[#121214]/40"
                  )}>
                    <span className={isActive ? "text-white" : "text-zinc-550"}>
                      {stage.icon}
                    </span>
                    <span>{stage.name}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Selected Stage Detail Inspector (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Internal Pipeline Inspector
            </span>
            <h4 className="text-base font-extrabold text-white flex items-center gap-1.5 font-sans">
              {activeStage.icon}
              {activeStage.name}
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-3 select-text font-sans">
              {activeStage.desc}
            </p>
          </div>

          {/* Special Context options if build context is selected */}
          {activeStageId === "context" && (
            <div className="p-3 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 flex flex-col gap-2 font-sans">
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                Context Configuration Options:
              </span>
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span>Enable .dockerignore:</span>
                <button
                  onClick={() => setHasDockerignore(!hasDockerignore)}
                  className={cn(
                    "px-2.5 py-1 rounded-[5px] text-[8px] font-bold border transition-all cursor-pointer",
                    hasDockerignore
                      ? "bg-white text-black border-transparent"
                      : "bg-transparent border-zinc-850 text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {hasDockerignore ? "ACTIVE" : "INACTIVE"}
                </button>
              </div>
              <div className="flex justify-between items-center text-[9px] border-t border-zinc-850/40 pt-2 font-semibold">
                <span className="text-zinc-550">Context Upload size:</span>
                <span className="text-white font-mono">{hasDockerignore ? "15 KB" : "240 MB"}</span>
              </div>
            </div>
          )}

          {/* Deep-dive details block */}
          <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/25 text-[9px] text-zinc-450 leading-relaxed flex-1 select-text font-sans">
            <span className="font-bold block mb-0.5 text-zinc-200">Execution Mechanics:</span>
            {activeStage.details}
          </div>

          {activeStageId === "context" && !hasDockerignore && (
            <div className="p-3 rounded-[9px] border border-red-500/10 bg-red-950/5 text-red-400 text-[8.5px] leading-normal flex items-start gap-1.5 animate-fadeIn select-text">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                {formatMarkdownNode("**Performance Warning**: Sending 240 MB build contexts to Daemon on every compile slows down execution. Turn on **.dockerignore** to drop heavy files!")}
              </span>
            </div>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
