"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle, RefreshCw, Layers, HardDrive, Folder, Box, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import VisualCanvas from "@/components/layout/VisualCanvas";

interface Scenario {
  id: string;
  title: string;
  desc: string;
  correctOption: "none" | "named" | "bind" | "anon";
  recommendation: string;
  consequences: Record<"none" | "named" | "bind" | "anon", string>;
}

const SCENARIOS: Scenario[] = [
  {
    id: "react",
    title: "React Source Code Development",
    desc: "You are writing React source components. You want code changes made in your local text editor to instantly refresh the webpage inside the running container without rebuilding the image.",
    correctOption: "bind",
    recommendation: "Bind mounts map host folders directly. Editing host files modifies the container files instantly, triggering the dev server's file watcher (Hot Reloading).",
    consequences: {
      none: "Failure! You have to run 'docker build' and recreate the container on every single line edit, slowing dev loops down to a crawl.",
      named: "Sub-optimal! Named volumes are isolated in Docker storage paths. You cannot easily access and edit files using your local host VS Code editor.",
      bind: "Perfect Success! Your React hot-reload watcher triggers immediately on local VS Code file saves. Zero image builds needed.",
      anon: "Failure! Anonymous volumes generate random hashed subfolders. Hard to access from host, and reset completely on deletion."
    }
  },
  {
    id: "postgres",
    title: "PostgreSQL Production Database",
    desc: "You are setting up PostgreSQL for a production server. The database writes critical transaction records, and you must guarantee data survives if pg-container crashes or is upgraded.",
    correctOption: "named",
    recommendation: "Named volumes are managed completely by Docker. They run at native host write speeds, handle storage backups cleanly, and decouple data from container lifecycles.",
    consequences: {
      none: "DISASTER! Container crashed and was recreated. Writable layer was purged and ALL production databases vanished forever.",
      named: "Perfect Success! Decoupled Named volume holds database files securely. You can delete or upgrade PostgreSQL container versions safely.",
      bind: "Sub-optimal! Bind mounting production DBs creates permission errors as host/container user IDs don't match. Hard to manage database backups.",
      anon: "Risky! Anonymous volumes survive container stop, but are easily purged by 'docker system prune' or if run with --rm flags."
    }
  },
  {
    id: "redis",
    title: "Redis Temporary Cache",
    desc: "You are running Redis as an in-memory session cache for a shopping cart. Cache data is temporary, and losing it during container upgrades is perfectly fine.",
    correctOption: "none",
    recommendation: "No volume required. Using container local storage is the most stateless path when persistence is completely unnecessary.",
    consequences: {
      none: "Perfect Success! Redis cache is stateless. Deleting the container cleans cache records cleanly from host disk, avoiding storage leaks.",
      named: "Overkill! Allocating a permanent named volume leaves orphan storage files on your host machine when Redis containers are deleted.",
      bind: "Overkill! Unnecessary overhead mapping host paths to ephemeral cache nodes.",
      anon: "Overkill! Creates unreferenced anonymous folders on disk."
    }
  },
  {
    id: "nginx",
    title: "Nginx Static Web Server",
    desc: "You are hosting a static landing page HTML using Nginx. You want to test the site locally by swapping HTML folders on your host without entering the container terminal.",
    correctOption: "bind",
    recommendation: "Bind mounting host source directories maps static index.html pages directly, allowing immediate updates on browser refreshes.",
    consequences: {
      none: "Failure! You cannot edit HTML files directly from your host. You would need to copy files manually via 'docker cp' on every edit.",
      named: "Sub-optimal! Named volumes store files inside internal system paths, making it hard to edit HTML directly using your local editor.",
      bind: "Perfect Success! Replacing HTML files in your local directory updates the static Nginx server output instantly on browser refresh.",
      anon: "Failure! Hard to locate anonymous folders for static swapping."
    }
  }
];

