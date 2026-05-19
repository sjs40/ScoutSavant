import { apiFetch, buildQuery } from "./client";
import { filtersToQuery } from "./filters";
import type { FilterState } from "../types/filters";
import type { CountCellRow } from "../types/api";

export function fetchCounts(
  filters: FilterState,
  signal?: AbortSignal
): Promise<CountCellRow[]> {
  return apiFetch<CountCellRow[]>(
    `/api/counts${buildQuery(filtersToQuery(filters))}`,
    signal
  );
}
