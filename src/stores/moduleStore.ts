import { create } from "zustand";

interface ModuleState {
  activeModuleSlug: string | null;
  completedModules: string[];
  setActiveModule: (slug: string | null) => void;
  markComplete: (slug: string) => void;
  markIncomplete: (slug: string) => void;
  resetProgress: () => void;
}

export const useModuleStore = create<ModuleState>((set) => ({
  activeModuleSlug: null,
  completedModules: [],
  setActiveModule: (slug) => set({ activeModuleSlug: slug }),
  markComplete: (slug) =>
    set((state) => ({
      completedModules: state.completedModules.includes(slug)
        ? state.completedModules
        : [...state.completedModules, slug],
    })),
  markIncomplete: (slug) =>
    set((state) => ({
      completedModules: state.completedModules.filter((s) => s !== slug),
    })),
  resetProgress: () => set({ completedModules: [] }),
}));
