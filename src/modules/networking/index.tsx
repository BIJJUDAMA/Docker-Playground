"use client";

import React, { useState } from "react";
import PortForwarding from "./components/PortForwarding";
import ContainerBridge from "./components/ContainerBridge";
import CustomNetwork from "./components/CustomNetwork";
import DockerDns from "./components/DockerDns";
import NetworkInspector from "./components/NetworkInspector";
import { cn } from "@/lib/utils";
import { useAnimationStore } from "@/stores/animationStore";

const STEPS = [
  { id: 0, label: "Port Forwarding" },
  { id: 1, label: "Multi-Container Bridge" },
  { id: 2, label: "Custom Network Subnets" },
  { id: 3, label: "DNS Name Resolution" },
  { id: 4, label: "Network Ingress Inspector" }
];

export default function NetworkingModule() {
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
        {activeStep === 0 && <PortForwarding />}
        {activeStep === 1 && <ContainerBridge />}
        {activeStep === 2 && <CustomNetwork />}
        {activeStep === 3 && <DockerDns />}
        {activeStep === 4 && <NetworkInspector />}
      </div>

    </div>
  );
}
