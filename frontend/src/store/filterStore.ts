import { create } from "zustand";
import { DEFAULT_FILTERS } from "../types/filters";
import type { FilterState } from "../types/filters";

interface FilterStore extends FilterState {
  pitcher_name: string | null;
  game_label: string | null;
  game_date: string | null;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  setPitcher: (id: number, name: string) => void;
  setGame: (game_pk: number, label: string, date: string) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  ...DEFAULT_FILTERS,
  pitcher_name: null,
  game_label: null,
  game_date: null,

  setFilter: (key, value) => {
    set({ [key]: value });
  },

  setPitcher: (id, name) => {
    set({ pitcher_id: id, pitcher_name: name });
  },

  setGame: (game_pk, label, date) => {
    set({ game_pk, game_label: label, game_date: date });
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
  },
}));
