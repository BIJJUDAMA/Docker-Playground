"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAnimationControls } from "@/hooks/useAnimationControls";
import PlayButton from "../controls/PlayButton";
import ReplayButton from "../controls/ReplayButton";
import ResetButton from "../controls/ResetButton";
import SpeedControl from "../controls/SpeedControl";
import NavControls from "../controls/NavControls";
import { useAnimationStore } from "@/stores/animationStore";
import { cn } from "@/lib/utils";
import { Lightbulb, Maximize, Minimize } from "lucide-react";

interface VisualCanvasProps {
  objective: string;
  timeline: gsap.core.Timeline | null;
  children: React.ReactNode;
  explanation?: string | React.ReactNode;
  className?: string;
  onStepForward?: () => void;
  onStepBack?: () => void;
}

export default function VisualCanvas({
  objective,
  timeline,
  children,
  explanation,
  className,
  onStepForward,
  onStepBack,
}: VisualCanvasProps) {
  const { isPlaying, speed, setPlaying, setSpeed, progress, prevSlug, nextSlug, setActiveExplanation, isFullscreen, setIsFullscreen } = useAnimationStore();
  const { replay, reset } = useAnimationControls(timeline);

  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Sync explanation globally with parent sidebar Layout
  useEffect(() => {
    setActiveExplanation(explanation || null);
    return () => {
      setActiveExplanation(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objective, setActiveExplanation]);

  // Keyboard controls listener specifically bound to the visualization session
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          setPlaying(!isPlaying);
          break;
        case "KeyR":
          e.preventDefault();
          replay();
          break;
        case "Escape":
          e.preventDefault();
          reset();
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "KeyS":
          e.preventDefault();
          const speeds = [0.5, 1.0, 1.5, 2.0];
          const nextIndex = (speeds.indexOf(speed) + 1) % speeds.length;
          setSpeed(speeds[nextIndex]);
          break;
        case "ArrowRight":
          if (onStepForward) {
            e.preventDefault();
            onStepForward();
          }
          break;
        case "ArrowLeft":
          if (onStepBack) {
            e.preventDefault();
            onStepBack();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, speed, replay, reset, setPlaying, setSpeed, onStepForward, onStepBack]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "w-full flex-1 flex flex-col min-h-0 select-none bg-[#0D0D0D] rounded-[18px] border border-[#232323] overflow-hidden transition-all duration-300", 
        isFullscreen && "fixed inset-0 z-50 rounded-none border-none bg-black w-screen h-screen",
        className
      )}
    >
      {/* 1. Primary Visualization Scene Area */}
      <div className="flex-1 relative overflow-auto custom-scrollbar flex flex-col items-center justify-start lg:justify-center p-6 min-h-0 w-full bg-[#0D0D0D]">
        <div
          className="w-full flex-1 flex flex-col items-center justify-center transition-all duration-300"
          style={{
            zoom: isFullscreen ? 1.7 : 1.15,
          }}
        >
          {children}
        </div>
      </div>

      {/* 2. Playback Controller inside Canvas */}
      <div className="px-6 py-4 border-t border-[#232323] bg-[#090909] flex flex-col gap-3 shrink-0">
        
        {/* Top row: Controls row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          
          {/* Left: Playback controls + Speed Control + Fullscreen button */}
          <div className="flex items-center gap-2">
            <PlayButton />
            <ReplayButton />
            <ResetButton />
            <div className="w-px h-6 bg-[#232323] mx-1" />
            <SpeedControl />
            <div className="w-px h-6 bg-[#232323] mx-1" />
            <button
              onClick={toggleFullscreen}
              className="flex items-center justify-center p-1.5 rounded-[6px] border border-[#232323] bg-[#121212] hover:bg-[#1A1A1A] hover:border-[#333] active:scale-95 text-[#A1A1AA] hover:text-[#FAFAFA] transition-all duration-200"
              title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Middle: Progress sync bar */}
          <div className="flex-1 flex items-center gap-3 justify-center max-w-sm mx-auto w-full">
            <span className="text-[9px] font-mono text-[#71717A]">0%</span>
            <div className="flex-1 relative h-1 bg-[#232323] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FAFAFA] rounded-full transition-all duration-75"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-[#71717A]">100%</span>
          </div>

          {/* Right: Previous and Next navigation buttons on the right side edge */}
          <div className="flex items-center gap-2">
            <NavControls prevSlug={prevSlug || undefined} nextSlug={nextSlug || undefined} />
          </div>

        </div>

        {/* Bottom row: Keyboard shortcuts hints row */}
        <div className="flex items-center justify-center gap-1.5 text-[9px] text-[#71717A] font-mono select-text py-1 border-t border-[#232323]/40 w-full mt-1">
          <Lightbulb className="w-3.5 h-3.5 text-[#A1A1AA] shrink-0" />
          <span>[Space] Play/Pause • [R] Replay • [Esc] Reset • [F] Fullscreen</span>
        </div>

      </div>
    </div>
  );
}
