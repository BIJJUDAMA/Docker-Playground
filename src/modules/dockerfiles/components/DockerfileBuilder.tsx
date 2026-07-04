"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { HelpCircle } from "lucide-react";

interface Instruction {
  cmd: string;
  arg: string;
  desc: string;
  layerName: string;
  layerType: "base" | "config" | "copy" | "install" | "metadata";
}

const DOCKERFILE_STEPS: Instruction[] = [
  {
    cmd: "ARG",
    arg: "NODE_VERSION=18-alpine",
    desc: "Defines build-time variables that users can pass at build-time using --build-arg. Unlike ENV variables, ARG variables are not available once the container image has finished building.",
    layerName: "Build ARG: NODE_VERSION",
    layerType: "config"
  },
  {
    cmd: "FROM",
    arg: "node:${NODE_VERSION}",
    desc: "Specifies the starting parent base image. Every valid Dockerfile must begin with FROM. It parses the build-time variable NODE_VERSION to resolve the final parent base image from a registry.",
    layerName: "Base OS: node:18-alpine",
    layerType: "base"
  },
  {
    cmd: "LABEL",
    arg: 'maintainer="admin@app.com" version="1.0"',
    desc: "Adds metadata key-value labels to the image. Perfect for documenting ownership, licenses, or building pipelines. It does not create new filesystem layers, only metadata additions.",
    layerName: "Metadata labels",
    layerType: "metadata"
  },
  {
    cmd: "ENV",
    arg: "NODE_ENV=production PORT=3000",
    desc: "Sets environment variables that persist both during build instructions and at runtime in the booted container process.",
    layerName: "Env: NODE_ENV, PORT",
    layerType: "config"
  },
  {
    cmd: "WORKDIR",
    arg: "/usr/src/app",
    desc: "Sets the active working directory inside the container's filesystem for subsequent commands (like RUN or COPY). If the directory doesn't exist, Docker creates it automatically.",
    layerName: "Working Directory: /usr/src/app",
    layerType: "config"
  },
  {
    cmd: "COPY",
    arg: "package*.json ./",
    desc: "Copies files or directories from the host machine into the container's filesystem. Copying only package list manifests first allows Docker to cache the subsequent dependency installation layers. If package.json hasn't changed, Docker reuses the cached layer, saving massive build time.",
    layerName: "Source: package manifests",
    layerType: "copy"
  },
  {
    cmd: "RUN",
    arg: "npm ci --only=production",
    desc: "Executes command scripts inside the container environment during compilation. Here, npm ci performs a clean install of production dependencies only.",
    layerName: "Deps: npm packages install",
    layerType: "install"
  },
  {
    cmd: "COPY",
    arg: ". .",
    desc: "Copies the remaining application source code files from the host workspace into the active working directory inside the container.",
    layerName: "Source: App codes",
    layerType: "copy"
  },
  {
    cmd: "USER",
    arg: "node",
    desc: "Changes the active user context for subsequent instructions and runtime processes. By default, containers run as root (uid 0), which poses security risks. Switching to a non-privileged user like node is a critical security best practice.",
    layerName: "User privilege: node",
    layerType: "metadata"
  },
  {
    cmd: "EXPOSE",
    arg: "3000",
    desc: "Documents the network ports that the container process intends to listen on at runtime. Note: EXPOSE serves as documentation; it does not actually open ports on the host (that requires port forwarding).",
    layerName: "Metadata: Port 3000",
    layerType: "metadata"
  },
  {
    cmd: "HEALTHCHECK",
    arg: "--interval=30s CMD curl -f http://localhost:3000/health || exit 1",
    desc: "Specifies a command line tool probe that runs at regular intervals inside the container to verify its health status. If the probe fails, the container status transitions to unhealthy.",
    layerName: "Health check probe",
    layerType: "metadata"
  },
  {
    cmd: "ENTRYPOINT",
    arg: '["node"]',
    desc: "Configures the container to run as an executable. ENTRYPOINT sets the primary binary process that is always executed. Unlike CMD, arguments passed to the container run command are appended to the ENTRYPOINT command.",
    layerName: "Executable process: node",
    layerType: "metadata"
  },
  {
    cmd: "CMD",
    arg: '["server.js"]',
    desc: "Defines the default arguments for the ENTRYPOINT. When the container runs, 'node server.js' is executed. If a user starts the container with overrides (e.g. docker run myimage test.js), it overrides the CMD arguments (running node test.js instead).",
    layerName: "Default arguments: server.js",
    layerType: "metadata"
  }
];

