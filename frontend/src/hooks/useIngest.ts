import { useState } from "react";
import { ingestSeason, ingestGame, refreshGame } from "../api/players";
import type { IngestResponse } from "../types/api";

interface IngestState {
  loading: boolean;
  error: string | null;
  result: IngestResponse | null;
}

export function useIngest() {
  const [state, setState] = useState<IngestState>({
    loading: false,
    error: null,
    result: null,
  });

  const run = async (fn: () => Promise<IngestResponse>) => {
    setState({ loading: true, error: null, result: null });
    try {
      const result = await fn();
      setState({ loading: false, error: null, result });
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setState({ loading: false, error: msg, result: null });
      throw err;
    }
  };

  return {
    ...state,
    ingestSeason: (pitcher_id: number, season: number) =>
      run(() => ingestSeason(pitcher_id, season)),
    ingestGame: (pitcher_id: number, game_pk: number, season: number) =>
      run(() => ingestGame(pitcher_id, game_pk, season)),
    refreshGame: (pitcher_id: number, game_pk: number, season: number) =>
      run(() => refreshGame(pitcher_id, game_pk, season)),
  };
}
