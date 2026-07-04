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
  activeStep: number;
  maxSteps: number;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  setProgress: (progress: number) => void;
  setActiveTimeline: (timeline: gsap.core.Timeline | null) => void;
  setActiveExplanation: (explanation: React.ReactNode | null) => void;
  setNavigation: (prevSlug: string | null, nextSlug: string | null) => void;
  setActiveStep: (step: number) => void;
  setMaxSteps: (max: number) => void;
  nextStep: () => void;
  prevStep: () => void;
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
  activeStep: 0,
  maxSteps: 1,
  setPlaying: (playing) => set({ isPlaying: playing }),
  setSpeed: (speed) => set({ speed: speed }),
  setProgress: (progress) => set({ progress: progress }),
  setActiveTimeline: (timeline) => set({ activeTimeline: timeline }),
  setActiveExplanation: (explanation) => set({ activeExplanation: explanation }),
  setNavigation: (prevSlug, nextSlug) => set({ prevSlug, nextSlug }),
  setActiveStep: (step) => set({ activeStep: step }),
  setMaxSteps: (max) => set({ maxSteps: max }),
  nextStep: () => set((state) => ({ activeStep: Math.min(state.activeStep + 1, state.maxSteps - 1) })),
  prevStep: () => set((state) => ({ activeStep: Math.max(state.activeStep - 1, 0) })),
  resetControls: () => set({ isPlaying: false, progress: 0, activeTimeline: null, activeExplanation: null, prevSlug: null, nextSlug: null, activeStep: 0, maxSteps: 1 }),
}));
