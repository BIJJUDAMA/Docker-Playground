"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { HelpCircle, Play, RotateCcw, AlertTriangle, Monitor, ShieldCheck, CheckCircle2, GitPullRequest } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

interface PipeHop {
  id: string;
  name: string;
  desc: string;
  details: string;
}

const PIPE_HOPS: PipeHop[] = [
  { id: "dev", name: "Developer", desc: "Write application code", details: "Developer writes code on their local host computer and prepares a commit." },
  { id: "github", name: "GitHub", desc: "Remote repositories storage", details: "The developer pushes the commits to GitHub repositories, triggering Webhook build builders." },
  { id: "ci", name: "CI Pipeline", desc: "Run automated tests suites", details: "CI runners spin up, download codebase dependencies, and run validation test scripts." },
  { id: "build", name: "Docker Build", desc: "Compile code to layers", details: "A secure builder node executes Dockerfile instructions, compiling final image artifacts." },
  { id: "registry", name: "Docker Registry", desc: "Store image registry packages", details: "The compiled image is pushed to central secure repositories (Docker Hub, GCR) for host distributions." },
  { id: "server", name: "Cloud Server", desc: "Pull runtime packages", details: "The production production cloud instance logs into the registry and downloads the image tags." },
  { id: "container", name: "Container", desc: "Instantiate runtime process", details: "A container is run from the pulled image, attaching networks, ports, and storage volumes." },
  { id: "users", name: "End Users", desc: "Serve requests to public", details: "Active proxy gateways forward user traffic to the container port, rendering the site live." }
];

