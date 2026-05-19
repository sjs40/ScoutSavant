import type { CountCellRow } from "../types/api";
import { pitchColor, ALL_COUNTS } from "../constants";
import { useFilterStore } from "../store/filterStore";

export function CountStrip({
  data,
  isFetching,
}: {
  data: CountCellRow[] | null | undefined;
  isFetching?: boolean;
}) {
  const { count: activeCount, setFilter } = useFilterStore();

  const cellMap = Object.fromEntries((data ?? []).map((c) => [c.count, c]));

  const toggleCount = (c: string) => {
    const next = activeCount.includes(c)
      ? activeCount.filter((x) => x !== c)
      : [...activeCount, c];
    setFilter("count", next);
  };

  return (
    <div className={`bg-surface rounded-lg p-3 flex flex-col gap-2 transition-opacity ${isFetching && data ? "opacity-50" : ""}`}>
      <span className="text-text2 font-mono text-xs">Count Distribution</span>
      <div className="flex gap-1">
        {ALL_COUNTS.map((count) => {
          const cell = cellMap[count];
          const active = activeCount.includes(count);
          const dominantColor = pitchColor(cell?.dominant_pitch_type ?? cell?.by_pitch_type?.[0]?.pitch_type ?? null);
          const dominantPct = cell?.dominant_pct ?? 0;

          return (
            <button
              key={count}
              onClick={() => toggleCount(count)}
              title={`${count}: ${cell?.pitch_count ?? 0} pitches`}
              className={`flex flex-col gap-1 flex-1 p-1.5 rounded transition-colors ${
                active
                  ? "bg-surface3 ring-1 ring-accent"
                  : "bg-surface2 hover:bg-surface3"
              }`}
            >
              <span
                className={`font-mono text-[10px] font-bold leading-none ${
                  active ? "text-accent" : "text-text"
                }`}
              >
                {count}
              </span>
              <span className="font-mono text-[9px] text-text3 leading-none">
                {cell?.pitch_count ? `${cell.pitch_count} pit` : "—"}
              </span>
              <div className="h-1 bg-border/50 rounded-full overflow-hidden w-full">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${dominantPct * 100}%`,
                    backgroundColor: dominantColor,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
