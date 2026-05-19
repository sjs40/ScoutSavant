export type Mode = "season" | "game";
export type Stand = "L" | "R";

export type CountGroup = "ahead" | "behind" | "two_strike" | "first_pitch";

export const CountGroups = {
  AHEAD: "ahead" as CountGroup,
  BEHIND: "behind" as CountGroup,
  TWO_STRIKE: "two_strike" as CountGroup,
  FIRST_PITCH: "first_pitch" as CountGroup,
};

export interface FilterState {
  mode: Mode;
  pitcher_id: number | null;
  season: number | null;
  game_pk: number | null;
  pitch_type: string[];
  stand: Stand | null;
  count: string[];
  inning_min: number | null;
  inning_max: number | null;
  times_through_order: number[];
  outcome_filter: string[];
}

export const DEFAULT_FILTERS: FilterState = {
  mode: "season",
  pitcher_id: null,
  season: new Date().getFullYear(),
  game_pk: null,
  pitch_type: [],
  stand: null,
  count: [],
  inning_min: null,
  inning_max: null,
  times_through_order: [],
  outcome_filter: [],
};
