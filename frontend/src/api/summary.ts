import { apiFetch, buildQuery } from "./client";
import { filtersToQuery } from "./filters";
import type { FilterState } from "../types/filters";
import type { SummaryResponse } from "../types/api";

export function fetchSummary(
  filters: FilterState,
  signal?: AbortSignal
): Promise<SummaryResponse> {
  return apiFetch<SummaryResponse>(
    `/api/summary${buildQuery(filtersToQuery(filters))}`,
    signal
  );
}
