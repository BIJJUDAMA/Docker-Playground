"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { HelpCircle, RefreshCw, FileText, Folder, HardDrive, Trash2, Box, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, FileCode } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { useAnimationStore } from "@/stores/animationStore";

type StorageTarget = "container" | "volume" | "bind";

export default function FollowTheFile() {
  const [target, setTarget] = useState<StorageTarget>("volume");
  const [fileState, setFileState] = useState<"idle" | "created" | "deleted" | "edited">("idle");
  const [fileContent, setFileContent] = useState<string>("hello from host");
  const [terminalLog, setTerminalLog] = useState("Select a storage target and click 'Create File hello.txt' to begin.");
  const { isPlaying, setPlaying } = useAnimationStore();
  
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  const fileRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useAnimationControls(timeline);

  const handleReset = () => {
    setPlaying(false);
    setFileState("idle");
    setFileContent("hello from host");
    setTerminalLog("Select a storage target and click 'Create File hello.txt' to begin.");

    if (timeline) {
      timeline.pause().progress(0);
    }
    gsap.set(fileRef.current, { opacity: 0, scale: 0, x: 0, y: 0 });
    gsap.set("#container-box-node", { opacity: 1, scale: 1 });
  };

  const handleCreateFile = () => {
    setPlaying(true);
    setFileState("created");
    setTerminalLog(`host$ touch hello.txt\nWriting file to mapped storage path...`);

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setPlaying(false);
      }
    });
    setTimeline(tl);

    // Initial packet reveal (x: 20, y: 0)
    gsap.set(fileRef.current, { x: 20, y: -20, opacity: 0, scale: 0.8 });
    tl.to(fileRef.current, { opacity: 1, scale: 1, duration: 0.3 });

    if (target === "container") {
      // hello.txt -> Container -> Writable Layer
      // Container is at x: 260, y: 80
      tl.to(fileRef.current, {
        x: 245,
        y: 65,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => {
          setTerminalLog("container$ echo 'hello' > /app/hello.txt\nWriting hello.txt to thin container-local write layer...");
        }
      })
      .call(() => {
        setTerminalLog("container$ ls\n[SUCCESS] hello.txt written inside container filesystem. File is volatile.");
      });

    } else if (target === "volume") {
      // hello.txt -> Named Volume -> Disk
      // Volume is at x: 130, y: 65
      tl.to(fileRef.current, {
        x: 120,
        y: 65,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => {
          setTerminalLog("volume$ Writing hello.txt to Docker-managed named volume directory...");
        }
      })
      .call(() => {
        setTerminalLog("volume$ [SUCCESS] hello.txt recorded in Docker volume, mapped directly to physical disk.");
      });

    } else {
      // hello.txt -> Host Folder <-> Container
      // Host folder is at x: 20, y: 65
      tl.to(fileRef.current, {
        x: 10,
        y: 65,
        duration: 0.8,
        ease: "power1.inOut",
        onStart: () => {
          setTerminalLog("host$ echo 'hello' > /src/hello.txt\nWriting hello.txt directly to Host Folder (/src)...");
        }
      })
      .to(fileRef.current, {
        scale: 1.15,
        duration: 0.25,
        yoyo: true,
        repeat: 1
      })
      .call(() => {
        setTerminalLog("host$ ls /src && container$ ls /app\n[SUCCESS] Bind mount active: hello.txt appears inside container folder instantly.");
      });
    }
  };

  const handleDeleteContainer = () => {
    setPlaying(true);
    setFileState("deleted");
    setTerminalLog("host$ docker rm -f container\nDestroying container runtime namespaces...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setPlaying(false);
      }
    });
    setTimeline(tl);

    if (target === "container") {
      // Explode/fade container and file together
      tl.to("#container-box-node", {
        opacity: 0.1,
        scale: 0.95,
        duration: 0.6,
        ease: "power2.inOut"
      })
      .to(fileRef.current, {
        opacity: 0,
        scale: 0,
        duration: 0.3
      }, "-=0.3")
      .call(() => {
        setTerminalLog("host$ docker rm -f container\n[WARNING] Container destroyed! hello.txt was in the write layer and has vanished permanently.");
      });

    } else if (target === "volume") {
      // Fade container but file stays safe inside Volume node
      tl.to("#container-box-node", {
        opacity: 0.15,
        scale: 0.95,
        duration: 0.6,
        ease: "power2.inOut"
      })
      .call(() => {
        setTerminalLog("host$ docker rm -f container\n[SUCCESS] Container deleted! The named volume remains intact on host disk, preserving hello.txt.");
      });

    } else {
      // Bind mount container removed, host file stays
      tl.to("#container-box-node", {
        opacity: 0.15,
        scale: 0.95,
        duration: 0.6,
        ease: "power2.inOut"
      })
      .call(() => {
        setTerminalLog("host$ docker rm -f container\n[SUCCESS] Container deleted! Local host workspace files (/src/hello.txt) are completely untouched.");
      });
    }
  };

  const handleEditFileContent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFileContent(val);
    setFileState("edited");
    setTerminalLog(`host$ echo '${val}' > /src/hello.txt\nSynchronized file change to container (/app/hello.txt) live.`);
    
    // Green border flash on container box to simulate hot sync!
    gsap.timeline()
      .to("#container-box-node", { borderColor: "#22c55e", duration: 0.25 })
      .to("#container-box-node", { borderColor: "rgba(255, 255, 255, 0.1)", duration: 0.25 });
  };

  useEffect(() => {
    handleReset();
  }, [target]);

  return (
    <VisualCanvas
      objective="Follow a single file 'hello.txt' as it traverses container layers, named volumes, and local workspace directories."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Trace hello.txt
          </div>
          <p>
            Instead of memorizing definitions, follow **one file** to observe where it is physically written and how file removals/edits affect it.
          </p>
          <p>
            Choose a storage target on the right and click **"Create File hello.txt"** to watch the path details.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Visual Map (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          <div className="w-full max-w-sm flex items-center justify-between gap-4 relative min-h-[160px] py-4">
            
            {/* hello.txt Floating File Orb */}
            <div 
              ref={fileRef}
              className="absolute w-20 py-1.5 rounded-[8px] border border-white bg-[#0d0d0e] font-mono text-[8.5px] text-white flex items-center justify-center gap-1.5 opacity-0 scale-0 z-20 shadow-md"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-300" />
              hello.txt
            </div>

            {/* 1. Host Folder (Left) */}
            <div className="w-24 shrink-0 text-center z-10">
              <div className={cn(
                "p-2.5 rounded-[12px] border bg-[#0d0d0e] flex flex-col items-center gap-1.5 transition-all duration-300",
                target === "bind" ? "border-white text-white font-bold" : "border-zinc-850 text-zinc-550"
              )}>
                <Folder className="w-4 h-4 text-zinc-500" />
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">Host Folder (/src)</span>
              </div>
            </div>

            {/* 2. Named Volume (Middle) */}
            <div className="w-24 shrink-0 text-center z-10">
              <div className={cn(
                "p-2.5 rounded-[12px] border bg-[#0d0d0e] flex flex-col items-center gap-1.5 transition-all duration-300",
                target === "volume" ? "border-white text-white font-bold" : "border-zinc-850 text-zinc-550"
              )}>
                <HardDrive className="w-4 h-4 text-zinc-500" />
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">Volume (db_data)</span>
              </div>
            </div>

            {/* 3. Container Node (Right) */}
            <div id="container-box-node" className="w-28 shrink-0 text-center z-10 transition-all duration-300">
              <div className="p-2.5 rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col items-center gap-1.5 shadow-inner">
                <Box className="w-4 h-4 text-zinc-400" />
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider">Container (/app)</span>
              </div>
            </div>

          </div>

          {/* Sync value card showing file contents for Bind Mount */}
          {target === "bind" && fileState !== "idle" && fileState !== "deleted" && (
            <div className="mt-4 p-2 px-4 rounded-[8px] bg-[#0d0d0e] border border-zinc-850 font-mono text-[9px] text-zinc-350 animate-fadeIn">
              File content sync: <span className="text-white font-bold">"{fileContent}"</span>
            </div>
          )}

        </div>

        {/* Selected actions and details panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              File tracing Controls
            </span>
            <h4 className="text-sm font-extrabold text-white">Create File</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text font-sans">
              Choose target location and compile layout paths.
            </p>
          </div>

          <div className="flex flex-col gap-3 flex-1 justify-center select-none font-sans">
            
            {/* Target selector */}
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span>Storage Target:</span>
              <div className="flex rounded-[6px] border border-zinc-800 bg-[#0d0d0e] p-0.5 overflow-hidden">
                {(["volume", "bind", "container"] as const).map((t) => (
                  <button
                    key={t}
                    disabled={fileState !== "idle"}
                    onClick={() => setTarget(t)}
                    className={cn(
                      "px-2 py-1 rounded-[4px] border-0 text-[8px] font-bold transition-all cursor-pointer disabled:opacity-40",
                      target === t ? "bg-white text-black" : "bg-transparent text-zinc-550 hover:text-zinc-350"
                    )}
                  >
                    {t === "container" ? "Write Layer" : t === "volume" ? "Volume" : "Bind Mount"}
                  </button>
                ))}
              </div>
            </div>

            {/* Core triggers */}
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={handleCreateFile}
                disabled={fileState !== "idle"}
                className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5"
              >
                Create File hello.txt
              </button>

              {fileState !== "idle" && fileState !== "deleted" && (
                <button
                  onClick={handleDeleteContainer}
                  className="w-full py-2.5 rounded-[9px] text-[10px] font-bold bg-red-500 hover:bg-red-600 text-white transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  Delete Container
                </button>
              )}
            </div>

            {/* Bind mount live text editor */}
            {target === "bind" && fileState !== "idle" && fileState !== "deleted" && (
              <div className="flex flex-col gap-1 text-[10px] font-bold border-t border-zinc-850/50 pt-3 mt-1 animate-fadeIn select-text">
                <span>Edit Host File:</span>
                <input
                  type="text"
                  value={fileContent}
                  onChange={handleEditFileContent}
                  placeholder="Type to sync live..."
                  className="w-full py-1.5 px-2.5 rounded-[5px] bg-[#0d0d0e] border border-zinc-800 text-[10px] text-white focus:outline-none focus:border-zinc-650"
                />
              </div>
            )}

          </div>

          {/* Diagnostic logs */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col min-h-[90px] overflow-hidden select-text font-sans">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0">
              <span className="text-[7.5px] font-mono text-zinc-550 font-bold">Filesystem logs trace:</span>
            </div>
            <div className="p-3 font-mono text-[9px] leading-relaxed flex-1 overflow-y-auto flex flex-col gap-0.5">
              {terminalLog.split("\n").map((line, i) => {
                let className = "text-zinc-400";
                if (line.includes("[SUCCESS]") || line.toLowerCase().includes("success") || line.includes("✓")) {
                  className = "text-green-400 font-semibold";
                } else if (line.includes("[FAILURE]") || line.includes("[WARNING]") || line.toLowerCase().includes("error") || line.toLowerCase().includes("fatal") || line.toLowerCase().includes("failed") || line.includes("⚠")) {
                  className = "text-red-400 font-semibold";
                } else if (line.includes("$")) {
                  className = "text-zinc-550 font-mono";
                }
                return (
                  <div key={i} className={className}>
                    {line}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alert messages */}
          {fileState === "deleted" && target === "container" && (
            <div className="p-3 rounded-[12px] bg-red-950/5 border border-red-500/15 text-[8.5px] text-red-405 leading-normal flex items-start gap-1.5 animate-fadeIn select-text font-sans">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                **DATA WIPED!** Because the file lived inside the container's volatile write layer, it was deleted permanently on container exit.
              </span>
            </div>
          )}

          {fileState === "deleted" && target !== "container" && (
            <div className="p-3 rounded-[12px] bg-white/5 border border-white/10 text-[8.5px] text-zinc-305 leading-normal flex items-start gap-1.5 animate-fadeIn select-text font-sans">
              <CheckCircle2 className="w-4 h-4 text-zinc-405 shrink-0 mt-0.5" />
              <span>
                **DATA SURVIVES!** Removing the container decoupled the mount link, but the file remains preserved inside the {target === "volume" ? "Volume Disk sector" : "Host directory"}.
              </span>
            </div>
          )}

          {fileState !== "idle" && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none font-sans"
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
