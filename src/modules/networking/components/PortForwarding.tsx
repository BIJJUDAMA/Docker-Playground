"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, ShieldAlert, Laptop, HelpCircle } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";

export default function PortForwarding() {
  const [portMapped, setPortMapped] = useState<boolean>(false);
  const [requestSent, setRequestSent] = useState<boolean>(false);
  const [terminalLog, setTerminalLog] = useState("Click 'Send HTTP Request' in the sandbox panel to test.");

  const handleReset = useCallback(() => {
    setRequestSent(false);
    setTerminalLog("Click 'Send HTTP Request' in the sandbox panel to test.");
  }, []);

  const handleSend = () => {
    setRequestSent(true);
    if (portMapped) {
      setTerminalLog("curl http://192.168.1.50:8080\n\nHTTP/1.1 200 OK\nServer: nginx/1.25.1\n\n[SUCCESS] Welcome to your Docker container server!");
    } else {
      setTerminalLog("curl http://192.168.1.50:8080\n\ncurl: (7) Failed to connect to 192.168.1.50 port 8080: Connection refused\n[ERROR] Request dropped. No mapping exists.");
    }
  };

  return (
    <VisualCanvas
      objective="Trace network packet traversal and NAT redirection from host public interfaces to container ports."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-400" />
            What is port forwarding?
          </div>
          <p>
            Containers possess isolated network namespaces and cannot be reached directly from external networks.
          </p>
          <p>
            **Port Forwarding** maps host computer sockets (e.g. `8080`) to container ports (e.g. `80`). Docker creates internal iptables DNAT rules that redirect incoming public packets automatically.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Simulation Canvas (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px]">
          <div className="w-full max-w-lg h-72 relative flex flex-col justify-between py-2">
            {/* Pathway connections in background */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {/* Laptop client path down to host */}
              <line
                x1={72}
                y1={64}
                x2={72}
                y2={233}
                stroke={requestSent ? "#FAFAFA" : "#27272a"}
                strokeWidth="2"
                strokeDasharray={requestSent ? "0" : "4 4"}
                className="transition-colors duration-300"
              />
              
              {/* Host -> Container bridge connection path */}
              <line
                x1={72}
                y1={233}
                x2={432}
                y2={233}
                stroke={requestSent && portMapped ? "#FAFAFA" : requestSent ? "#ef4444" : "#27272a"}
                strokeWidth="2"
                strokeDasharray={requestSent && portMapped ? "0" : "4 4"}
                className="transition-colors duration-300"
              />
            </svg>

            {/* Floating Static packet status dot over paths */}
            {requestSent && (
              <div
                className={cn(
                  "absolute w-2.5 h-2.5 rounded-full transition-all duration-300 z-20 shadow-sm",
                  portMapped ? "bg-[#FAFAFA] shadow-[0_0_8px_#ffffff]" : "bg-red-500 shadow-[0_0_8px_#ef4444]",
                  "top-[228px] left-[251px]"
                )}
              />
            )}
            {/* Top Row: External Client laptop */}
            <div className="flex justify-start">
              <div className="w-36">
                <NodePrimitive
                  label="Client Laptop"
                  status={requestSent ? "running" : "idle"}
                  icon={<Laptop className="w-4 h-4 text-zinc-300" />}
                  subtitle="IP: 192.168.1.10"
                  className="py-2.5 px-3 rounded-[12px]"
                />
              </div>
            </div>

            {/* Bottom Row: Host System (Left) and Container (Right) */}
            <div className="flex justify-between items-center w-full">
              <div className="w-40 p-3.5 rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col gap-1.5 relative">
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-550">
                  Host Machine
                </span>
                <span className="text-[10px] font-bold text-zinc-350 font-mono">192.168.1.50</span>
                <div className="p-1.5 rounded-[6px] border border-zinc-800 bg-[#121214] font-mono text-[8px] text-zinc-450 flex items-center justify-between">
                  <span>Port 8080</span>
                  {portMapped ? (
                    <span className="text-zinc-200 font-bold">Mapped</span>
                  ) : (
                    <span className="text-zinc-600">Closed</span>
                  )}
                </div>
              </div>

              <div className="w-40 p-3.5 rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col gap-1.5 relative">
                <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-550">
                  Container Sandbox
                </span>
                <span className="text-[10px] font-bold text-zinc-300 font-mono">172.17.0.2</span>
                <div className="p-1.5 rounded-[6px] border border-zinc-800 bg-[#121214] font-mono text-[8px] text-zinc-450 flex items-center justify-between">
                  <span>Port 80 (nginx)</span>
                  <span className="text-zinc-400 font-bold">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mappings side controllers (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Sandbox Controller
            </span>
            <h4 className="text-sm font-extrabold text-white">Redirection config</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text">
              Toggle mapping configurations, then execute client HTTP TCP query routing instantly.
            </p>
          </div>

          {/* Mapped toggle */}
          <div className="p-3 rounded-[12px] border border-zinc-800/25 bg-[#0d0d0e] flex items-center justify-between select-none">
            <div className="flex flex-col pr-2">
              <span className="text-[11px] font-bold text-zinc-200">
                Publish Port 8080:80
              </span>
              <span className="text-[8px] text-zinc-550 leading-normal mt-0.5">
                Passes -p 8080:80 parameter.
              </span>
            </div>
            
            <button
              onClick={() => {
                setPortMapped(!portMapped);
                handleReset();
              }}
              className={cn(
                "relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                portMapped ? "bg-white" : "bg-zinc-800"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out",
                  portMapped ? "translate-x-4 bg-black" : "translate-x-0 bg-white"
                )}
              />
            </button>
          </div>

          <button
            onClick={handleSend}
            className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all border-0 cursor-pointer"
          >
            Send HTTP Request
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
          {requestSent && (
            <div className={cn(
              "p-3 rounded-[12px] border text-[9.5px] leading-relaxed select-text",
              portMapped 
                ? "border-zinc-800 bg-zinc-900/20 text-zinc-300" 
                : "border-red-950/20 bg-red-950/5 text-red-400"
            )}>
              {portMapped ? (
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Port mapping exists. Host socket translates packets to container namespaces seamlessly.</span>
                </div>
              ) : (
                <div className="flex items-start gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>Connection refused. Without port mappings (-p), container processes are unreachable outside host bounds.</span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </VisualCanvas>
  );
}
