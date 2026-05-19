import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFilterStore } from "../../store/filterStore";
import { useIngest } from "../../hooks/useIngest";
import { fetchPlayerSearch } from "../../api/players";
import type { PlayerInfo } from "../../types/api";

function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return dateStr.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

export function TopNav() {
  const store = useFilterStore();
  const ingest = useIngest();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<PlayerInfo[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const live = store.mode === "game" && isToday(store.game_date);

  const handleSearch = async (val: string) => {
    setSearch(val);
    if (val.length < 2) { setSuggestions([]); return; }
    const results = await fetchPlayerSearch(val).catch(() => []);
    setSuggestions(results);
    setShowSuggestions(true);
  };

  const selectPlayer = async (player: PlayerInfo) => {
    setSearch(player.name);
    setShowSuggestions(false);
    store.setPitcher(player.pitcher_id, player.name);
    if (store.mode === "season" && store.season) {
      await ingest.ingestSeason(player.pitcher_id, store.season).catch(() => null);
      queryClient.invalidateQueries();
    }
  };

  const handleRefresh = async () => {
    if (!store.pitcher_id) return;
    if (store.mode === "game" && store.game_pk && store.season) {
      await ingest.refreshGame(store.pitcher_id, store.game_pk, store.season).catch(() => null);
      queryClient.invalidateQueries();
    }
  };

  return (
    <nav className="h-12 bg-surface border-b border-border flex items-center px-4 gap-4 shrink-0 z-10">
      <span className="font-logo text-accent text-2xl tracking-wider">ScoutSavant</span>

      <div className="relative flex-1 max-w-xs">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Search pitcher…"
          className="w-full bg-surface3 text-text font-sans text-sm px-3 py-1.5 rounded border border-border focus:outline-none focus:border-accent"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute top-full left-0 right-0 bg-surface border border-border rounded mt-1 z-50 shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((p) => (
              <li key={p.pitcher_id}>
                <button
                  className="w-full text-left px-3 py-2 font-sans text-sm text-text2 hover:bg-surface2"
                  onMouseDown={() => selectPlayer(p)}
                >
                  {p.name}
                  {p.throws && <span className="text-text3 ml-2 text-xs">{p.throws}HP</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-1">
        {(["season", "game"] as const).map((m) => (
          <button
            key={m}
            onClick={() => store.setFilter("mode", m)}
            className={`font-mono text-xs px-3 py-1 rounded transition-colors capitalize ${
              store.mode === m
                ? "bg-accent text-bg"
                : "bg-surface3 text-text2 hover:text-text"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {store.mode === "season" && (
        <input
          type="number"
          value={store.season ?? ""}
          min={2015}
          max={new Date().getFullYear()}
          onChange={(e) => store.setFilter("season", Number(e.target.value))}
          className="w-20 bg-surface3 text-text font-mono text-xs px-2 py-1 rounded border border-border focus:outline-none focus:border-accent"
        />
      )}

      <div className="ml-auto flex items-center gap-3">
        {live && (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red" />
            </span>
            <span className="font-mono text-xs text-red uppercase tracking-wider">Live</span>
          </div>
        )}
        {ingest.loading && (
          <span className="font-mono text-xs text-accent animate-pulse">Loading data…</span>
        )}
        {store.mode === "game" && (
          <button
            onClick={handleRefresh}
            disabled={ingest.loading}
            className="font-mono text-xs px-3 py-1 rounded bg-surface3 text-text2 hover:text-text border border-border disabled:opacity-50"
          >
            Refresh
          </button>
        )}
      </div>
    </nav>
  );
}
