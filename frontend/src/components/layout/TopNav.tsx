import { useQueryClient } from "@tanstack/react-query";
import { useFilterStore } from "../../store/filterStore";
import { useIngest } from "../../hooks/useIngest";

function formatTime(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return null;
  }
}

function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return dateStr.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

function Spinner() {
  return (
    <svg className="animate-spin w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M12 2a10 10 0 0110 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TopNav() {
  const store = useFilterStore();
  const ingest = useIngest();
  const queryClient = useQueryClient();

  const live = store.mode === "game" && isToday(store.game_date);
  const lastTime = formatTime(store.ingestMeta?.pulled_at ?? null);
  const rowCount = store.ingestMeta?.row_count ?? null;
  const canRefresh = store.mode === "game" && !!store.pitcher_id && !!store.game_pk;

  const handleRefresh = async () => {
    if (!store.pitcher_id || !store.game_pk) return;
    const season = store.season ?? new Date().getFullYear();
    try {
      const result = await ingest.refreshGame(store.pitcher_id, store.game_pk, season);
      store.setIngestMeta(result.last_pulled_at ?? null, result.row_count);
      queryClient.invalidateQueries();
    } catch { /* ingest.error set by hook */ }
  };

  return (
    <nav className="h-12 bg-surface border-b border-border flex items-center px-4 gap-6 shrink-0 z-10">
      {/* Logo + subtitle */}
      <div className="flex items-baseline gap-2 shrink-0">
        <span className="font-logo text-accent text-2xl tracking-wider leading-none">
          ScoutSavant
        </span>
        <span className="font-mono text-text3 text-[10px] uppercase tracking-widest select-none">
          / Pitcher Scout
        </span>
      </div>

      {/* Mode toggle — centered */}
      <div className="flex gap-0.5 mx-auto bg-surface3 rounded p-0.5">
        {(["season", "game"] as const).map((m) => (
          <button
            key={m}
            onClick={() => store.setFilter("mode", m)}
            className={`font-mono text-xs px-4 py-1 rounded transition-colors capitalize ${
              store.mode === m
                ? "bg-accent text-bg font-semibold"
                : "text-text3 hover:text-text2"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Right: timestamp · live badge · refresh */}
      <div className="flex items-center gap-3 shrink-0">
        {lastTime && (
          <span className="font-mono text-[11px] text-text3">
            {lastTime}
            {rowCount !== null && (
              <span className="ml-1 text-text3">· {rowCount.toLocaleString()} pit</span>
            )}
          </span>
        )}

        {/* Ingesting indicator (from FilterPanel ingest, not refresh) */}
        {ingest.loading && !canRefresh && (
          <span className="font-mono text-[11px] text-accent animate-pulse">Ingesting…</span>
        )}

        {live && (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red" />
            </span>
            <span className="font-mono text-[11px] text-red uppercase tracking-wider">Live</span>
          </div>
        )}

        {canRefresh && (
          <button
            onClick={handleRefresh}
            disabled={ingest.loading}
            title="Re-pull this game from Baseball Savant"
            className={`font-mono text-xs px-3 py-1 rounded border transition-colors flex items-center gap-1.5 disabled:opacity-50 ${
              live
                ? "bg-red/10 text-red border-red/30 hover:bg-red/20"
                : "bg-surface3 text-text2 border-border hover:text-text"
            }`}
          >
            {ingest.loading ? (
              <>
                <Spinner />
                <span>Refreshing…</span>
              </>
            ) : (
              "Refresh"
            )}
          </button>
        )}
      </div>
    </nav>
  );
}
