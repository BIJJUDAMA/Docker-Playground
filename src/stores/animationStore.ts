import { create } from "zustand";
import gsap from "gsap";

interface AnimationState {
  isPlaying: boolean;
  speed: number;
  progress: number;
  activeTimeline: gsap.core.Timeline | null;
  activeExplanation: React.ReactNode | null;
  prevSlug: string | null;
  nextSlug: string | null;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  setProgress: (progress: number) => void;
  setActiveTimeline: (timeline: gsap.core.Timeline | null) => void;
  setActiveExplanation: (explanation: React.ReactNode | null) => void;
  setNavigation: (prevSlug: string | null, nextSlug: string | null) => void;
  resetControls: () => void;
}

export const useAnimationStore = create<AnimationState>((set) => ({
  isPlaying: false,
  speed: 1.0,
  progress: 0,
  activeTimeline: null,
  activeExplanation: null,
  prevSlug: null,
  nextSlug: null,
  setPlaying: (playing) => set({ isPlaying: playing }),
  setSpeed: (speed) => set({ speed: speed }),
  setProgress: (progress) => set({ progress: progress }),
  setActiveTimeline: (timeline) => set({ activeTimeline: timeline }),
  setActiveExplanation: (explanation) => set({ activeExplanation: explanation }),
  setNavigation: (prevSlug, nextSlug) => set({ prevSlug, nextSlug }),
  resetControls: () => set({ isPlaying: false, progress: 0, activeTimeline: null, activeExplanation: null, prevSlug: null, nextSlug: null }),
}));
