import { apiFetch, buildQuery } from "./client";
import { filtersToQuery } from "./filters";
import type { FilterState } from "../types/filters";
import type { SequencesResponse } from "../types/api";

export function fetchSequences(
  filters: FilterState,
  signal?: AbortSignal
): Promise<SequencesResponse> {
  return apiFetch<SequencesResponse>(
    `/api/sequences${buildQuery(filtersToQuery(filters))}`,
    signal
  );
}
