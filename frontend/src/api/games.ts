import { apiFetch, buildQuery } from "./client";
import type { GameInfo } from "../types/api";

export function fetchGames(date: string, team: string): Promise<GameInfo[]> {
  return apiFetch<GameInfo[]>(`/api/games${buildQuery({ date, team })}`);
}
