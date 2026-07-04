import React, { useState, useEffect } from "react";
import { useAnimationStore } from "@/stores/animationStore";
import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ResetButton() {
  const { activeTimeline, setPlaying, setProgress } = useAnimationStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReset = () => {
    if (activeTimeline) {
      setPlaying(false);
      activeTimeline.pause().progress(0);
      setProgress(0);
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
              onClick={handleReset}
              disabled={isDisabled}
              className="w-10 h-10 rounded-[6px] border-zinc-805 bg-zinc-900 text-zinc-305 hover:text-white hover:bg-zinc-800 focus-visible:ring-1 focus-visible:ring-cyan-500 disabled:opacity-40 disabled:hover:bg-zinc-900 transition-colors"
              aria-label="Reset animation"
            >
              <Square className="w-3.5 h-3.5 fill-zinc-300 text-zinc-300" />
            </Button>
          }
        />
        <TooltipContent className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs">
          Reset (Esc)
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
