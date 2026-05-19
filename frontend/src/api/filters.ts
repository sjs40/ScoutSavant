import type { FilterState } from "../types/filters";

export function filtersToQuery(f: FilterState): Record<string, unknown> {
  return {
    mode: f.mode,
    pitcher_id: f.pitcher_id,
    season: f.mode === "season" ? f.season : undefined,
    game_pk: f.mode === "game" ? f.game_pk : undefined,
    pitch_type: f.pitch_type.length ? f.pitch_type : undefined,
    stand: f.stand ?? undefined,
    count: f.count.length ? f.count : undefined,
    inning_min: f.inning_min ?? undefined,
    inning_max: f.inning_max ?? undefined,
    times_through_order: f.times_through_order.length ? f.times_through_order : undefined,
    outcome_filter: f.outcome_filter.length ? f.outcome_filter : undefined,
  };
}
