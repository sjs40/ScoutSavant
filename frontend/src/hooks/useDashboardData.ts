import { useQueries } from "@tanstack/react-query";
import { useFilterStore } from "../store/filterStore";
import { fetchPitches } from "../api/pitches";
import { fetchSummary } from "../api/summary";
import { fetchUsage } from "../api/usage";
import { fetchSequences } from "../api/sequences";
import { fetchCounts } from "../api/counts";
import type {
  PitchesResponse,
  SummaryResponse,
  UsageResponse,
  SequencesResponse,
  CountCellRow,
} from "../types/api";

export function useDashboardData() {
  const store = useFilterStore();
  const enabled = !!store.pitcher_id;

  const queryKey = {
    pitcher_id: store.pitcher_id,
    mode: store.mode,
    season: store.season,
    game_pk: store.game_pk,
    pitch_type: store.pitch_type,
    stand: store.stand,
    count: store.count,
    inning_min: store.inning_min,
    inning_max: store.inning_max,
    times_through_order: store.times_through_order,
    outcome_filter: store.outcome_filter,
  };

  const filters = store;

  const [summaryQ, pitchesQ, usageQ, sequencesQ, countsQ] = useQueries({
    queries: [
      {
        queryKey: ["summary", queryKey],
        queryFn: () => fetchSummary(filters),
        enabled,
        staleTime: 30_000,
      },
      {
        queryKey: ["pitches", queryKey],
        queryFn: () => fetchPitches(filters),
        enabled,
        staleTime: 30_000,
      },
      {
        queryKey: ["usage", queryKey],
        queryFn: () => fetchUsage(filters),
        enabled,
        staleTime: 30_000,
      },
      {
        queryKey: ["sequences", queryKey],
        queryFn: () => fetchSequences(filters),
        enabled,
        staleTime: 30_000,
      },
      {
        queryKey: ["counts", queryKey],
        queryFn: () => fetchCounts(filters),
        enabled,
        staleTime: 30_000,
      },
    ],
  });

  const isInitialLoading = enabled && (
    summaryQ.isLoading || pitchesQ.isLoading || usageQ.isLoading ||
    sequencesQ.isLoading || countsQ.isLoading
  );

  return {
    summary: summaryQ.data as SummaryResponse | undefined,
    pitches: pitchesQ.data as PitchesResponse | undefined,
    usage: usageQ.data as UsageResponse | undefined,
    sequences: sequencesQ.data as SequencesResponse | undefined,
    counts: countsQ.data as CountCellRow[] | undefined,
    isLoading: summaryQ.isFetching || pitchesQ.isFetching || usageQ.isFetching ||
      sequencesQ.isFetching || countsQ.isFetching,
    isInitialLoading,
    errors: {
      summary: summaryQ.error ? String(summaryQ.error) : null,
      pitches: pitchesQ.error ? String(pitchesQ.error) : null,
      usage: usageQ.error ? String(usageQ.error) : null,
      sequences: sequencesQ.error ? String(sequencesQ.error) : null,
      counts: countsQ.error ? String(countsQ.error) : null,
    },
  };
}
