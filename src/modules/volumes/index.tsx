"use client";

import React, { useEffect } from "react";
import DockerStorageMap from "./components/DockerStorageMap";
import FollowTheFile from "./components/FollowTheFile";
import DockerStorageInspector from "./components/DockerStorageInspector";
import DeleteSimulator from "./components/DeleteSimulator";
import { cn } from "@/lib/utils";
import { useAnimationStore } from "@/stores/animationStore";

const STEPS = [
  { id: 0, label: "Docker Storage Map" },
  { id: 1, label: "Follow The File" },
  { id: 2, label: "Docker Storage Inspector" },
  { id: 3, label: "Delete Simulator" }
];

export default function VolumesModule() {
  const { activeStep, setActiveStep, setMaxSteps, resetControls } = useAnimationStore();

  useEffect(() => {
    setMaxSteps(STEPS.length);
    setActiveStep(0);
  }, [setMaxSteps, setActiveStep]);

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
        {activeStep === 0 && <DockerStorageMap />}
        {activeStep === 1 && <FollowTheFile />}
        {activeStep === 2 && <DockerStorageInspector />}
        {activeStep === 3 && <DeleteSimulator />}
      </div>

    </div>
  );
}
