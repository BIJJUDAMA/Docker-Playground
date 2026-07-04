"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { HelpCircle, RefreshCw, Server, Database, Play, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Monitor } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";

interface BugScenario {
  id: string;
  name: string;
  symptom: string;
  correctFix: string;
  fixOptions: string[];
  explanation: string;
  brokenNodeId: "front" | "back" | "db";
}

const BUG_SCENARIOS: BugScenario[] = [
  {
    id: "db_disconnect",
    name: "Database Network Disconnection",
    symptom: "Backend logs report 'Connection refused (172.18.0.4:5432)'. The database container itself is active, but backend queries cannot reach it.",
    correctFix: "Connect database container to app-net bridge network",
    fixOptions: [
      "Rebuild PostgreSQL base image from scratch",
      "Connect database container to app-net bridge network",
      "Change DB password configuration",
      "Expose host port 5432"
    ],
    explanation: "PostgreSQL was started on Nginx network bounds by accident. Connecting both api-service and db-postgres to the same 'app-net' bridge makes their namespaces discoverable.",
    brokenNodeId: "db"
  },
  {
    id: "wrong_port",
    name: "Mismatched Host Port Mapping",
    symptom: "Querying http://localhost:8080 in the browser times out. The Nginx frontend container is running perfectly.",
    correctFix: "Fix host port forwarding mapping to 8080:80",
    fixOptions: [
      "Run database container on port 8080",
      "Attach frontend container to host network mode",
      "Fix host port forwarding mapping to 8080:80",
      "Expose container port 8081"
    ],
    explanation: "Nginx was bind-mapped to host interface port 8081 instead of 8080. Updating the port mapping parameter to 8080:80 restores the public link access.",
    brokenNodeId: "front"
  },
  {
    id: "back_stopped",
    name: "Backend Application Halted",
    symptom: "Frontend queries return '502 Bad Gateway'. Checking backend logs shows no output logs running.",
    correctFix: "Run docker start api-service",
    fixOptions: [
      "Run docker start api-service",
      "Change backend dynamic IP address manually",
      "Ignore .dockerignore directories",
      "Mount host folder to backend"
    ],
    explanation: "The Node backend container process exited due to memory constraints and is stopped. Restarting the container handles container recovery.",
    brokenNodeId: "back"
  }
];

