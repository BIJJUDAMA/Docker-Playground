"use client";

import React, { useState } from "react";
import CodeToProduction from "./components/CodeToProduction";
import MultiStageBuildVisualizer from "./components/MultiStageBuildVisualizer";
import DockerInProduction from "./components/DockerInProduction";
import CompleteSystemSimulation from "./components/CompleteSystemSimulation";
import { cn } from "@/lib/utils";
import { useAnimationStore } from "@/stores/animationStore";

const STEPS = [
  { id: 0, label: "From Code to Production" },
  { id: 1, label: "Multi-Stage Build Visualizer" },
  { id: 2, label: "Docker in Production" },
  { id: 3, label: "Complete System Simulation" }
];

export default function WrapupModule() {
  const [activeStep, setActiveStep] = useState(0);
  const { resetControls } = useAnimationStore();

  const handleStepChange = (stepId: number) => {
    setActiveStep(stepId);
    resetControls();
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-transparent font-sans">
      
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
                : "border-transparent text-zinc-550 hover:text-zinc-350"
            )}
          >
            {step.label}
          </button>
        ))}
      </div>

      {/* Render the active visualization component */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeStep === 0 && <CodeToProduction />}
        {activeStep === 1 && <MultiStageBuildVisualizer />}
        {activeStep === 2 && <DockerInProduction />}
        {activeStep === 3 && <CompleteSystemSimulation />}
      </div>

    </div>
  );
}
