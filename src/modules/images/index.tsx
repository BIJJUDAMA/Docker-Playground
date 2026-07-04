"use client";

import React, { useState } from "react";
import ExploreImage from "./components/ExploreImage";
import CreateContainers from "./components/CreateContainers";
import InsideContainer from "./components/InsideContainer";
import ContainerLifecycle from "./components/ContainerLifecycle";
import ImageVsContainer from "./components/ImageVsContainer";
import BehindScenes from "./components/BehindScenes";
import { cn } from "@/lib/utils";
import { useAnimationStore } from "@/stores/animationStore";

const STEPS = [
  { id: 0, label: "Explore the Image" },
  { id: 1, label: "Create Containers" },
  { id: 2, label: "Inside a Container" },
  { id: 3, label: "Container Lifecycle" },
  { id: 4, label: "Image vs Container" },
  { id: 5, label: "Behind the Scenes" }
];

export default function ImagesModule() {
  const [activeStep, setActiveStep] = useState(0);
  const { resetControls } = useAnimationStore();

  const handleStepChange = (stepId: number) => {
    setActiveStep(stepId);
    resetControls();
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-transparent font-sans">
      
      {/* Sub-step selection navigation */}
      <div className="px-6 pt-2 pb-0 border-b border-white/5 flex gap-2 overflow-x-auto shrink-0 bg-zinc-950/20 custom-scrollbar">
        {STEPS.map((step) => (
          <button
            key={step.id}
            onClick={() => handleStepChange(step.id)}
            className={cn(
              "text-xs font-semibold py-3 px-4 border-b-2 -mb-[1px] transition-all whitespace-nowrap focus:outline-none cursor-pointer",
              activeStep === step.id
                ? "border-[#FAFAFA] text-[#FAFAFA] font-bold"
                : "border-transparent text-zinc-550 hover:text-zinc-300"
            )}
          >
            {step.label}
          </button>
        ))}
      </div>

      {/* Render the active visualization component */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeStep === 0 && <ExploreImage />}
        {activeStep === 1 && <CreateContainers />}
        {activeStep === 2 && <InsideContainer />}
        {activeStep === 3 && <ContainerLifecycle />}
        {activeStep === 4 && <ImageVsContainer />}
        {activeStep === 5 && <BehindScenes />}
      </div>

    </div>
  );
}
