"use client";

import React, { useState } from "react";
import { cn, formatMarkdownNode } from "@/lib/utils";
import { HelpCircle, Cpu, FileCode, Variable, Radio, ShieldAlert, Edit2, RotateCcw } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

interface FileState {
  name: string;
  content: string;
  status: "pristine" | "modified";
}

export default function InsideContainer() {
  const [activeTab, setActiveTab] = useState<"A" | "B">("A");
  
  // Writable states of both containers independently
  const [containerAFiles, setContainerAFiles] = useState<Record<string, FileState>>({
    "config.json": { name: "config.json", content: "{\"debug\": false}", status: "pristine" },
    "server.js": { name: "server.js", content: "console.log('running...')", status: "pristine" }
  });

  const [containerBFiles, setContainerBFiles] = useState<Record<string, FileState>>({
    "config.json": { name: "config.json", content: "{\"debug\": false}", status: "pristine" },
    "server.js": { name: "server.js", content: "console.log('running...')", status: "pristine" }
  });

  const handleReset = () => {
    setContainerAFiles({
      "config.json": { name: "config.json", content: "{\"debug\": false}", status: "pristine" },
      "server.js": { name: "server.js", content: "console.log('running...')", status: "pristine" }
    });
    setContainerBFiles({
      "config.json": { name: "config.json", content: "{\"debug\": false}", status: "pristine" },
      "server.js": { name: "server.js", content: "console.log('running...')", status: "pristine" }
    });
  };

  const handleModifyConfig = () => {
    if (activeTab === "A") {
      setContainerAFiles(prev => ({
        ...prev,
        "config.json": { name: "config.json", content: "{\"debug\": true, \"env\": \"modified_A\"}", status: "modified" }
      }));
    } else {
      setContainerBFiles(prev => ({
        ...prev,
        "config.json": { name: "config.json", content: "{\"debug\": true, \"env\": \"modified_B\"}", status: "modified" }
      }));
    }
  };

  const currentFiles = activeTab === "A" ? containerAFiles : containerBFiles;
  const otherFiles = activeTab === "A" ? containerBFiles : containerAFiles;
  const isCurrentModified = currentFiles["config.json"].status === "modified";
  const isOtherModified = otherFiles["config.json"].status === "modified";

  return (
    <VisualCanvas
      objective="Inspect the runtime execution parameters, network ports, environment variables, and file isolation state inside running container instances."
      timeline={null}
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
            Try modifying `config.json` inside **Container A**. Then, click the tab to inspect **Container B**. Notice that B's files remain untouched—demonstrating absolute container write isolation.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Sandbox Canvas (Left) */}
        <div className="flex-1 flex flex-col items-stretch justify-start p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px]">
          
          {/* Container selector tabs */}
          <div className="flex gap-2 mb-4 shrink-0">
            {(["A", "B"] as const).map((tab) => {
              const isModified = tab === "A" ? containerAFiles["config.json"].status === "modified" : containerBFiles["config.json"].status === "modified";
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-3 py-1.5 rounded-[8px] text-[9.5px] font-bold font-sans border transition-all cursor-pointer flex items-center gap-1.5",
                    activeTab === tab
                      ? "bg-white text-black border-transparent shadow-sm"
                      : "bg-[#0d0d0e] border-zinc-850 text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <span>Container {tab}</span>
                  {isModified && (
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-250 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Runtime specifications dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-[220px]">
            
            {/* Col 1: Isolated runtime details */}
            <div className="flex flex-col gap-3">
              
              {/* Running Process */}
              <div className="p-3 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 flex flex-col gap-1.5 shadow-inner">
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-550 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" />
                  Isolated runtime processes
                </span>
                <div className="font-mono text-[9px] text-zinc-350 leading-relaxed bg-black/40 p-2 rounded-[6px] border border-zinc-900/60">
                  <div className="flex justify-between border-b border-zinc-900/60 pb-1 mb-1 font-bold text-zinc-500">
                    <span>PID</span>
                    <span>COMMAND</span>
                    <span>CPU</span>
                  </div>
                  <div className="flex justify-between text-white font-bold">
                    <span>1</span>
                    <span>node server.js</span>
                    <span className="animate-pulse">0.8%</span>
                  </div>
                </div>
              </div>

              {/* Port Bindings */}
              <div className="p-3 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 flex flex-col gap-1.5 shadow-inner">
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-550 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5" />
                  Virtual Port Mapping
                </span>
                <div className="font-mono text-[9px] text-zinc-300 flex justify-between items-center px-1">
                  <span className="text-zinc-550">Container Internal</span>
                  <span>Port 80 (TCP)</span>
                </div>
                <div className="font-mono text-[9px] text-zinc-300 flex justify-between items-center px-1 border-t border-zinc-850/40 pt-1.5">
                  <span className="text-zinc-550">Host Interface Mapping</span>
                  <span className="text-white font-bold">127.0.0.1:{activeTab === "A" ? "8081" : "8082"}</span>
                </div>
              </div>

              {/* Environment Variables */}
              <div className="p-3 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 flex flex-col gap-1.5 shadow-inner">
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-550 flex items-center gap-1">
                  <Variable className="w-3.5 h-3.5" />
                  Environment variables
                </span>
                <div className="font-mono text-[9px] text-zinc-350 flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-550 font-bold">NODE_ENV</span>
                    <span>production</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-850/30 pt-1">
                    <span className="text-zinc-550 font-bold">CONTAINER_NAME</span>
                    <span>{activeTab === "A" ? "web-app-01" : "web-app-02"}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Col 2: isolated file system */}
            <div className="p-4 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 flex flex-col gap-3 shadow-inner select-text">
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-550 flex items-center gap-1 select-none">
                <FileCode className="w-3.5 h-3.5" />
                Isolated Writable Layer Files
              </span>

              <div className="flex flex-col gap-2">
                {Object.values(currentFiles).map((file) => {
                  const isModified = file.status === "modified";
                  return (
                    <div 
                      key={file.name}
                      className={cn(
                        "p-2.5 rounded-[9px] border font-mono text-[9px] flex items-center justify-between transition-all duration-300",
                        isModified 
                          ? "bg-white/5 border-white/10 text-white"
                          : "bg-[#1a1a1e] border-transparent text-zinc-400"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold">{file.name}</span>
                        <span className="text-[7.5px] text-zinc-550 mt-0.5">{file.content}</span>
                      </div>
                      <span className={cn(
                        "text-[7px] font-sans font-bold uppercase py-0.5 px-1.5 rounded-[4px] border",
                        isModified
                          ? "border-zinc-300 text-zinc-200"
                          : "border-transparent text-zinc-600"
                      )}>
                        {isModified ? "Writable Copy" : "Read-Only Base"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {isCurrentModified && (
                <div className="p-2.5 rounded-[9px] bg-white/5 border border-white/10 text-[9px] text-zinc-350 leading-relaxed font-sans mt-auto animate-fadeIn select-text">
                  <span className="font-bold text-white block mb-0.5">Copy-on-Write triggered:</span>
                  {formatMarkdownNode(`\`config.json\` was duplicated from the immutable base image into **Container ${activeTab}'s Writable Layer** upon editing.`)}
                </div>
              )}
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
              Simulate process configuration updates inside the running container instances.
            </p>
          </div>

          <div className="flex flex-col gap-2 flex-1 justify-center">
            <button
              onClick={handleModifyConfig}
              disabled={isCurrentModified}
              className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5 text-black" />
              Modify config.json (Container {activeTab})
            </button>

            {/* Verification Alert Info */}
            <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/20 text-[9px] text-zinc-450 leading-relaxed select-text mt-2">
              <ShieldAlert className="w-4 h-4 text-zinc-405 mb-1.5" />
              {isCurrentModified ? (
                <span>
                  {formatMarkdownNode(`Check **Container ${activeTab === "A" ? "B" : "A"}**! Its \`config.json\` file is still pristine. This confirms filesystems are 100% sandboxed.`)}
                </span>
              ) : (
                <span>
                  Modifying files writes a local copy to the active container's private UpperDir, leaving the underlying base image untouched.
                </span>
              )}
            </div>
          </div>

          {(isCurrentModified || isOtherModified) && (
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
