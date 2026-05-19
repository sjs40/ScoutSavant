import { apiFetch, buildQuery } from "./client";
import { filtersToQuery } from "./filters";
import type { FilterState } from "../types/filters";
import type { UsageResponse } from "../types/api";

export function fetchUsage(
  filters: FilterState,
  signal?: AbortSignal
): Promise<UsageResponse> {
  return apiFetch<UsageResponse>(
    `/api/usage${buildQuery(filtersToQuery(filters))}`,
    signal
  );
}
