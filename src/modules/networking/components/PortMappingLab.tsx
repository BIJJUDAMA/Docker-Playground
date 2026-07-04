"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle, RefreshCw, Box, ArrowRight, ShieldAlert, CheckCircle2, Play } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";
import { NodePrimitive } from "@/components/primitives/NodePrimitive";

interface PortContainer {
  id: string;
  name: string;
  internalPort: number;
  hostPort: string; // empty string = unmapped
}

export default function PortMappingLab() {
  const [containers, setContainers] = useState<PortContainer[]>([
    { id: "front", name: "web-front", internalPort: 80, hostPort: "" },
    { id: "back", name: "api-service", internalPort: 8080, hostPort: "" },
    { id: "admin", name: "admin-panel", internalPort: 9000, hostPort: "" }
  ]);

  const [queryPortInput, setQueryPortInput] = useState<string>("");
  const [testResult, setTestResult] = useState<string>("Enter a mapped Host port below and click 'Send' to query container services.");
  const [activeAnimId, setActiveAnimId] = useState<string | null>(null);

  const handleUpdatePort = (id: string, val: string) => {
    // Filter numeric inputs only
    const cleanVal = val.replace(/\D/g, "");
    setContainers(prev => prev.map(c => 
      c.id === id ? { ...c, hostPort: cleanVal } : c
    ));
    setTestResult("Port mappings updated. Query host interface to test.");
  };

  const handleReset = () => {
    setContainers([
      { id: "front", name: "web-front", internalPort: 80, hostPort: "" },
      { id: "back", name: "api-service", internalPort: 8080, hostPort: "" },
      { id: "admin", name: "admin-panel", internalPort: 9000, hostPort: "" }
    ]);
    setQueryPortInput("");
    setTestResult("Enter a mapped Host port below and click 'Send' to query container services.");
    setActiveAnimId(null);
  };

  // Check conflicts (duplicate non-empty host ports)
  const getPortConflicts = (): string[] => {
    const ports = containers.map(c => c.hostPort).filter(p => p !== "");
    const duplicates = ports.filter((item, index) => ports.indexOf(item) !== index);
    return Array.from(new Set(duplicates));
  };

  const conflicts = getPortConflicts();

  const handleTestQuery = () => {
    if (!queryPortInput) return;
    
    // Check conflicts first
    if (conflicts.includes(queryPortInput)) {
      setTestResult(`[FAILURE] Bind failed! Host port ${queryPortInput} is double-allocated. Docker daemon crashed on bind syscall.`);
      setActiveAnimId("conflict");
      return;
    }

    // Match container mapped to this host port
    const matched = containers.find(c => c.hostPort === queryPortInput);
    
    if (matched) {
      setActiveAnimId(matched.id);
      if (matched.id === "front") {
        setTestResult(`[200 OK] -> Successfully loaded landing page from web-front container! (Host ${queryPortInput} forwarded to Container 80)`);
      } else if (matched.id === "back") {
        setTestResult(`[200 OK] -> Successfully reached backend endpoints on api-service! (Host ${queryPortInput} forwarded to Container 8080)`);
      } else {
        setTestResult(`[200 OK] -> Loaded security dashboard from admin-panel! (Host ${queryPortInput} forwarded to Container 9000)`);
      }
    } else {
      setActiveAnimId("not_found");
      setTestResult(`[404 NOT FOUND] -> Connection refused. Host port ${queryPortInput} is unallocated.`);
    }
  };

  return (
    <VisualCanvas
      objective="Bind host interfaces to container ports and prevent port mapping allocation conflicts."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Port Binding Lab
          </div>
          <p>
            By default, container ports are hidden inside virtual namespaces. To access them, you must map a **Host Port** to the container's internal port (e.g. `8080:80`).
          </p>
          <p>
            *Port Conflict Rule*: You cannot map the same host port to two active containers simultaneously (e.g., binding both Frontend and Backend to host port `8080`), as only one socket can bind to a port on the host interface.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Port Mapping visual panel (Left) */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px] overflow-hidden">
          
          <div className="w-full max-w-sm flex flex-col gap-3 relative z-10 py-2">
            
            {/* Host interface title */}
            <div className="flex justify-between items-center text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-550 border-b border-zinc-850 pb-2">
              <span>Host Machine interface</span>
              <span>Container Port mapping bounds</span>
            </div>

            {/* Containers Row */}
            <div className="flex flex-col gap-3.5">
              {containers.map((c) => {
                const hasConflict = conflicts.includes(c.hostPort);
                const isCurrentlyActive = activeAnimId === c.id;

                return (
                  <div 
                    key={c.id}
                    className={cn(
                      "p-3 rounded-[12px] border bg-[#0d0d0e] flex items-center justify-between transition-all duration-300",
                      hasConflict 
                        ? "border-red-950/20 bg-red-950/5 text-red-400"
                        : isCurrentlyActive
                          ? "border-white bg-white/5 text-white font-bold scale-[1.02] shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                          : "border-zinc-850 text-zinc-400"
                    )}
                  >
                    {/* Left: Input Host port mapping */}
                    <div className="flex flex-col gap-1 select-text">
                      <label className="text-[7px] uppercase font-bold text-zinc-550 block">Host Port Mapping</label>
                      <input
                        type="text"
                        placeholder="unmapped"
                        maxLength={5}
                        value={c.hostPort}
                        onChange={(e) => handleUpdatePort(c.id, e.target.value)}
                        className="w-16 py-1 px-1.5 rounded-[5px] bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-white text-center font-bold focus:outline-none focus:border-zinc-650"
                      />
                    </div>

                    {/* Arrow direction */}
                    <ArrowRight className={cn("w-3.5 h-3.5", isCurrentlyActive ? "text-white animate-pulse" : "text-zinc-700")} />

                    {/* Right: Container internal Node */}
                    <div className="w-40 select-none">
                      <NodePrimitive
                        label={c.name}
                        status={isCurrentlyActive ? "running" : "idle"}
                        icon={<Box className="w-3.5 h-3.5 text-zinc-300 animate-pulse" />}
                        subtitle={`Internal Port: ${c.internalPort}`}
                        className="py-1 rounded-[8px]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Selected query and error info panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Host Query Console
            </span>
            <h4 className="text-sm font-extrabold text-white">localhost tester</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text">
              Simulate host web requests targeting specific mapped port numbers.
            </p>
          </div>

          {/* Browser search URL mock */}
          <div className="p-3 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 flex flex-col gap-1.5 font-sans select-none">
            <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-zinc-550 block mb-0.5">Browser client address:</span>
            
            <div className="flex gap-2">
              <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-[6px] px-2.5 py-1.5 flex items-center gap-1 text-[10px] font-mono text-zinc-350 select-text">
                <span className="text-zinc-550">http://localhost:</span>
                <input
                  type="text"
                  placeholder="8080"
                  maxLength={5}
                  value={queryPortInput}
                  onChange={(e) => setQueryPortInput(e.target.value.replace(/\D/g, ""))}
                  className="bg-transparent border-0 text-white font-bold w-12 focus:outline-none focus:ring-0 leading-none"
                />
              </div>
              <button
                onClick={handleTestQuery}
                disabled={!queryPortInput}
                className="py-1 px-3 rounded-[6px] text-[10px] font-bold bg-white text-black hover:bg-zinc-200 disabled:opacity-40 border-0 cursor-pointer flex items-center justify-center"
              >
                Go
              </button>
            </div>
          </div>

          {/* Test query details output */}
          <div className="rounded-[12px] border border-zinc-850 bg-[#0d0d0e] flex flex-col min-h-[90px] overflow-hidden select-text font-sans">
            <div className="bg-[#1a1a1e] px-3.5 py-1.5 border-b border-zinc-850 flex items-center shrink-0">
              <span className="text-[7.5px] font-mono text-zinc-550 font-bold">Query response logs:</span>
            </div>
            <div className={cn(
              "p-3 font-mono text-[9px] leading-relaxed flex-1 overflow-y-auto",
              activeAnimId === "conflict" || activeAnimId === "not_found" ? "text-red-405" : "text-zinc-300"
            )}>
              {testResult}
            </div>
          </div>

          {/* Conflict warnings */}
          {conflicts.length > 0 && (
            <div className="p-3.5 rounded-[12px] bg-red-950/5 border border-red-500/15 text-[8.5px] text-red-405 leading-normal flex items-start gap-2 animate-fadeIn select-text font-sans">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                **PORT BIND CONFLICT!** Host port **{conflicts.join(", ")}** is assigned to multiple containers. docker-run will crash due to address-already-in-use socket errors.
              </span>
            </div>
          )}

          {activeAnimId !== null && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Lab
            </button>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