export default function DockerfileBuilder() {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const activeStep = DOCKERFILE_STEPS[activeStepIndex];

  return (
    <VisualCanvas
      objective="Understand the anatomy of a Dockerfile by tracing how standard instructions compose an immutable image layer stack."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            What is a Dockerfile?
          </div>
          <p>
            A **Dockerfile** is a text script containing consecutive instruction directives that Docker reads to compile and assemble an immutable container image process environment.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch gap-6 min-h-0 select-none font-sans">
        
        {/* Code Editor and Build stack column (Left) */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 items-stretch min-h-[300px]">
          
          {/* File Editor Pane */}
          <div className="flex-1 flex flex-col rounded-[18px] border border-zinc-800/40 bg-[#121214] overflow-hidden relative shadow-sm">
            <div className="bg-[#1a1a1e] px-4 py-1.5 border-b border-zinc-800/30 flex items-center shrink-0 justify-between">
              <span className="text-[8px] font-mono text-zinc-500 font-bold">Dockerfile</span>
            </div>

            <div className="flex-1 p-4 font-mono text-[9px] overflow-y-auto leading-relaxed bg-[#0d0d0e] custom-scrollbar">
              {DOCKERFILE_STEPS.map((step, idx) => {
                const isSelected = idx === activeStepIndex;
                const isPast = idx < activeStepIndex;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveStepIndex(idx)}
                    className={cn(
                      "px-2 py-0.5 rounded-[4px] cursor-pointer transition-colors flex gap-4 my-[1px]",
                      isSelected
                        ? "bg-zinc-800 text-white font-bold"
                        : isPast
                        ? "text-zinc-350 hover:bg-zinc-850"
                        : "text-zinc-600 hover:bg-zinc-850"
                    )}
                  >
                    <span className="w-20 uppercase tracking-wider text-zinc-500 font-bold shrink-0">
                      {step.cmd}
                    </span>
                    <span className="text-zinc-200 truncate">{step.arg}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compiled Layer Stack graphic */}
          <div className="w-full md:w-80 flex flex-col rounded-[18px] border border-zinc-800/40 bg-[#121214] overflow-hidden relative p-4 shadow-sm select-none shrink-0 justify-between">
            <span className="text-[8px] font-mono text-zinc-550 uppercase tracking-widest block mb-4 text-center">
              Compiled Image Layers
            </span>
            
            <div className="flex-1 flex gap-3 min-h-0">
              {/* Column 1: Config (ARG -> WORKDIR) */}
              <div className="flex-1 flex flex-col-reverse justify-end gap-1.5">
                <span className="text-[7px] text-zinc-550 font-bold uppercase tracking-wider text-center block mb-1">
                  1. Config
                </span>
                {DOCKERFILE_STEPS.slice(0, 5).map((step, idx) => {
                  const actualIdx = idx; // 0, 1, 2, 3, 4
                  const isActive = actualIdx === activeStepIndex;
                  const isCompiled = actualIdx <= activeStepIndex;
                  
                  return (
                    <div
                      key={actualIdx}
                      onClick={() => setActiveStepIndex(actualIdx)}
                      className={cn(
                        "p-1.5 rounded-[6px] border text-center transition-all duration-300 cursor-pointer flex flex-col justify-center min-h-[36px]",
                        isActive
                          ? "bg-white text-black border-white scale-[1.02] shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                          : isCompiled
                          ? "bg-[#0d0d0e] text-zinc-300 border-zinc-800"
                          : "bg-[#0d0d0e]/20 text-zinc-650 border-zinc-900 border-dashed opacity-40"
                      )}
                    >
                      <span className="text-[7.5px] font-bold tracking-wider font-sans uppercase">
                        {step.cmd} layer
                      </span>
                      {isCompiled && (
                        <span className="text-[6.5px] font-mono truncate max-w-[110px] opacity-80 mt-0.5 block leading-normal">
                          {step.layerName}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Column 2: Runtime (COPY -> CMD) */}
              <div className="flex-1 flex flex-col-reverse justify-end gap-1.5">
                <span className="text-[7px] text-zinc-550 font-bold uppercase tracking-wider text-center block mb-1">
                  2. Runtime
                </span>
                {DOCKERFILE_STEPS.slice(5).map((step, idx) => {
                  const actualIdx = 5 + idx; // 5 to 12
                  const isActive = actualIdx === activeStepIndex;
                  const isCompiled = actualIdx <= activeStepIndex;
                  
                  return (
                    <div
                      key={actualIdx}
                      onClick={() => setActiveStepIndex(actualIdx)}
                      className={cn(
                        "p-1.5 rounded-[6px] border text-center transition-all duration-300 cursor-pointer flex flex-col justify-center min-h-[36px]",
                        isActive
                          ? "bg-white text-black border-white scale-[1.02] shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                          : isCompiled
                          ? "bg-[#0d0d0e] text-zinc-300 border-zinc-800"
                          : "bg-[#0d0d0e]/20 text-zinc-650 border-zinc-900 border-dashed opacity-40"
                      )}
                    >
                      <span className="text-[7.5px] font-bold tracking-wider font-sans uppercase">
                        {step.cmd} layer
                      </span>
                      {isCompiled && (
                        <span className="text-[6.5px] font-mono truncate max-w-[110px] opacity-80 mt-0.5 block leading-normal">
                          {step.layerName}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Selected Directive Inspector panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Directive Anatomy
            </span>
            <h4 className="text-base font-extrabold text-white flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-xs">
                {activeStep.cmd}
              </span>
              <span className="text-[10px] font-mono font-normal text-zinc-450 truncate">
                {activeStep.arg}
              </span>
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-4 select-text">
              {activeStep.desc}
            </p>
          </div>

          <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/20 text-[10px] text-zinc-450 leading-relaxed select-text mt-auto">
            <span className="font-bold block mb-0.5 text-zinc-200 font-sans">Anatomy Note:</span>
            Every directive represents an instruction layer. Select each instruction in the code script to observe its role and build characteristics.
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
