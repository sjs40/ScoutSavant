import { apiFetch, buildQuery } from "./client";
import { filtersToQuery } from "./filters";
import type { FilterState } from "../types/filters";
import type { PitchesResponse } from "../types/api";

export function fetchPitches(
  filters: FilterState,
  signal?: AbortSignal
): Promise<PitchesResponse> {
  return apiFetch<PitchesResponse>(
    `/api/pitches${buildQuery({ ...filtersToQuery(filters), limit: 500 })}`,
    signal
  );
}