export default function CodeToProduction() {
  const [testsPassing, setTestsPassing] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeHopId, setActiveHopId] = useState<string>("dev");
  const [terminalLog, setTerminalLog] = useState("Click 'Deploy Application' to trace code shipping pipelines.");

  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const flowPacketRef = useRef<HTMLDivElement>(null);

  useAnimationControls(timeline);

  const handleReset = () => {
    setIsPlaying(false);
    setActiveHopId("dev");
    setTerminalLog("Click 'Deploy Application' to trace code shipping pipelines.");

    if (timeline) {
      timeline.pause().progress(0);
    }

    gsap.set(flowPacketRef.current, { opacity: 0, scale: 0, x: 0, y: 0, backgroundColor: "#FAFAFA" });
  };

  const handleDeploy = () => {
    setIsPlaying(true);
    setActiveHopId("dev");
    setTerminalLog("dev$ git commit -m 'feat: update core UI' && git push\nUploading commits to remote GitHub repository...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsPlaying(false);
      }
    });

    setTimeline(tl);

    // Initial packet reveal at Developer node (x: 25, y: 80)
    gsap.set(flowPacketRef.current, { x: 25, y: 80, opacity: 0, scale: 0.8, backgroundColor: "#FAFAFA" });
    tl.to(flowPacketRef.current, { opacity: 1, scale: 1, duration: 0.2 })

      // Developer -> GitHub (x: 82)
      .to(flowPacketRef.current, {
        x: 82,
        duration: 0.6,
        ease: "power1.inOut",
        onStart: () => {
          setActiveHopId("github");
          setTerminalLog("GitHub webhook triggering automated CI build runners...");
        }
      })

      // GitHub -> CI Pipeline (x: 139)
      .to(flowPacketRef.current, {
        x: 139,
        duration: 0.6,
        ease: "power1.inOut",
        onStart: () => {
          setActiveHopId("ci");
          setTerminalLog("CI Runner active: launching npm test execution blocks...");
        }
      });

    // Check CI tests results
    if (!testsPassing) {
      tl.to(flowPacketRef.current, {
        scale: 1.3,
        backgroundColor: "#ef4444",
        duration: 0.2
      })
      .call(() => {
        setTerminalLog("CI$ FAIL: 4 test suites failed.\n[FAILURE] CI tests failed! Deployment aborting to prevent production outages.");
      })
      .to(flowPacketRef.current, { opacity: 0, scale: 0, duration: 0.4 });
      return;
    }

    // CI Pipeline -> Docker Build (x: 196)
    tl.to(flowPacketRef.current, {
      x: 196,
      duration: 0.6,
      ease: "power1.inOut",
      onStart: () => {
        setActiveHopId("build");
        setTerminalLog("Docker build started: packing code instructions into layered immutable image...");
      }
    })

    // Docker Build -> Docker Registry (x: 253)
    .to(flowPacketRef.current, {
      x: 253,
      duration: 0.6,
      ease: "power1.inOut",
      onStart: () => {
        setActiveHopId("registry");
        setTerminalLog("Uploading compiled image tag app-server:latest to Docker Registry...");
      }
    })

    // Docker Registry -> Cloud Server (x: 310)
    .to(flowPacketRef.current, {
      x: 310,
      duration: 0.6,
      ease: "power1.inOut",
      onStart: () => {
        setActiveHopId("server");
        setTerminalLog("Production cloud instance pulling pulled image references...");
      }
    })

    // Cloud Server -> Container (x: 367)
    .to(flowPacketRef.current, {
      x: 367,
      duration: 0.6,
      ease: "power1.inOut",
      onStart: () => {
        setActiveHopId("container");
        setTerminalLog("docker run -d: starting isolated container namespaces...");
      }
    })

    // Container -> End Users (x: 424)
    .to(flowPacketRef.current, {
      x: 424,
      duration: 0.6,
      ease: "power1.inOut",
      onStart: () => {
        setActiveHopId("users");
        setTerminalLog("Attaching ports routing. Site live for users requests!");
      }
    })
    .to(flowPacketRef.current, {
      scale: 1.25,
      backgroundColor: "#22c55e",
      duration: 0.3
    })
    .call(() => {
      setActiveHopId("none");
      setTerminalLog("website$ Status Code 200\n[SUCCESS] Deployment complete! App version is live for public traffic.");
    })
    .to(flowPacketRef.current, { opacity: 0, scale: 0, duration: 0.3 });
  };

  const activeHop = PIPE_HOPS.find(h => h.id === activeHopId) || PIPE_HOPS[0];

  return (
    <VisualCanvas
      objective="Understand the continuous integration and deployment (CI/CD) lifecycle: how code triggers builds, pushes packages, and deploys nodes."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Code-to-Production Pipeline
          </div>
          <p>
            Docker shines inside **automated CI/CD pipelines**. Instead of manually installing dependencies on a server, developer code pushes automatically build a single, immutable container image.
          </p>
          <p>
            If tests pass, that image is pushed to a central **Registry** and instantly pulled by cloud servers, guaranteeing that production runs the *exact* same environment verified in testing.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Horizontal Pipeline Track (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-x-auto custom-scrollbar">
          
          <div className="w-[480px] h-32 relative flex items-center justify-between py-2 px-6">
            
            {/* Connection track wire */}
            <div className="absolute top-[41px] left-[30px] right-[30px] h-0.5 border-t border-dashed border-zinc-850 pointer-events-none z-0" />

            {/* Travel packet */}
            <div
              ref={flowPacketRef}
              className="absolute w-2 h-2 rounded-full top-[38px] left-0 pointer-events-none z-20 opacity-0 scale-0 shadow-[0_0_6px_currentColor]"
            />

            {/* Pipe nodes */}
            {PIPE_HOPS.map((hop, idx) => {
              const isActive = activeHopId === hop.id;
              return (
                <div 
                  key={hop.id}
                  onClick={() => !isPlaying && setActiveHopId(hop.id)}
                  className={cn(
                    "w-12 h-12 rounded-full border flex flex-col items-center justify-center font-bold text-[8px] font-mono transition-all duration-300 z-10 cursor-pointer",
                    isActive
                      ? "bg-white text-black border-transparent scale-105 shadow-sm font-bold"
                      : "bg-[#0d0d0e] border-zinc-850 text-zinc-550 hover:border-zinc-700"
                  )}
                  title={hop.name}
                >
                  <span>{idx + 1}</span>
                  <span className="text-[5px] uppercase tracking-wider block opacity-70 mt-0.5 truncate max-w-full px-1">{hop.id}</span>
                </div>
              );
            })}

          </div>

          {/* Simple webpage mockup on success */}
          {activeHopId === "none" && !isPlaying && testsPassing && terminalLog.includes("Status Code 200") && (
            <div className="mt-4 p-3 bg-[#0d0d0e] border border-zinc-850 rounded-[12px] w-64 text-center animate-fadeIn select-text">
              <span className="text-[7.5px] font-mono text-zinc-500 uppercase block mb-1">Live Webpage Preview</span>
              <div className="py-2.5 rounded-[8px] bg-white/5 border border-white/10 text-[10px] text-white font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>v1.0.0 Deployed Successfully!</span>
              </div>
            </div>
          )}

        </div>

        {/* Selected pipe node inspector panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Pipeline Console
            </span>
            <h4 className="text-sm font-extrabold text-white">Deployment triggers</h4>
            
            <button
              onClick={handleDeploy}
              disabled={isPlaying}
              className="w-full py-2.5 mt-2 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-all border-0 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              Deploy Application
            </button>
          </div>

          {/* Pipeline configurations */}
          <div className="p-3 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 flex flex-col gap-2 font-sans select-none text-[8.5px] font-bold">
            <span className="text-[7.5px] font-mono uppercase tracking-wider text-zinc-550 block mb-0.5">Pipeline Gates:</span>
            <div className="flex items-center justify-between text-[9px]">
              <span>CI Automated Tests:</span>
              <button
                onClick={() => setTestsPassing(!testsPassing)}
                disabled={isPlaying}
                className={cn(
                  "px-2.5 py-1 rounded-[5px] text-[8px] font-bold border transition-all cursor-pointer",
                  testsPassing
                    ? "bg-green-950/15 border-green-500/20 text-green-400"
                    : "bg-red-950/15 border-red-500/20 text-red-400"
                )}
              >
                {testsPassing ? "PASSING" : "FAILING"}
              </button>
            </div>
          </div>

          {/* Diagnostic logs */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col min-h-[90px] overflow-hidden select-text font-sans">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0">
              <span className="text-[7.5px] font-mono text-zinc-550 font-bold">Pipeline terminal logs:</span>
            </div>
            <div className="p-3 font-mono text-[9px] leading-relaxed flex-1 overflow-y-auto flex flex-col gap-0.5 select-text">
              {terminalLog.split("\n").map((line, i) => {
                let className = "text-zinc-400";
                if (line.includes("[SUCCESS]") || line.toLowerCase().includes("success") || line.toLowerCase().includes("passed") || line.toLowerCase().includes("pushed") || line.toLowerCase().includes("status code 200") || line.includes("✓")) {
                  className = "text-green-400 font-semibold";
                } else if (line.includes("[FAILURE]") || line.includes("[WARNING]") || line.toLowerCase().includes("error") || line.toLowerCase().includes("failed") || line.includes("⚠")) {
                  className = "text-red-400 font-semibold";
                } else if (line.includes("$") || line.includes("docker") || line.includes("curl")) {
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

          {/* Node detail inspector */}
          <div className="p-4 bg-[#0d0d0e] rounded-[12px] border border-zinc-800/25 text-left flex flex-col select-text font-sans mt-auto">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Stage: {activeHop.name}
            </span>
            <h4 className="text-[10px] font-extrabold text-white">{activeHop.desc}</h4>
            <p className="text-[9px] text-zinc-450 leading-relaxed font-normal mt-1 border-t border-zinc-850/50 pt-2">
              {activeHop.details}
            </p>
          </div>

          {activeHopId === "ci" && !testsPassing && (
            <div className="p-3 rounded-[9px] border border-red-500/10 bg-red-950/5 text-red-400 text-[8.5px] leading-normal flex items-start gap-1.5 animate-fadeIn select-text font-sans">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                **TEST BREAKAGE**: Code contains failing assertions. The CI runner terminates immediately, blocking docker-build to prevent production outages.
              </span>
            </div>
          )}

          {activeHopId !== "dev" && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Pipeline
            </button>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
