"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { Folder, FileText, ArrowRight, RefreshCw, HelpCircle, AlertCircle, Edit3, Trash2, Plus } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

interface FileItem {
  name: string;
  status: "normal" | "modified" | "whiteout" | "added";
  desc: string;
}

export default function OverlayDriver() {
  const [activeAction, setActiveAction] = useState<"idle" | "write" | "modify" | "delete">("idle");
  const [terminalLog, setTerminalLog] = useState("Perform directory filesystem tasks to trace how overlay2 maps paths.");

  const [upperDirFiles, setUpperDirFiles] = useState<FileItem[]>([]);
  const [lowerDirFiles] = useState<FileItem[]>([
    { name: "config.json", status: "normal", desc: "Base config metadata files" },
    { name: "server.py", status: "normal", desc: "Production application runner" }
  ]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  useAnimationControls(timeline);

  const handleReset = useCallback(() => {
    setActiveAction("idle");
    setUpperDirFiles([]);
    setTerminalLog("Perform directory filesystem tasks to trace how overlay2 maps paths.");
    if (timeline) {
      timeline.pause().progress(0);
    }
  }, [timeline]);

  const handleWriteLogs = () => {
    setActiveAction("write");
    setTerminalLog("container$ touch logs.txt\nCreating a new log file in running container...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setUpperDirFiles((prev) => [...prev.filter(f => f.name !== "logs.txt"), { name: "logs.txt", status: "added", desc: "Active system logging output" }]);
        setTerminalLog("container$ touch logs.txt\n[SUCCESS] New file created in Writable Container Layer (UpperDir). Immediate visibility inside MergedDir view.");
      }
    });
    setTimeline(tl);
    tl.to({}, { duration: 0.8 });
  };

  const handleModifyServer = () => {
    setActiveAction("modify");
    setTerminalLog("container$ vi server.py\nModifying application script runner...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setUpperDirFiles((prev) => [...prev.filter(f => f.name !== "server.py"), { name: "server.py", status: "modified", desc: "Modified runner script" }]);
        setTerminalLog("container$ vi server.py\n[SUCCESS] server.py duplicated to Writable Container Layer (UpperDir) and modified. Shadowing the original file in LowerDir.");
      }
    });
    setTimeline(tl);
    tl.to({}, { duration: 1.0 });
  };

  const handleDeleteConfig = () => {
    setActiveAction("delete");
    setTerminalLog("container$ rm config.json\nDeleting baseline config file...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setUpperDirFiles((prev) => [...prev.filter(f => f.name !== "config.json"), { name: ".wh.config.json", status: "whiteout", desc: "Overlay2 Whiteout masking marker" }]);
        setTerminalLog("container$ rm config.json\n[SUCCESS] Created .wh.config.json whiteout file in Writable Container Layer (UpperDir) to mask config.json from MergedDir view.");
      }
    });
    setTimeline(tl);
    tl.to({}, { duration: 1.0 });
  };

  const getMergedFiles = (): FileItem[] => {
    const filesMap: Record<string, FileItem> = {};

    lowerDirFiles.forEach((file) => {
      filesMap[file.name] = { ...file };
    });

    upperDirFiles.forEach((file) => {
      if (file.status === "whiteout") {
        const targetName = file.name.replace(".wh.", "");
        delete filesMap[targetName];
      } else {
        filesMap[file.name] = { ...file };
      }
    });

    return Object.values(filesMap);
  };

  const mergedFiles = getMergedFiles();

  return (
    <VisualCanvas
      objective="Explore overlay2 layer storage, tracing UpperDir, LowerDir, and MergedDir file system transactions."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            What is overlay2?
          </div>
          <p>
            The **overlay2** storage driver combines multiple read-only directories (**LowerDir**) and a writeable directory (**UpperDir**) into a unified virtual directory view (**MergedDir**). 
          </p>
          <p>
            When a container process writes files, they write to UpperDir. When deleting a read-only LowerDir file, a hidden **whiteout file** (e.g. `.wh.config.json`) is created in UpperDir to mask it from the MergedDir view.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Simulation Columns Playground (Left) */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 items-stretch justify-center relative p-4 border border-zinc-800/40 bg-[#121214] rounded-[18px] min-h-[300px]">
          
          {/* UpperDir */}
          <div className="flex-1 flex flex-col p-4 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 min-h-[180px] shadow-inner">
            <span className="text-[8px] uppercase tracking-wider font-bold text-zinc-300 mb-3 flex items-center gap-1">
              <Folder className="w-3.5 h-3.5 text-zinc-350" />
              UpperDir (Writable Container Layer)
            </span>

            <div className="flex flex-col gap-2 select-text">
              {upperDirFiles.length > 0 ? (
                upperDirFiles.map((file, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "p-2.5 rounded-[9px] border flex items-center justify-between font-mono text-[9px] relative overflow-hidden animate-fadeIn",
                      file.status === "modified" && "border-zinc-700 bg-zinc-800/20 text-zinc-200",
                      file.status === "whiteout" && "border-red-500/20 bg-red-950/5 text-red-400",
                      file.status === "added" && "border-white/10 bg-white/5 text-white"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span>{file.name}</span>
                    </div>
                    <span className="text-[8px] uppercase tracking-wider font-bold">
                      {file.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="border border-dashed border-zinc-850 rounded-[9px] p-4 text-center text-[9px] text-zinc-650 italic">
                  UpperDir is empty
                </div>
              )}
            </div>
          </div>

          {/* LowerDir */}
          <div className="flex-1 flex flex-col p-4 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 min-h-[180px] shadow-inner">
            <span className="text-[8px] uppercase tracking-wider font-bold text-zinc-550 mb-3 flex items-center gap-1">
              <Folder className="w-3.5 h-3.5 text-zinc-500" />
              LowerDir (Read-Only Image Layers)
            </span>

            <div className="flex flex-col gap-2 select-text">
              {lowerDirFiles.map((file, i) => {
                const isShadowed = upperDirFiles.some(f => f.name === file.name || (f.status === "whiteout" && f.name === `.wh.${file.name}`));
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "p-2.5 rounded-[9px] border-0 flex items-center justify-between font-mono text-[9px]",
                      isShadowed 
                        ? "bg-transparent text-zinc-600 line-through" 
                        : "bg-[#1a1a1e] text-zinc-300"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                      <span>{file.name}</span>
                    </div>
                    <span className="text-[8px] uppercase tracking-wider font-bold font-sans">
                      {isShadowed ? "Shadowed" : "Active"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="hidden md:flex flex-col items-center justify-center shrink-0 text-zinc-850">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* MergedDir */}
          <div className="flex-1 flex flex-col p-4 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 min-h-[180px] shadow-inner">
            <span className="text-[8px] uppercase tracking-wider font-bold text-white mb-3 flex items-center gap-1 font-sans">
              <Folder className="w-3.5 h-3.5 text-zinc-300" />
              MergedDir (Unified Host Mount)
            </span>

            <div className="flex flex-col gap-2 select-text">
              {mergedFiles.length > 0 ? (
                mergedFiles.map((file, i) => {
                  const isModified = upperDirFiles.some(f => f.name === file.name && f.status === "modified");
                  const isAdded = upperDirFiles.some(f => f.name === file.name && f.status === "added");
                  
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "p-2.5 rounded-[9px] border border-zinc-850 font-mono text-[9px] flex items-center justify-between animate-fadeIn",
                        isModified && "border-zinc-700 text-zinc-200 bg-zinc-800/20",
                        isAdded && "border-white/10 text-white bg-white/5",
                        !isModified && !isAdded && "text-zinc-350 bg-[#1a1a1e] border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span>{file.name}</span>
                      </div>
                      <span className="text-[8px] uppercase tracking-wider font-bold font-sans">
                        {isModified ? "Modified" : isAdded ? "Added" : "Base"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="border border-dashed border-zinc-850 rounded-[9px] p-4 text-center text-[9px] text-zinc-650 italic">
                  MergedDir is empty
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sandbox controls (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Overlay2 Sandbox
            </span>
            <h4 className="text-sm font-extrabold text-white">Filesystem Actions</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text">
              Simulate container terminal actions to observe how overlay2 updates directories dynamically.
            </p>
          </div>

          <div className="flex flex-col gap-1.5 select-none">
            <button
              onClick={handleWriteLogs}
              disabled={activeAction === "write"}
              className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-[#1a1a1e] text-zinc-200 hover:bg-zinc-800 transition-all border border-zinc-800/30 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-zinc-400" />
              touch logs.txt
            </button>
            <button
              onClick={handleModifyServer}
              disabled={activeAction === "modify"}
              className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-[#1a1a1e] text-zinc-200 hover:bg-zinc-800 transition-all border border-zinc-800/30 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-zinc-450" />
              vi server.py (Modify)
            </button>
            <button
              onClick={handleDeleteConfig}
              disabled={activeAction === "delete"}
              className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-[#1a1a1e] text-zinc-200 hover:bg-zinc-800 transition-all border border-zinc-800/30 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-zinc-500" />
              rm config.json (Delete)
            </button>
          </div>

          {/* Terminal output */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] overflow-hidden flex flex-col min-h-[90px] shadow-sm select-text">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0">
              <span className="text-[8px] font-mono text-zinc-500 font-bold">trace output</span>
            </div>
            <div className="p-3 font-mono text-[9px] text-zinc-450 leading-relaxed overflow-y-auto flex-1">
              {terminalLog}
            </div>
          </div>

          {/* Warning/Alert */}
          <div className="p-3 rounded-[12px] border border-zinc-800/25 bg-[#0d0d0e] text-left flex items-start gap-2 flex-1 select-text">
            <AlertCircle className="w-4 h-4 text-zinc-450 shrink-0 mt-0.5" />
            <div className="text-[9px] text-zinc-450 leading-relaxed font-normal">
              {activeAction === "delete" && "Removing files in the container writes a special .wh. (whiteout) marker in UpperDir. The lower read-only image remains unaltered!"}
              {activeAction === "modify" && "Edits trigger a Copy-on-Write transaction, moving server.py to UpperDir first. MergedDir shadows the original LowerDir target."}
              {activeAction === "write" && "Creating files writes directly to the thin container UpperDir layer. It consumes zero base-image space."}
              {activeAction === "idle" && "Perform an action to see the overlay2 file allocation behavior details."}
            </div>
          </div>

          {activeAction !== "idle" && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
