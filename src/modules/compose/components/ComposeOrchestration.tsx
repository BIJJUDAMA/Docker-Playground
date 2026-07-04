"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, RefreshCw, HelpCircle, Layers } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { useAnimationStore } from "@/stores/animationStore";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";

export default function ComposeOrchestration() {
  const [orchestrated, setOrchestrated] = useState<boolean>(false);
  const [animationState, setAnimationState] = useState<"idle" | "running" | "completed">("idle");
  const [terminalLog, setTerminalLog] = useState("Click 'docker compose up' in the sandbox panel to initialize.");

  const [dbState, setDbState] = useState<"idle" | "booting" | "healthy" | "crashed">("idle");
  const [apiState, setApiState] = useState<"idle" | "booting" | "healthy" | "crashed">("idle");
  const [webState, setWebState] = useState<"idle" | "booting" | "healthy" | "crashed">("idle");

  const containerRef = useRef<HTMLDivElement>(null);
  const dbRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<HTMLDivElement>(null);
  const webRef = useRef<HTMLDivElement>(null);

  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  useAnimationControls(timeline);

  const handleReset = useCallback(() => {
    setAnimationState("idle");
    setTerminalLog("Click 'docker compose up' in the sandbox panel to initialize.");
    setDbState("idle");
    setApiState("idle");
    setWebState("idle");

    useAnimationStore.getState().setPlaying(false);
    useAnimationStore.getState().setProgress(0);

    if (timeline) {
      timeline.pause().progress(0);
    }

    gsap.set([dbRef.current, apiRef.current, webRef.current], { scale: 1, opacity: 1 });
  }, [timeline]);

  // Build the timeline whenever orchestrated changes
  useEffect(() => {
    // Reset states first
    setAnimationState("idle");
    setTerminalLog("Click 'docker compose up' in the sandbox panel to initialize.");
    setDbState("idle");
    setApiState("idle");
    setWebState("idle");
    gsap.set([dbRef.current, apiRef.current, webRef.current], { scale: 1, opacity: 1 });

    const tl = gsap.timeline({
      paused: true,
      onStart: () => {
        setAnimationState("running");
        setTerminalLog("docker compose up -d\nCreating network compose_default...\nCreating db-server...\nCreating api-service...\nCreating web...");
      },
      onComplete: () => {
        setAnimationState("completed");
      }
    });

    if (orchestrated) {
      // SEQUENTIAL ORCHESTRATION WITH depends_on
      tl.to({}, {
        duration: 0.2,
        onStart: () => {
          setDbState("booting");
          setTerminalLog("docker compose up -d\n[INFO] Launching db-server first (depends_on constraint)...");
        }
      })
      .to(dbRef.current, {
        scale: 1.01,
        duration: 0.8,
        onComplete: () => {
          setDbState("healthy");
          setTerminalLog((prev) => prev + "\npostgres:15 database is ready to accept connections.\n[SUCCESS] db-server is healthy.");
        }
      })
      .to({}, {
        duration: 0.2,
        onStart: () => {
          setApiState("booting");
          setTerminalLog((prev) => prev + "\n[INFO] db-server is healthy. Launching api-service...");
        }
      })
      .to(apiRef.current, {
        scale: 1.01,
        duration: 0.8,
        onComplete: () => {
          setApiState("healthy");
          setTerminalLog((prev) => prev + "\nnode:18 api connected to postgres://db-server:5432.\n[SUCCESS] api-service is healthy.");
        }
      })
      .to({}, {
        duration: 0.2,
        onStart: () => {
          setWebState("booting");
          setTerminalLog((prev) => prev + "\n[INFO] api-service is healthy. Launching web nginx container...");
        }
      })
      .to(webRef.current, {
        scale: 1.01,
        duration: 0.8,
        onComplete: () => {
          setWebState("healthy");
          setTerminalLog((prev) => prev + "\nnginx proxy listening on port 80.\n[SUCCESS] Stack bootstrap completed successfully.");
        }
      });
    } else {
      // CONCURRENT BOOT WITHOUT depends_on
      tl.to({}, {
        duration: 0.2,
        onStart: () => {
          setDbState("booting");
          setApiState("booting");
          setWebState("booting");
          setTerminalLog("docker compose up -d\n[CONCURRENT] Booting all stack container services simultaneously...");
        }
      })
      .to([dbRef.current, apiRef.current, webRef.current], {
        scale: 1.01,
        duration: 0.8,
        onComplete: () => {
          // API boots faster than DB, but needs DB. It attempts to connect and crashes!
          setApiState("crashed");
          setTerminalLog((prev) => prev + "\napi-service | Error: connect ECONNREFUSED 172.18.0.2:5432\napi-service | [CRASH] api-service exited with code 1.");
        }
      })
      .to({}, {
        duration: 0.6,
        onComplete: () => {
          // DB finishes booting afterward
          setDbState("healthy");
          setWebState("healthy");
          setTerminalLog((prev) => prev + "\ndb-server   | postgres:15 database is ready to accept connections.\n[WARNING] db-server is healthy but api-service remains crashed.");
        }
      });
    }

    setTimeline(tl);

    return () => {
      tl.kill();
    };
  }, [orchestrated]);

  const handleComposeUp = () => {
    useAnimationStore.getState().setPlaying(true);
  };

  return (
    <VisualCanvas
      objective="Simulate multi-container boot orchestration to understand how depends_on prevents API crash cascades."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            What is a crash cascade?
          </div>
          <p>
            When complex stacks are started concurrently, light service layers (like Node/Nginx APIs) finish loading in milliseconds, while heavy databases (like Postgres) take several seconds.
          </p>
          <p>
            Without boot dependencies defined, API clients throw `ECONNREFUSED` exceptions when they attempt to query database ports before they are open, resulting in crash cascades.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Simulation Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px]">
          
          <div className="w-full max-w-sm flex flex-col gap-4">
            
            {/* 1. Web Proxy service node */}
            <div ref={webRef} className="transition-all duration-350">
              <NodePrimitive
                label="web-server"
                status={webState === "healthy" ? "running" : webState === "booting" ? "running" : "idle"}
                icon={<Layers className="w-4 h-4 text-zinc-300" />}
                subtitle={webState === "healthy" ? "Listening on Port 80" : webState === "booting" ? "Booting Nginx proxy..." : "Offline"}
                className={cn(
                  "py-2.5 px-3.5 rounded-[12px]",
                  webState === "healthy" ? "border-zinc-800 bg-zinc-900/20 text-zinc-250" : ""
                )}
              />
            </div>

            {/* 2. API Backend service node */}
            <div ref={apiRef} className="transition-all duration-350">
              <NodePrimitive
                label="api-service"
                status={apiState === "healthy" ? "running" : apiState === "booting" ? "running" : "idle"}
                icon={<Layers className="w-4 h-4 text-zinc-300" />}
                subtitle={
                  apiState === "healthy" ? "Connected to DB" : 
                  apiState === "booting" ? "Booting Node process..." : 
                  apiState === "crashed" ? "CRASHED: ECONNREFUSED" : "Offline"
                }
                className={cn(
                  "py-2.5 px-3.5 rounded-[12px]",
                  apiState === "healthy" && "border-zinc-800 bg-zinc-900/20 text-zinc-250",
                  apiState === "crashed" && "border-red-500/20 bg-red-950/15"
                )}
              />
            </div>

            {/* 3. Database server service node */}
            <div ref={dbRef} className="transition-all duration-350">
              <NodePrimitive
                label="db-server"
                status={dbState === "healthy" ? "running" : dbState === "booting" ? "running" : "idle"}
                icon={<Layers className="w-4 h-4 text-zinc-300" />}
                subtitle={dbState === "healthy" ? "Accepting Queries" : dbState === "booting" ? "Initializing system files..." : "Offline"}
                className={cn(
                  "py-2.5 px-3.5 rounded-[12px]",
                  dbState === "healthy" ? "border-zinc-800 bg-zinc-900/20 text-zinc-250" : ""
                )}
              />
            </div>

          </div>
        </div>

        {/* Selected connection details inspector (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Sandbox Controller
            </span>
            <h4 className="text-sm font-extrabold text-white">Stack Orchestrator</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text">
              Toggle boot constraints, then click docker compose up.
            </p>
          </div>

          {/* Sync toggle */}
          <div className="p-3 rounded-[12px] border border-zinc-800/25 bg-[#0d0d0e] flex items-center justify-between select-none">
            <div className="flex flex-col pr-2">
              <span className="text-[11px] font-bold text-zinc-200">
                Orchestrated Boot Sequence
              </span>
              <span className="text-[8px] text-zinc-550 leading-normal mt-0.5">
                Forces sequential container startup.
              </span>
            </div>
            
            <button
              onClick={() => {
                setOrchestrated(!orchestrated);
                handleReset();
              }}
              disabled={animationState === "running"}
              className={cn(
                "relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40",
                orchestrated ? "bg-white" : "bg-zinc-800"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out",
                  orchestrated ? "translate-x-4 bg-black" : "translate-x-0 bg-white"
                )}
              />
            </button>
          </div>

          <button
            onClick={handleComposeUp}
            disabled={animationState === "running"}
            className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all border-0 disabled:opacity-40 cursor-pointer"
          >
            docker compose up
          </button>

          {/* Terminal log */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] overflow-hidden flex flex-col min-h-[90px] shadow-sm select-text">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0 select-none">
              <span className="text-[8px] font-mono text-zinc-500 font-bold">console stdout</span>
            </div>
            <div className="p-3 font-mono text-[9px] text-zinc-450 leading-relaxed overflow-y-auto flex-1 select-text">
              {terminalLog}
            </div>
          </div>

          {/* Warnings context */}
          {animationState === "completed" && (
            <div className={cn(
              "p-3 rounded-[12px] border text-[9.5px] leading-relaxed select-text",
              orchestrated 
                ? "border-zinc-800 bg-zinc-900/20 text-zinc-300" 
                : "border-red-955/20 bg-red-955/5 text-red-400"
            )}>
              {orchestrated ? (
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-zinc-455 shrink-0 mt-0.5" />
                  <span>Success! api-service waits for db-server health before starting, preventing auth errors.</span>
                </div>
              ) : (
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Crash cascade! Concurrent booting caused Node to query DB before database system files resolved.</span>
                </div>
              )}
            </div>
          )}

          {animationState !== "idle" && (
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
