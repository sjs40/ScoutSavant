import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFilterStore } from "../../store/filterStore";
import { useIngest } from "../../hooks/useIngest";
import { fetchPlayerSearch } from "../../api/players";
import { fetchGames } from "../../api/games";
import type { PlayerInfo, GameInfo } from "../../types/api";
import { PitchTypeFilter } from "../filters/PitchTypeFilter";
import { StandFilter } from "../filters/StandFilter";
import { CountFilter } from "../filters/CountFilter";
import { InningRangeFilter } from "../filters/InningRangeFilter";
import { TTOFilter } from "../filters/TTOFilter";
import { OutcomeFilter } from "../filters/OutcomeFilter";

const CURRENT_YEAR = new Date().getFullYear();

function Divider() {
  return <div className="h-px bg-border shrink-0" />;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <span className="text-text3 font-mono text-[10px] uppercase tracking-widest">{label}</span>
  );
}

export function FilterPanel() {
  const store = useFilterStore();
  const ingest = useIngest();
  const queryClient = useQueryClient();

  const [searchVal, setSearchVal] = useState(store.pitcher_name ?? "");
  const [suggestions, setSuggestions] = useState<PlayerInfo[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const [gameDate, setGameDate] = useState(today);
  const [teamFilter, setTeamFilter] = useState("");
  const [games, setGames] = useState<GameInfo[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);

  useEffect(() => {
    if (store.pitcher_name && store.pitcher_name !== searchVal) {
      setSearchVal(store.pitcher_name);
    }
  }, [store.pitcher_name]);

  const handleSearchChange = (val: string) => {
    setSearchVal(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (val.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    searchTimerRef.current = setTimeout(async () => {
      const results = await fetchPlayerSearch(val).catch(() => []);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 250);
  };

  const handleSelectPlayer = async (player: PlayerInfo) => {
    setSearchVal(player.name);
    setShowSuggestions(false);
    store.setPitcher(player.pitcher_id, player.name);
    if (store.mode === "season") {
      const season = store.season ?? CURRENT_YEAR;
      try {
        const result = await ingest.ingestSeason(player.pitcher_id, season);
        store.setIngestMeta(result.pulled_at ?? null, result.row_count);
        queryClient.invalidateQueries();
      } catch { /* ingest.error handles display */ }
    }
  };

  const handleLoadGames = async () => {
    setLoadingGames(true);
    const results = await fetchGames(gameDate, teamFilter || undefined).catch(() => []);
    setGames(results);
    setLoadingGames(false);
  };

  const handleSelectGame = async (game: GameInfo) => {
    const label = `${game.away_team} @ ${game.home_team}`;
    store.setGame(game.game_pk, label, game.game_date);
    if (store.pitcher_id) {
      const season = store.season ?? CURRENT_YEAR;
      try {
        const result = await ingest.ingestGame(store.pitcher_id, game.game_pk, season);
        store.setIngestMeta(result.last_pulled_at ?? result.pulled_at ?? null, result.row_count);
        queryClient.invalidateQueries();
      } catch { /* ingest.error handles display */ }
    }
  };

  return (
    <aside className="w-[220px] shrink-0 bg-surface border-r border-border flex flex-col overflow-y-auto">
      <div className="flex flex-col gap-4 p-4">

        {/* Pitcher search */}
        <div className="flex flex-col gap-2">
          <SectionLabel label="Pitcher" />
          <div className="relative">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => handleSearchChange(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 160)}
              placeholder="Search name…"
              className="w-full bg-surface3 text-text font-mono text-xs px-2 py-1.5 rounded border border-border focus:outline-none focus:border-accent placeholder:text-text3"
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 bg-surface border border-border rounded mt-0.5 z-50 shadow-xl max-h-48 overflow-y-auto">
                {suggestions.map((p) => (
                  <li key={p.pitcher_id}>
                    <button
                      className="w-full text-left px-2 py-1.5 font-mono text-xs text-text2 hover:bg-surface2 hover:text-text"
                      onMouseDown={() => handleSelectPlayer(p)}
                    >
                      {p.name}
                      {p.throws && (
                        <span className="text-text3 ml-1 text-[10px]">{p.throws}HP</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {store.pitcher_name && (
            <div className="font-mono text-[10px] text-accent truncate leading-none">
              {store.pitcher_name}
            </div>
          )}

          {/* Season picker (season mode) */}
          {store.mode === "season" && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-text3 shrink-0">Season</span>
              <input
                type="number"
                value={store.season ?? CURRENT_YEAR}
                min={2015}
                max={CURRENT_YEAR}
                onChange={(e) => store.setFilter("season", Number(e.target.value))}
                className="flex-1 bg-surface3 text-text font-mono text-xs px-2 py-1 rounded border border-border focus:outline-none focus:border-accent"
              />
            </div>
          )}

          {ingest.loading && (
            <span className="font-mono text-[10px] text-accent animate-pulse">Loading data…</span>
          )}
          {ingest.error && (
            <span className="font-mono text-[10px] text-red leading-tight break-words">{ingest.error}</span>
          )}
        </div>

        {/* Game selector (game mode only) */}
        {store.mode === "game" && (
          <>
            <Divider />
            <div className="flex flex-col gap-2">
              <SectionLabel label="Game" />
              <input
                type="date"
                value={gameDate}
                onChange={(e) => setGameDate(e.target.value)}
                className="w-full bg-surface3 text-text font-mono text-xs px-2 py-1.5 rounded border border-border focus:outline-none focus:border-accent"
              />
              <div className="flex gap-1">
                <input
                  type="text"
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value.toUpperCase())}
                  placeholder="Team (opt)"
                  maxLength={3}
                  className="flex-1 min-w-0 bg-surface3 text-text font-mono text-xs px-2 py-1 rounded border border-border focus:outline-none focus:border-accent placeholder:text-text3"
                />
                <button
                  onClick={handleLoadGames}
                  disabled={loadingGames || !gameDate}
                  className="font-mono text-xs px-2 py-1 rounded bg-accent text-bg hover:bg-accent/80 disabled:opacity-50 transition-colors shrink-0"
                >
                  {loadingGames ? "…" : "Go"}
                </button>
              </div>

              {games.length > 0 && (
                <div className="flex flex-col gap-0.5 max-h-40 overflow-y-auto">
                  {games.map((g) => {
                    const label = `${g.away_team} @ ${g.home_team}`;
                    const selected = store.game_pk === g.game_pk;
                    return (
                      <button
                        key={g.game_pk}
                        onClick={() => handleSelectGame(g)}
                        className={`text-left font-mono text-[10px] px-2 py-1.5 rounded transition-colors leading-tight ${
                          selected
                            ? "bg-accent text-bg"
                            : "bg-surface2 text-text2 hover:bg-surface3 hover:text-text"
                        }`}
                      >
                        {label}
                        <span className={`block text-[9px] mt-0.5 ${selected ? "text-bg/70" : "text-text3"}`}>
                          {g.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {store.game_label && (
                <div className="font-mono text-[10px] text-accent truncate leading-none">
                  {store.game_label}
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-text3 shrink-0">Season</span>
                <input
                  type="number"
                  value={store.season ?? CURRENT_YEAR}
                  min={2015}
                  max={CURRENT_YEAR}
                  onChange={(e) => store.setFilter("season", Number(e.target.value))}
                  className="flex-1 bg-surface3 text-text font-mono text-xs px-2 py-1 rounded border border-border focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </>
        )}

        <Divider />
        <PitchTypeFilter />
        <Divider />
        <StandFilter />
        <Divider />
        <CountFilter />
        <Divider />
        <InningRangeFilter />
        <Divider />
        <TTOFilter />
        <Divider />
        <OutcomeFilter />
      </div>
    </aside>
  );
}
