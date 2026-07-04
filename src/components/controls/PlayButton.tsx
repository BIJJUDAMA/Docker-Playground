"use client";

import { useAnimationStore } from "@/stores/animationStore";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PlayButton() {
  const { isPlaying, setPlaying } = useAnimationStore();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPlaying(!isPlaying)}
              className="w-10 h-10 rounded-lg border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 focus-visible:ring-1 focus-visible:ring-cyan-500 transition-colors"
              aria-label={isPlaying ? "Pause animation" : "Play animation"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-zinc-300 text-zinc-300" />
              ) : (
                <Play className="w-4 h-4 fill-zinc-300 text-zinc-300 ml-0.5" />
              )}
            </Button>
          }
        />
        <TooltipContent className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs">
          {isPlaying ? "Pause (Space)" : "Play (Space)"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
