"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import ObjectExplorer from "./components/ObjectExplorer";
import EngineInternals from "./components/EngineInternals";
import CommandFlow from "./components/CommandFlow";
import { cn } from "@/lib/utils";
import { useAnimationStore } from "@/stores/animationStore";

const DockerArchitecture = dynamic(() => import("./components/DockerArchitecture"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-xs font-mono text-zinc-500 animate-pulse">
      Loading Docker Architecture Canvas...
    </div>
  ),
});

const STEPS = [
  { id: 0, label: "Docker Architecture" },
  { id: 1, label: "Docker Objects Explorer" },
  { id: 2, label: "Engine Internals" },
  { id: 3, label: "Command Flow" }
];

export default function FundamentalsModule() {
  const [activeStep, setActiveStep] = useState(0);
  const { resetControls } = useAnimationStore();

  const handleStepChange = (stepId: number) => {
    setActiveStep(stepId);
    resetControls();
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-transparent">
      
      {/* Sub-step selection navigation */}
      <div className="px-6 pt-2 pb-0 border-b border-white/5 flex gap-2 overflow-x-auto shrink-0 bg-zinc-950/20">
        {STEPS.map((step) => (
          <button
            key={step.id}
            onClick={() => handleStepChange(step.id)}
            className={cn(
              "text-xs font-semibold py-3 px-4 border-b-2 -mb-[1px] transition-all whitespace-nowrap focus:outline-none cursor-pointer",
              activeStep === step.id
                ? "border-[#FAFAFA] text-[#FAFAFA] font-bold"
                : "border-transparent text-zinc-500 hover:text-zinc-305"
            )}
          >
            {step.label}
          </button>
        ))}
      </div>

      {/* Render the active visualization component */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeStep === 0 && <DockerArchitecture />}
        {activeStep === 1 && <ObjectExplorer />}
        {activeStep === 2 && <EngineInternals />}
        {activeStep === 3 && <CommandFlow />}
      </div>

    </div>
  );
}
