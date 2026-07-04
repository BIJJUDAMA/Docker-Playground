import { useEffect } from "react";
import { useAnimationStore } from "@/stores/animationStore";
import gsap from "gsap";

export function useAnimationControls(timeline: gsap.core.Timeline | null) {
  const { isPlaying, speed, setPlaying, setProgress, setActiveTimeline } = useAnimationStore();

  // Sync active timeline with the store
  useEffect(() => {
    setActiveTimeline(timeline);
    return () => {
      setActiveTimeline(null);
    };
  }, [timeline, setActiveTimeline]);

  // Handle prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined" || !timeline) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleReducedMotionChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        timeline.pause();
        setPlaying(false);
      }
    };

    handleReducedMotionChange(mediaQuery);
    mediaQuery.addEventListener("change", handleReducedMotionChange);
    return () => {
      mediaQuery.removeEventListener("change", handleReducedMotionChange);
    };
  }, [timeline, setPlaying]);

  // Sync speed / timeScale
  useEffect(() => {
    if (timeline) {
      timeline.timeScale(speed);
    }
  }, [timeline, speed]);

  // Sync play/pause state
  useEffect(() => {
    if (!timeline) return;

    if (isPlaying) {
      if (timeline.progress() === 1) {
        timeline.restart();
      } else {
        timeline.play();
      }
    } else {
      timeline.pause();
    }
  }, [timeline, isPlaying]);

  // Setup callbacks to sync timeline changes back to store
  useEffect(() => {
    if (!timeline) return;

    // Capture any pre-existing callbacks configured on the timeline
    const existingOnUpdate = timeline.eventCallback("onUpdate");
    const existingOnComplete = timeline.eventCallback("onComplete");

    timeline.eventCallback("onUpdate", () => {
      setProgress(timeline.progress());
      if (existingOnUpdate) {
        existingOnUpdate();
      }
    });

    timeline.eventCallback("onComplete", () => {
      setPlaying(false);
      setProgress(1);
      if (existingOnComplete) {
        existingOnComplete();
      }
    });

    return () => {
      if (timeline) {
        timeline.eventCallback("onUpdate", existingOnUpdate || null);
        timeline.eventCallback("onComplete", existingOnComplete || null);
      }
    };
  }, [timeline, setPlaying, setProgress]);

  const play = () => setPlaying(true);
  const pause = () => setPlaying(false);
  
  const replay = () => {
    if (timeline) {
      setPlaying(false);
      timeline.restart();
      setPlaying(true);
    }
  };

  const reset = () => {
    if (timeline) {
      setPlaying(false);
      timeline.pause().progress(0);
      setProgress(0);
    }
  };

  return {
    play,
    pause,
    replay,
    reset,
    isPlaying,
    speed,
  };
}
