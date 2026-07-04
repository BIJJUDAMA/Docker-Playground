"use client";

import React, { useState } from "react";
import BuildImage from "./components/BuildImage";
import ExploreImage from "./components/ExploreImage";
import CreateContainers from "./components/CreateContainers";
import InsideContainer from "./components/InsideContainer";
import ContainerLifecycle from "./components/ContainerLifecycle";
import Persistence from "./components/Persistence";
import ImageVsContainer from "./components/ImageVsContainer";
import BehindScenes from "./components/BehindScenes";
import { cn } from "@/lib/utils";
import { useAnimationStore } from "@/stores/animationStore";

const STEPS = [
  { id: 0, label: "1. Build the Image" },
  { id: 1, label: "2. Explore the Image" },
  { id: 2, label: "3. Create Containers" },
  { id: 3, label: "4. Inside a Container" },
  { id: 4, label: "5. Container Lifecycle" },
  { id: 5, label: "6. Persistence" },
  { id: 6, label: "7. Image vs Container" },
  { id: 7, label: "8. Behind the Scenes" }
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
        {activeStep === 0 && <BuildImage />}
        {activeStep === 1 && <ExploreImage />}
        {activeStep === 2 && <CreateContainers />}
        {activeStep === 3 && <InsideContainer />}
        {activeStep === 4 && <ContainerLifecycle />}
        {activeStep === 5 && <Persistence />}
        {activeStep === 6 && <ImageVsContainer />}
        {activeStep === 7 && <BehindScenes />}
      </div>

    </div>
  );
}
