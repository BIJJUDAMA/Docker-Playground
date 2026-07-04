"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle, Network, Server, ArrowRight } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";

interface DnsStep {
  id: string;
  label: string;
  desc: string;
}

const DNS_STEPS: DnsStep[] = [
  { id: "query", label: "1. DNS query", desc: "web-1 sends name lookup query: 'Where is db-1?' to standard container resolver." },
  { id: "resolver", label: "2. 127.0.0.11 lookup", desc: "Built-in Docker resolver (127.0.0.11) inspects engine network mapping maps." },
  { id: "response", label: "3. DNS response", desc: "Resolver returns record mapping: 'db-1 is located at IP 172.20.0.4'." },
  { id: "direct", label: "4. Direct connection", desc: "web-1 initiates direct container-to-container connection query to 172.20.0.4." }
];

export default function DockerDns() {
  const [activeStepId, setActiveStepId] = useState<string>("query");
  const [terminalLog, setTerminalLog] = useState("web-1$ nslookup db-1\nQuerying default server 127.0.0.11...");

  const handleStepChange = (stepId: string) => {
    setActiveStepId(stepId);
    if (stepId === "query") {
      setTerminalLog("web-1$ nslookup db-1\nQuerying default server 127.0.0.11...");
    } else if (stepId === "resolver") {
      setTerminalLog("Docker DNS intercepting query on port 53...\nScanning active network namespace bridges...");
    } else if (stepId === "response") {
      setTerminalLog("Response from 127.0.0.11:\nName: db-1\nAddress: 172.20.0.4");
    } else {
      setTerminalLog("web-1$ curl postgres://db-1:5432\nRouting directly to target IP 172.20.0.4...\n\n[SUCCESS] Connected to db-1!");
    }
  };

  return (
    <VisualCanvas
      objective="Trace how Docker's built-in DNS resolver (127.0.0.11) automatically maps container names to active IP addresses."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-400" />
            What is Docker automatic DNS?
          </div>
          <p>
            When containers reside on the same custom network, you don't need to hardcode static IPs. Docker intercepts port 53 DNS requests.
          </p>
          <p>
            The built-in system resolver at `127.0.0.11` checks container names in local tables, returning their ephemeral internal IP automatically.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* DNS layout canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px]">
          
          <div className="w-full max-w-xl h-64 relative flex items-center justify-between px-6">
            
            {/* Connection vectors */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {/* web-1 -> DNS */}
              <line
                x1={96}
                y1={128}
                x2={290}
                y2={47}
                stroke={activeStepId === "resolver" || activeStepId === "query" || activeStepId === "response" ? "#FAFAFA" : "#27272a"}
                strokeWidth="2"
                strokeDasharray={(activeStepId === "resolver" || activeStepId === "query" || activeStepId === "response") ? "0" : "4 4"}
                className="transition-colors duration-300"
              />
              {/* web-1 -> db-1 */}
              <line
                x1={96}
                y1={128}
                x2={480}
                y2={128}
                stroke={activeStepId === "direct" ? "#FAFAFA" : "#27272a"}
                strokeWidth="2"
                strokeDasharray={activeStepId === "direct" ? "0" : "4 4"}
                className="transition-colors duration-300"
              />
            </svg>

            {/* Static packet status indicator over active connection */}
            {activeStepId === "resolver" && (
              <div className="absolute w-2.5 h-2.5 rounded-full bg-[#FAFAFA] shadow-[0_0_8px_#ffffff] top-[82px] left-[188px] z-20" />
            )}
            {activeStepId === "response" && (
              <div className="absolute w-2.5 h-2.5 rounded-full bg-[#FAFAFA] shadow-[0_0_8px_#ffffff] top-[82px] left-[188px] z-20" />
            )}
            {activeStepId === "direct" && (
              <div className="absolute w-2.5 h-2.5 rounded-full bg-[#FAFAFA] shadow-[0_0_8px_#ffffff] top-[123px] left-[283px] z-20 animate-pulse" />
            )}

            {/* Client web-1 (Left) */}
            <div className="w-36">
              <NodePrimitive
                label="web-1"
                status={activeStepId === "query" || activeStepId === "direct" ? "running" : "idle"}
                icon={<Network className="w-4 h-4 text-zinc-300" />}
                subtitle="172.20.0.2"
                className="py-3 px-3 rounded-[12px]"
              />
            </div>

            {/* Docker DNS Resolver (Middle Top) */}
            <div className="absolute left-[210px] top-[15px] w-40">
              <NodePrimitive
                label="Docker DNS"
                status={activeStepId === "resolver" ? "running" : "idle"}
                icon={<Server className="w-4 h-4 text-zinc-300" />}
                subtitle="127.0.0.11:53"
                className="py-2.5 px-3 rounded-[12px]"
              />
            </div>

            {/* Target db-1 (Right) */}
            <div className="w-36">
              <NodePrimitive
                label="db-1"
                status={activeStepId === "direct" ? "running" : "idle"}
                icon={<Network className="w-4 h-4 text-zinc-300" />}
                subtitle="172.20.0.4"
                className="py-3 px-3 rounded-[12px]"
              />
            </div>

          </div>
        </div>

        {/* DNS Steps inspector (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              DNS Query Steps
            </span>
            <h4 className="text-sm font-extrabold text-white">Name Resolution Flow</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text">
              Click on each step below to trace the local DNS mapping pathway.
            </p>
          </div>

          {/* Checklist timeline */}
          <div className="flex flex-col gap-2 select-none font-sans">
            {DNS_STEPS.map((step) => {
              const isActive = activeStepId === step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepChange(step.id)}
                  className={cn(
                    "p-2.5 rounded-[9px] border text-[9.5px] text-left transition-all cursor-pointer block w-full",
                    isActive 
                      ? "border-zinc-700 bg-zinc-800 text-zinc-100 font-bold shadow-sm" 
                      : "border-transparent bg-zinc-950/20 text-zinc-500 hover:bg-zinc-900/40"
                  )}
                >
                  <div className="font-bold flex items-center gap-1 font-sans">
                    <ArrowRight className={cn("w-3 h-3 shrink-0", isActive ? "text-white" : "text-zinc-650")} />
                    {step.label}
                  </div>
                  {isActive && (
                    <p className="text-zinc-350 mt-1 select-text font-normal leading-relaxed">{step.desc}</p>
                  )}
                </button>
              );
            })}
          </div>

          {/* Terminal log */}
          <div className="rounded-[12px] border border-zinc-855 bg-[#0d0d0e] overflow-hidden flex flex-col min-h-[90px] shadow-sm select-text mt-auto">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0 select-none">
              <span className="text-[8px] font-mono text-zinc-500 font-bold">console stdout</span>
            </div>
            <div className="p-3 font-mono text-[9px] text-zinc-450 leading-relaxed overflow-y-auto flex-1 select-text">
              {terminalLog}
            </div>
          </div>
        </div>

      </div>
    </VisualCanvas>
  );
}
