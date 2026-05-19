import { create } from "zustand";
import { DEFAULT_FILTERS } from "../types/filters";
import type { FilterState } from "../types/filters";

interface FilterStore extends FilterState {
  _trigger: number;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  clearFilters: () => void;
  _bump: () => void;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export const useFilterStore = create<FilterStore>((set, get) => ({
  ...DEFAULT_FILTERS,
  _trigger: 0,

  setFilter: (key, value) => {
    set({ [key]: value });
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => get()._bump(), 300);
  },

  clearFilters: () => {
    set({
      pitch_type: [],
      stand: null,
      count: [],
      inning_min: null,
      inning_max: null,
      times_through_order: [],
      outcome_filter: [],
    });
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => get()._bump(), 300);
  },

  _bump: () => set((s) => ({ _trigger: s._trigger + 1 })),
}));
