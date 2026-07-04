"use client";

import { useAnimationStore } from "@/stores/animationStore";
import { Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SPEEDS = [0.5, 1.0, 1.5, 2.0];

export default function SpeedControl() {
  const { speed, setSpeed } = useAnimationStore();

  const cycleSpeed = () => {
    const currentIndex = SPEEDS.indexOf(speed);
    const nextIndex = (currentIndex + 1) % SPEEDS.length;
    setSpeed(SPEEDS[nextIndex]);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              onClick={cycleSpeed}
              className="h-10 px-3 rounded-lg border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 focus-visible:ring-1 focus-visible:ring-cyan-500 font-mono text-xs flex items-center gap-1.5 min-w-[70px] justify-center transition-colors"
              aria-label={`Change animation speed, current speed is ${speed}x`}
            >
              <Gauge className="w-3.5 h-3.5 text-zinc-400" />
              <span>{speed.toFixed(1)}x</span>
            </Button>
          }
        />
        <TooltipContent className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs">
          Cycle Speed (S)
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
