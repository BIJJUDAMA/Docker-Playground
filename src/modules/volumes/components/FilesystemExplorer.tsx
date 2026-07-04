"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle, RefreshCw, Folder, FileText, HardDrive, Trash2, ArrowRight, ShieldCheck, Box, Check } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

type MountMode = "none" | "bind" | "named";

interface FileEntry {
  name: string;
  status: "pristine" | "created" | "modified";
}

export default function FilesystemExplorer() {
  const [mountMode, setMountMode] = useState<MountMode>("named");
  const [containerAlive, setContainerAlive] = useState<boolean>(true);
  
  // File logs tracker states
  const [hostFiles, setHostFiles] = useState<Record<string, FileEntry>>({
    "app.js": { name: "app.js", status: "pristine" }
  });
  
  const [volumeFiles, setVolumeFiles] = useState<Record<string, FileEntry>>({});
  
  const [containerFiles, setContainerFiles] = useState<Record<string, FileEntry>>({
    "app.js": { name: "app.js", status: "pristine" }
  });

  const [terminalLog, setTerminalLog] = useState("Select mount mode and trigger actions to watch file synchronization.");

  const handleReset = () => {
    setContainerAlive(true);
    setHostFiles({ "app.js": { name: "app.js", status: "pristine" } });
    setVolumeFiles({});
    setContainerFiles({ "app.js": { name: "app.js", status: "pristine" } });
    setTerminalLog("Select mount mode and trigger actions to watch file synchronization.");
  };

  const handleWriteNotes = () => {
    if (!containerAlive) return;

    setTerminalLog("container$ touch /data/notes.txt\nWriting data notes file to container mount directory...");

    // Create file inside container
    setContainerFiles(prev => ({
      ...prev,
      "notes.txt": { name: "notes.txt", status: "created" }
    }));

    // Mirror to mounted directory depending on mode
    if (mountMode === "bind") {
      setHostFiles(prev => ({
        ...prev,
        "notes.txt": { name: "notes.txt", status: "created" }
      }));
      setTerminalLog("container$ touch /data/notes.txt\n[SUCCESS] notes.txt created inside container filesystem and written directly to Host Directory mount.");
    } else if (mountMode === "named") {
      setVolumeFiles(prev => ({
        ...prev,
        "notes.txt": { name: "notes.txt", status: "created" }
      }));
      setTerminalLog("container$ touch /data/notes.txt\n[SUCCESS] notes.txt created inside container filesystem and synchronized to Docker Named Volume.");
    } else {
      setTerminalLog("container$ touch /data/notes.txt\n[SUCCESS] notes.txt created locally in Container Writable Layer. Bypasses host storage directories.");
    }
  };

  const handleModifyCode = () => {
    setTerminalLog("host$ vi app.js\nEditing source code file directly on the host computer workspace...");

    setHostFiles(prev => ({
      ...prev,
      "app.js": { name: "app.js", status: "modified" }
    }));

    if (mountMode === "bind" && containerAlive) {
      setContainerFiles(prev => ({
        ...prev,
        "app.js": { name: "app.js", status: "modified" }
      }));
      setTerminalLog("host$ vi app.js\n[SUCCESS] app.js edited on Host. Changes synchronized instantly inside Container (Hot Reloading Active).");
    } else {
      setTerminalLog("host$ vi app.js\n[SUCCESS] app.js edited on Host. Filesystem container is isolated—no sync occurred.");
    }
  };

  const handleDeleteContainer = () => {
    setContainerAlive(false);
    setTerminalLog("host$ docker rm -f container\nDestroying container layers. Ephemeral files are removed immediately.");
    
    // Clear container files
    setContainerFiles({});
  };

  return (
    <VisualCanvas
      objective="Trace how files are synchronized across host directories, volume mounts, and container filesystems in real-time."
      timeline={null}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Decoupled Filesystems Explorer
          </div>
          <p>
            An interactive multi-explorer view showing the files on the **Host Machine**, **Docker Volume**, and **Container**.
          </p>
          <p>
            Observe how modifying code on the **Host** updates the **Container** instantly in **Bind Mount** mode (ideal for hot-reloading in Dev), and how **Named Volumes** secure writes outside the container lifecycle.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Sandbox Canvas (Left) */}
        <div className="flex-1 flex flex-col items-stretch justify-start p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px]">
          
          {/* Mount Mode selection tabs */}
          <div className="flex gap-2 mb-4 shrink-0 select-none">
            {(["named", "bind", "none"] as const).map((mode) => (
              <button
                key={mode}
                disabled={!containerAlive}
                onClick={() => {
                  setMountMode(mode);
                  handleReset();
                }}
                className={cn(
                  "px-3 py-1.5 rounded-[8px] text-[9px] font-bold border transition-all cursor-pointer disabled:opacity-40",
                  mountMode === mode
                    ? "bg-white text-black border-transparent shadow-sm"
                    : "bg-[#0d0d0e] border-zinc-850 text-zinc-450 hover:text-zinc-200"
                )}
              >
                {mode === "none" ? "No Mount" : mode === "bind" ? "Bind Mount" : "Named Volume"}
              </button>
            ))}
          </div>

          {/* Tri-Explorer columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-[220px]">
            
            {/* Column 1: Host Directory */}
            <div className="p-3.5 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 flex flex-col shadow-inner select-text">
              <span className="text-[7.5px] uppercase tracking-wider font-mono font-bold text-zinc-550 mb-3 flex items-center gap-1 select-none">
                <Folder className="w-3.5 h-3.5 text-zinc-500" />
                Host Machine (/app)
              </span>
              
              <div className="flex flex-col gap-1.5 font-mono text-[9px]">
                {Object.values(hostFiles).map((file) => (
                  <div 
                    key={file.name} 
                    className={cn(
                      "p-1.5 rounded-[6px] flex items-center justify-between",
                      file.status !== "pristine" ? "bg-white/5 border border-white/10 text-white font-bold" : "text-zinc-400"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-zinc-550 shrink-0" />
                      <span>{file.name}</span>
                    </div>
                    {file.status !== "pristine" && (
                      <span className="text-[6.5px] uppercase tracking-wider font-sans font-bold text-zinc-450">{file.status}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Docker Named Volume directory */}
            <div className="p-3.5 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 flex flex-col shadow-inner select-text">
              <span className="text-[7.5px] uppercase tracking-wider font-mono font-bold text-zinc-550 mb-3 flex items-center gap-1 select-none">
                <HardDrive className="w-3.5 h-3.5 text-zinc-500" />
                Docker Volume (pg-data)
              </span>

              <div className="flex flex-col gap-1.5 font-mono text-[9px]">
                {mountMode === "named" ? (
                  Object.values(volumeFiles).length > 0 ? (
                    Object.values(volumeFiles).map((file) => (
                      <div key={file.name} className="p-1.5 rounded-[6px] bg-white/5 border border-white/10 text-white font-bold flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-zinc-405 shrink-0" />
                          <span>{file.name}</span>
                        </div>
                        <span className="text-[6.5px] uppercase tracking-wider font-sans font-bold text-zinc-450">saved</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[8.5px] text-zinc-650 font-sans italic text-center p-4">Volume is empty</span>
                  )
                ) : (
                  <span className="text-[8.5px] text-zinc-650 font-sans italic text-center p-4">Volume not mounted</span>
                )}
              </div>
            </div>

            {/* Column 3: Container runtime files */}
            <div className={cn(
              "p-3.5 bg-[#0d0d0e] rounded-[12px] border flex flex-col shadow-inner select-text transition-all duration-300",
              containerAlive ? "border-zinc-850" : "border-red-950/20 opacity-30"
            )}>
              <span className="text-[7.5px] uppercase tracking-wider font-mono font-bold text-zinc-300 mb-3 flex items-center gap-1 select-none">
                <Box className="w-3.5 h-3.5 text-zinc-400" />
                Container (/data)
              </span>

              <div className="flex flex-col gap-1.5 font-mono text-[9px]">
                {containerAlive ? (
                  Object.values(containerFiles).map((file) => (
                    <div 
                      key={file.name}
                      className={cn(
                        "p-1.5 rounded-[6px] flex items-center justify-between",
                        file.status !== "pristine" ? "bg-white/5 border border-white/10 text-white font-bold" : "text-zinc-400"
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-zinc-550 shrink-0" />
                        <span>{file.name}</span>
                      </div>
                      {file.status !== "pristine" && (
                        <span className="text-[6.5px] uppercase tracking-wider font-sans font-bold text-zinc-450">{file.status}</span>
                      )}
                    </div>
                  ))
                ) : (
                  <span className="text-[8.5px] text-red-500/80 font-sans italic text-center p-4">Container Destroyed</span>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Console control sidebar (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              File Actions Console
            </span>
            <h4 className="text-sm font-extrabold text-white">Filesystem triggers</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text">
              Run commands to witness files sync across storage barriers.
            </p>
          </div>

          {/* Trigger button actions */}
          <div className="flex flex-col gap-2 flex-1 justify-center select-none">
            <button
              onClick={handleWriteNotes}
              disabled={!containerAlive}
              className="w-full py-2.5 rounded-[9px] text-[10px] font-bold bg-[#1a1a1e] border border-zinc-850 hover:border-zinc-700 text-zinc-300 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              Write notes.txt (in Container)
            </button>
            <button
              onClick={handleModifyCode}
              disabled={!containerAlive}
              className="w-full py-2.5 rounded-[9px] text-[10px] font-bold bg-[#1a1a1e] border border-zinc-850 hover:border-zinc-700 text-zinc-300 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              Modify app.js (on Host)
            </button>
            <button
              onClick={handleDeleteContainer}
              disabled={!containerAlive}
              className="w-full py-2.5 rounded-[9px] text-[10px] font-bold bg-red-500 hover:bg-red-600 text-white disabled:opacity-40 transition-all border-0 cursor-pointer flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Container
            </button>
          </div>

          {/* Terminal log trace */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col min-h-[90px] overflow-hidden select-text font-sans">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0">
              <span className="text-[7.5px] font-mono text-zinc-550 font-bold">Trace output:</span>
            </div>
            <div className="p-3 font-mono text-[9px] text-zinc-400 leading-relaxed flex-1 overflow-y-auto">
              {terminalLog}
            </div>
          </div>

          {!containerAlive && (
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
