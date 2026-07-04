"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import { cn } from "@/lib/utils";
import { CheckCircle2, ShieldAlert, Settings, HelpCircle } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { useAnimationStore } from "@/stores/animationStore";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";
import { PacketPrimitive } from "@/components/primitives/PacketPrimitive";

export default function EnvironmentVariables() {
  const [configSynced, setConfigSynced] = useState<boolean>(true);
  const [animationState, setAnimationState] = useState<"idle" | "running" | "completed">("idle");
  const [terminalLog, setTerminalLog] = useState("Click 'Test Database Connection' in the sandbox panel to test.");

  const containerRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<HTMLDivElement>(null);
  const [timeline, setTimeline] = useState<gsap.core.Timeline | null>(null);

  useAnimationControls(timeline);

  const handleReset = useCallback(() => {
    setAnimationState("idle");
    setTerminalLog("Click 'Test Database Connection' in the sandbox panel to test.");

    useAnimationStore.getState().setPlaying(false);
    useAnimationStore.getState().setProgress(0);

    if (timeline) {
      timeline.pause().progress(0);
    }

    gsap.set(packetRef.current, { scale: 0, opacity: 0, x: 0 });
  }, [timeline]);

  // Build the timeline whenever configSynced changes
  useEffect(() => {
    // Reset states first
    setAnimationState("idle");
    setTerminalLog("Click 'Test Database Connection' in the sandbox panel to test.");
    gsap.set(packetRef.current, { scale: 0, opacity: 0, x: 0 });

    const tl = gsap.timeline({
      paused: true,
      onStart: () => {
        setAnimationState("running");
        setTerminalLog("node-api$ node connect.js\nReading process.env.DB_PASSWORD...\nConnecting to database...");
        gsap.set(packetRef.current, { x: 0, opacity: 1, scale: 1, backgroundColor: "#FAFAFA" });
      },
      onComplete: () => {
        setAnimationState("completed");
        if (configSynced) {
          setTerminalLog("node-api$ node connect.js\nConnecting to db:5432...\n[SUCCESS] Authentication verified. Handshake completed.");
        } else {
          setTerminalLog("node-api$ node connect.js\nConnecting to db:5432...\nFATAL: password authentication failed for user 'postgres'\n[ERROR] Authentication rejected.");
        }
      }
    });

    if (configSynced) {
      tl.to(packetRef.current, {
        x: 230,
        duration: 1.0,
        ease: "power2.inOut"
      });
    } else {
      tl.to(packetRef.current, {
        x: 115,
        duration: 0.5,
        ease: "power1.out"
      })
      .to(packetRef.current, {
        scale: 1.3,
        backgroundColor: "#ef4444",
        duration: 0.15
      })
      .to(packetRef.current, {
        x: 0,
        opacity: 0,
        duration: 0.5,
        ease: "power1.in"
      });
    }

    setTimeline(tl);

    return () => {
      tl.kill();
    };
  }, [configSynced]);

  const handleTest = () => {
    useAnimationStore.getState().setPlaying(true);
  };

  return (
    <VisualCanvas
      objective="Understand how environment variables are propagated from compose config wrappers to isolate runtime passwords."
      timeline={timeline}
      onStepBack={handleReset}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            What are Environment Variables?
          </div>
          <p>
            You should never hardcode passwords inside Dockerfiles or codebase source control repositories.
          </p>
          <p>
            **Environment Variables** let you pass configurations down to running processes dynamically. When passwords mismatch between the API client container and the database server container, network authentications fail.
          </p>
        </div>
      }
    >
      <div ref={containerRef} className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Environment variables mapping canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px]">
          
          {/* Connection vectors */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <line x1={150} y1={135} x2={370} y2={135} stroke="#1a1a1e" strokeWidth="1.5" strokeDasharray="4 4" />
          </svg>

          {/* Glowing packet */}
          <PacketPrimitive
            ref={packetRef}
            color="#FAFAFA"
            size={11}
            className="top-[129px] left-[105px] z-20"
          />

          <div className="w-full max-w-sm h-56 relative flex justify-between items-center">
            {/* API container (Left) */}
            <div className="w-36 flex flex-col gap-1.5">
              <span className="text-[7px] text-zinc-500 uppercase font-bold text-center block mb-1">
                API Service
              </span>
              <NodePrimitive
                label="node-api"
                status={animationState === "running" ? "running" : "idle"}
                icon={<Settings className="w-4 h-4 text-zinc-300" />}
                subtitle="Port 3000"
                className="py-3 px-3 rounded-[12px]"
              />
              <div className="p-2.5 rounded-[12px] border border-zinc-850 bg-[#0d0d0e] font-mono text-[8px] text-zinc-400 select-text leading-normal">
                <span className="text-zinc-500 block mb-0.5 font-bold uppercase text-[7px] select-none">env properties</span>
                DB_PASS=secret
              </div>
            </div>

            {/* Database container (Right) */}
            <div className="w-36 flex flex-col gap-1.5">
              <span className="text-[7px] text-zinc-500 uppercase font-bold text-center block mb-1">
                Database Server
              </span>
              <NodePrimitive
                label="postgres-db"
                status={animationState === "completed" && configSynced ? "running" : "idle"}
                icon={<Settings className="w-4 h-4 text-zinc-300" />}
                subtitle="Port 5432"
                className="py-3 px-3 rounded-[12px]"
              />
              <div className="p-2.5 rounded-[12px] border border-zinc-850 bg-[#0d0d0e] font-mono text-[8px] text-zinc-450 select-text leading-normal">
                <span className="text-zinc-500 block mb-0.5 font-bold uppercase text-[7px] select-none">env properties</span>
                POSTGRES_PASS=<span className={cn(configSynced ? "text-zinc-300" : "text-red-500 font-bold")}>
                  {configSynced ? "secret" : "admin123"}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Sync controllers (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Configuration Controller
            </span>
            <h4 className="text-sm font-extrabold text-white">Database Credentials</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text">
              Toggle password synchronization, then test connections.
            </p>
          </div>

          {/* Sync toggle */}
          <div className="p-3 rounded-[12px] border border-zinc-800/25 bg-[#0d0d0e] flex items-center justify-between select-none">
            <div className="flex flex-col pr-2">
              <span className="text-[11px] font-bold text-zinc-200">
                Synchronized Passwords
              </span>
              <span className="text-[8px] text-zinc-550 leading-normal mt-0.5">
                Keep API and DB passwords identical.
              </span>
            </div>
            
            <button
              onClick={() => {
                setConfigSynced(!configSynced);
                handleReset();
              }}
              disabled={animationState === "running"}
              className={cn(
                "relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40",
                configSynced ? "bg-white" : "bg-zinc-800"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out",
                  configSynced ? "translate-x-4 bg-black" : "translate-x-0 bg-white"
                )}
              />
            </button>
          </div>

          <button
            onClick={handleTest}
            disabled={animationState === "running"}
            className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-250 transition-all border-0 disabled:opacity-40 cursor-pointer"
          >
            Test Database Connection
          </button>

          {/* Terminal log */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] overflow-hidden flex flex-col min-h-[90px] shadow-sm select-text">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0 select-none">
              <span className="text-[8px] font-mono text-zinc-500">console stdout</span>
            </div>
            <div className="p-3 font-mono text-[9px] text-zinc-450 leading-relaxed overflow-y-auto flex-1 select-text">
              {terminalLog}
            </div>
          </div>

          {/* Warnings context */}
          {animationState === "completed" && (
            <div className={cn(
              "p-3 rounded-[12px] border text-[9.5px] leading-relaxed select-text",
              configSynced 
                ? "border-zinc-800 bg-zinc-900/20 text-zinc-300" 
                : "border-red-955/20 bg-red-950/5 text-red-400"
            )}>
              {configSynced ? (
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-zinc-455 shrink-0 mt-0.5" />
                  <span>Success! Both processes share the matching configuration key. Handshake succeeded.</span>
                </div>
              ) : (
                <div className="flex items-start gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Failed connection. Postgres rejects auth query because host password does not match.</span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </VisualCanvas>
  );
}