export default function StorageDecisionLab() {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<"none" | "named" | "bind" | "anon" | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const scenario = SCENARIOS[activeScenarioIdx];
  const isCorrect = selectedAnswer === scenario.correctOption;

  const handleSelectOption = (option: typeof selectedAnswer) => {
    if (submitted) return;
    setSelectedAnswer(option);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setSubmitted(true);
  };

  const handleNext = () => {
    setActiveScenarioIdx((prev) => (prev + 1) % SCENARIOS.length);
    setSelectedAnswer(null);
    setSubmitted(false);
  };

  const handleReset = () => {
    setActiveScenarioIdx(0);
    setSelectedAnswer(null);
    setSubmitted(false);
  };

  return (
    <VisualCanvas
      objective="Apply persistent storage choices to real-world deployment challenges: React development, database reliability, and cache management."
      timeline={null}
      explanation={
        <div className="flex flex-col gap-2.5 font-sans">
          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
            <HelpCircle className="w-4 h-4 text-zinc-450" />
            Storage Decision Lab
          </div>
          <p>
            Test your knowledge of volumes. Select the correct storage category for each deployment scenario.
          </p>
          <p>
            Observe the simulation consequences to discover why production architectures favor specific configurations.
          </p>
        </div>
      }
    >
      <div className="w-full flex-1 flex flex-col md:flex-row items-stretch justify-start gap-6 min-h-0 select-none font-sans">
        
        {/* Challenge scenario card (Left) */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 border border-zinc-800/40 bg-[#121214] rounded-[18px] relative shadow-sm min-h-[350px]">
          
          <div className="w-full max-w-md flex flex-col gap-4 select-text">
            
            {/* Header scenario progress */}
            <div className="flex justify-between items-center px-1 font-mono text-[8px] text-zinc-550 font-bold">
              <span>Challenge Scenario {activeScenarioIdx + 1} of {SCENARIOS.length}</span>
              <span className="uppercase tracking-widest">Storage choice</span>
            </div>

            {/* Main Scenario details */}
            <div className="p-4 bg-[#0d0d0e] rounded-[12px] border border-zinc-850 flex flex-col gap-2.5 shadow-inner">
              <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5 font-sans">
                {activeScenarioIdx === 0 && <Folder className="w-4 h-4 text-zinc-450" />}
                {activeScenarioIdx === 1 && <HardDrive className="w-4 h-4 text-zinc-450" />}
                {activeScenarioIdx === 2 && <Layers className="w-4 h-4 text-zinc-450" />}
                {activeScenarioIdx === 3 && <Box className="w-4 h-4 text-zinc-450" />}
                {scenario.title}
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                {scenario.desc}
              </p>
            </div>

            {/* Answer Options Grid */}
            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono font-bold select-none">
              {(["named", "bind", "anon", "none"] as const).map((opt) => {
                const isSelected = selectedAnswer === opt;
                return (
                  <button
                    key={opt}
                    disabled={submitted}
                    onClick={() => handleSelectOption(opt)}
                    className={cn(
                      "py-2.5 px-3 rounded-[9px] border text-left flex flex-col gap-0.5 transition-all cursor-pointer disabled:pointer-events-none",
                      isSelected
                        ? "bg-white text-black border-transparent shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                        : "bg-[#0d0d0e] border-zinc-850 text-zinc-450 hover:text-zinc-200"
                    )}
                  >
                    <span className="text-[7.5px] uppercase tracking-wider block opacity-75">
                      {opt === "none" ? "No mount" : opt === "named" ? "Volume" : opt === "bind" ? "Bind Mount" : "Anon Volume"}
                    </span>
                    <span className="truncate max-w-full">
                      {opt === "none" ? "Container Layer" : opt === "named" ? "Named Volume" : opt === "bind" ? "Host Folder" : "Anonymous Volume"}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

        </div>

        {/* Challenge status and feedback panel (Right) */}
        <div className="w-full md:w-80 p-5 rounded-[18px] border border-zinc-800/40 bg-[#121214] flex flex-col gap-4 relative shrink-0 shadow-sm animate-fadeIn">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-450 font-bold block mb-1">
              Feedback Console
            </span>
            <h4 className="text-sm font-extrabold text-white">Simulation Output</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal mt-2 select-text">
              Submit your answer to watch the system consequences.
            </p>
          </div>

          <div className="flex flex-col gap-2 flex-1 justify-center select-none font-sans">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="w-full py-2.5 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-all border-0 cursor-pointer flex items-center justify-center gap-1"
              >
                Submit Storage Choice
              </button>
            ) : (
              <div className="flex flex-col gap-3 animate-fadeIn">
                
                {/* Result icon badge */}
                <div className="flex items-center gap-2 p-3 rounded-[12px] bg-[#0d0d0e] border border-zinc-850">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-extrabold text-white">CORRECT ANSWER!</span>
                        <span className="text-[8px] text-zinc-550 font-mono">Score +10 points</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-extrabold text-red-400">INCORRECT CHOICE</span>
                        <span className="text-[8px] text-zinc-550 font-mono">Simulated Failure</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Consequences feedback text */}
                <div className="p-3.5 rounded-[12px] bg-[#0d0d0e] border border-zinc-800/25 text-[9px] leading-relaxed text-zinc-450 select-text">
                  <span className="font-bold text-zinc-200 block mb-1">Consequence trace:</span>
                  {selectedAnswer && scenario.consequences[selectedAnswer]}
                </div>

                {/* Docker Recommendation */}
                {isCorrect && (
                  <div className="p-3.5 rounded-[12px] bg-white/5 border border-white/10 text-[9px] leading-relaxed text-zinc-300 select-text">
                    <span className="font-bold text-white flex items-center gap-1 mb-1">
                      <ShieldCheck className="w-4 h-4 text-zinc-400" />
                      Production recommendation:
                    </span>
                    {scenario.recommendation}
                  </div>
                )}

                <button
                  onClick={handleNext}
                  className="w-full py-2 rounded-[9px] text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all border-0 cursor-pointer"
                >
                  Next Challenge
                </button>

              </div>
            )}
          </div>

          {submitted && (
            <button
              onClick={handleReset}
              className="w-full bg-[#1a1a1e] border border-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs font-bold py-2 rounded-[9px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Quiz Lab
            </button>
          )}

        </div>

      </div>
    </VisualCanvas>
  );
}
