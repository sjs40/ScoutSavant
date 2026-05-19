import { apiFetch, buildQuery } from "./client";
import type { PlayerInfo } from "../types/api";

export function fetchPlayerSearch(name: string): Promise<PlayerInfo[]> {
  return apiFetch<PlayerInfo[]>(`/api/players/search${buildQuery({ name })}`);
}

export async function ingestSeason(pitcher_id: number, season: number) {
  const res = await fetch("/api/ingest/season", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pitcher_id, season }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function ingestGame(pitcher_id: number, game_pk: number, season: number) {
  const res = await fetch("/api/ingest/game", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pitcher_id, game_pk, season }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function refreshGame(pitcher_id: number, game_pk: number, season: number) {
  const res = await fetch("/api/ingest/game/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pitcher_id, game_pk, season }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
