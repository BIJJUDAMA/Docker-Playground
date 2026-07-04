import React, { useState, useEffect } from "react";
import { useAnimationStore } from "@/stores/animationStore";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ReplayButton() {
  const { activeTimeline, setPlaying } = useAnimationStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReplay = () => {
    if (activeTimeline) {
      setPlaying(false);
      activeTimeline.restart();
      setPlaying(true);
    }
  };

  const isDisabled = mounted ? !activeTimeline : true;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              onClick={handleReplay}
              disabled={isDisabled}
              className="w-10 h-10 rounded-[6px] border-zinc-805 bg-zinc-900 text-zinc-305 hover:text-white hover:bg-zinc-800 focus-visible:ring-1 focus-visible:ring-cyan-500 disabled:opacity-40 disabled:hover:bg-zinc-900 transition-colors"
              aria-label="Replay animation"
            >
              <RotateCcw className="w-4 h-4 text-zinc-300" />
            </Button>
          }
        />
        <TooltipContent className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs">
          Replay (R)
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