export default function NetworkDebugger() {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number>(0);
  const [selectedFix, setSelectedFix] = useState<string | null>(null);
  const [isTested, setIsTested] = useState<boolean>(false);
  const [testSuccess, setTestSuccess] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeHopId, setActiveHopId] = useState<"front" | "back" | "db" | "none">("none");
  const [terminalLog, setTerminalLog] = useState("Debug the broken system configuration below. Select the correct fix to restore the connection.");

  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);
  const packetRef = useRef<HTMLDivElement>(null);

  useAnimationControls(timeline);

  const scenario = BUG_SCENARIOS[activeScenarioIdx];

  const handleReset = () => {
    setSelectedFix(null);
    setIsTested(false);
    setTestSuccess(false);
    setIsPlaying(false);
    setActiveHopId("none");
    setTerminalLog("Debug the broken system configuration below. Select the correct fix to restore the connection.");
    
    if (timeline) {
      timeline.pause().progress(0);
    }
    gsap.set(packetRef.current, { opacity: 0, scale: 0, x: 0, y: 0 });
  };

  const handleTestRoute = () => {
    setIsPlaying(true);
    setIsTested(true);
    setActiveHopId("front");
    setTerminalLog("browser$ curl http://localhost:8080\nSending request packet...");

    if (timeline) {
      timeline.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsPlaying(false);
      }
    });

    setTimeline(tl);

    const isFixed = selectedFix === scenario.correctFix;

    // Start packet at browser/frontend (x: 40, y: 80)
    gsap.set(packetRef.current, { x: 40, y: 80, opacity: 0, scale: 0.8, backgroundColor: "#FAFAFA" });

    tl.to(packetRef.current, { opacity: 1, scale: 1, duration: 0.2 });

    // Wrong port check (fails at frontend mapping boundary)
    if (scenario.id === "wrong_port" && !isFixed) {
      tl.to(packetRef.current, {
        x: 100,
        duration: 0.4,
        ease: "power1.inOut"
      })
      .to(packetRef.current, {
        scale: 1.3,
        backgroundColor: "#ef4444",
        duration: 0.2
      })
      .call(() => {
        setTerminalLog("curl$ Connection Refused!\n[FAILURE] Host port 8080 maps to no active listener socket. Request dropped.");
        setTestSuccess(false);
      })
      .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.3 });
      return;
    }

    // Pass Frontend mapping -> Frontend Node (x: 140, y: 80)
    tl.to(packetRef.current, {
      x: 140,
      duration: 0.5,
      ease: "power1.inOut",
      onStart: () => {
        setActiveHopId("front");
        setTerminalLog("Frontend web-front processing routing rules...");
      }
    });

    // Frontend -> Backend (x: 270, y: 80)
    tl.to(packetRef.current, {
      x: 270,
      duration: 0.6,
      ease: "power1.inOut",
      onStart: () => {
        setActiveHopId("back");
        setTerminalLog("Routing packet to API service api-service...");
      }
    });

    // Backend stopped check
    if (scenario.id === "back_stopped" && !isFixed) {
      tl.to(packetRef.current, {
        scale: 1.3,
        backgroundColor: "#ef4444",
        duration: 0.2
      })
      .call(() => {
        setTerminalLog("front$ Error: 502 Bad Gateway\n[FAILURE] api-service is stopped and process socket is offline.");
        setTestSuccess(false);
      })
      .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.3 });
      return;
    }

    // Backend -> Database (x: 400, y: 80)
    tl.to(packetRef.current, {
      x: 400,
      duration: 0.6,
      ease: "power1.inOut",
      onStart: () => {
        setActiveHopId("db");
        setTerminalLog("api-service querying records catalog from db-postgres...");
      }
    });

    // Database disconnected check
    if (scenario.id === "db_disconnect" && !isFixed) {
      tl.to(packetRef.current, {
        scale: 1.3,
        backgroundColor: "#ef4444",
        duration: 0.2
      })
      .call(() => {
        setTerminalLog("api-service$ Error: connection timed out\n[FAILURE] db-postgres container resides on a separate network. Host address is unreachable.");
        setTestSuccess(false);
      })
      .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.3 });
      return;
    }

    // ALL FIXED: Success response returns!
    tl.to(packetRef.current, {
      backgroundColor: "#22c55e",
      duration: 0.2,
      onStart: () => {
        setTerminalLog("db-postgres$ Query Success!\n[SUCCESS] Returning transaction records data payload...");
      }
    })
    .to(packetRef.current, {
      x: 40,
      duration: 1.2,
      ease: "power2.inOut",
      onStart: () => {
        setActiveHopId("front");
        setTerminalLog("HTTP Response code 200 OK returning back browser client...");
      }
    })
    .call(() => {
      setActiveHopId("none");
      setTerminalLog("browser$ 200 OK\n[SUCCESS] Debugging complete! System resolved successfully.");
      setTestSuccess(true);
    })
    .to(packetRef.current, { opacity: 0, scale: 0, duration: 0.3 });
  };

  const handleNextChallenge = () => {
    setActiveScenarioIdx((prev) => (prev + 1) % BUG_SCENARIOS.length);
    handleReset();
  };

  const isCurrentNodeBroken = (nodeId: "front" | "back" | "db") => {
    return scenario.brokenNodeId === nodeId && selectedFix !== scenario.correctFix;
  };

  return (
    <VisualCanvas
      objective="Diagnose network routing failures visually: identify stopped services, unmapped ports, and network isolation boundaries."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Network Debugging Lab
          </div>
          <p>
            When multi-container apps break, developers inspect networks to isolate failures. Click **"Test Route"** to watch the packet travel. The packet will fail at the broken boundary.
          </p>
          <p>
            Review the logs and select the correct CLI fix from the sidebar console.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Visualizer network track (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          {/* Progress header info */}
          <div className="absolute top-4 left-6 right-6 flex justify-between font-mono text-[8px] text-zinc-550 font-bold select-none">
            <span>Challenge Scenario {activeScenarioIdx + 1} of {BUG_SCENARIOS.length}</span>
            <span className="uppercase tracking-widest">Network Debugger</span>
          </div>

          <div className="w-full max-w-sm flex items-center justify-between gap-4 relative min-h-[140px] py-4">
            
            {/* Visual pathway lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden sm:block">
              {/* Front -> Back */}
              <line 
                x1={80} 
                y1={80} 
                x2={210} 
                y2={80} 
                stroke={isCurrentNodeBroken("back") ? "#ef4444" : "#1f1f23"} 
                strokeWidth="1.5"
                strokeDasharray={isCurrentNodeBroken("back") ? "none" : "3"} 
              />
              {/* Back -> DB */}
              <line 
                x1={210} 
                y1={80} 
                x2={340} 
                y2={80} 
                stroke={isCurrentNodeBroken("db") ? "#ef4444" : "#1f1f23"} 
                strokeWidth="1.5"
                strokeDasharray={isCurrentNodeBroken("db") ? "none" : "3"} 
              />
            </svg>

            {/* Packet Orb */}
            <div 
              ref={packetRef}
              className="absolute w-2.5 h-2.5 rounded-full z-20 opacity-0 scale-0 shadow-[0_0_8px_currentColor]"
            />

            {/* Node 1: web-front */}
            <div className="w-24 z-10">
              <NodePrimitive
                label="web-front"
                status={isCurrentNodeBroken("front") ? "crashed" : activeHopId === "front" ? "running" : "idle"}
                icon={<Monitor className="w-3.5 h-3.5" />}
                className="py-1 px-2 rounded-[8px]"
              />
            </div>

            {/* Node 2: api-service */}
            <div className="w-24 z-10">
              <NodePrimitive
                label="api-service"
                status={isCurrentNodeBroken("back") ? "crashed" : activeHopId === "back" ? "running" : "idle"}
                icon={<Server className="w-3.5 h-3.5" />}
                className="py-1 px-2 rounded-[8px]"
              />
            </div>

            {/* Node 3: db-postgres */}
            <div className="w-24 z-10">
              <NodePrimitive
                label="db-postgres"
                status={isCurrentNodeBroken("db") ? "crashed" : activeHopId === "db" ? "running" : "idle"}
                icon={<Database className="w-3.5 h-3.5" />}
                className="py-1 px-2 rounded-[8px]"
              />
            </div>

          </div>

          {/* Description warning banner */}
          <div className="mt-4 p-3 rounded-[12px] bg-[#0d0d0e] border border-zinc-850 text-[9px] text-zinc-400 select-text text-left max-w-sm">
            <span className="font-bold text-zinc-300 block mb-1">System Symptom:</span>
            {scenario.symptom}
          </div>

        </div>

        {/* Selected challenge feedback panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Debugger Console
            </span>
            <h4 className="text-sm font-extrabold text-white">Diagnostics Console</h4>
            
            <button
              onClick={handleTestRoute}
              disabled={isPlaying}
              className="w-full py-2 mt-2 rounded-[8px] text-[10px] font-bold bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-all border-0 cursor-pointer flex items-center justify-center gap-1 select-none font-sans"
            >
              <Play className="w-3 h-3 fill-black text-black" />
              Test Route (Send Packet)
            </button>
          </div>

          {/* Fix choices list */}
          <div className="p-3 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 flex flex-col gap-2 font-sans select-none text-[8.5px] font-bold">
            <span className="text-[7.5px] font-mono uppercase tracking-wider text-zinc-550 block mb-0.5 font-bold">Select target CLI Fix:</span>
            
            {scenario.fixOptions.map((opt) => (
              <button
                key={opt}
                disabled={isPlaying}
                onClick={() => {
                  setSelectedFix(opt);
                  setIsTested(false);
                  setTestSuccess(false);
                }}
                className={cn(
                  "py-1.5 px-2.5 rounded-[5px] border text-left transition-colors cursor-pointer disabled:opacity-40",
                  selectedFix === opt
                    ? "bg-white text-black border-transparent"
                    : "bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-zinc-200"
                )}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Verification output logs */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col min-h-[90px] overflow-hidden select-text font-sans">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0">
              <span className="text-[7.5px] font-mono text-zinc-550 font-bold">Diagnostics output:</span>
            </div>
            <div className={cn(
              "p-3 font-mono text-[9px] leading-relaxed flex-1 overflow-y-auto",
              isTested && !testSuccess ? "text-red-405" : "text-zinc-300"
            )}>
              {terminalLog}
            </div>
          </div>

          {/* Final challenge success / failure alerts */}
          {isTested && !isPlaying && (
            <div className="animate-fadeIn select-text">
              {testSuccess ? (
                <div className="p-3.5 rounded-[12px] bg-white/5 border border-white/10 text-[8.5px] text-zinc-300 leading-normal flex items-start gap-2 font-sans">
                  <CheckCircle2 className="w-4 h-4 text-zinc-350 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-extrabold text-white">BUG RESOLVED!</span>
                    <span className="text-zinc-450 mt-0.5">{scenario.explanation}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-[12px] bg-red-950/5 border border-red-500/15 text-[8.5px] text-red-405 leading-normal flex items-start gap-2 font-sans">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-extrabold text-red-400">TEST FAILED</span>
                    <span className="text-red-400/80 mt-0.5">The query packet failed to complete. Select another fix and re-run.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {isTested && testSuccess && (
            <button
              onClick={handleNextChallenge}
              className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all border-0 cursor-pointer select-none font-sans"
            >
              Next Challenge
            </button>
          )}

          {selectedFix !== null && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Challenge
            </button>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
