import type { CountCellRow } from "../types/api";
import { pitchColor, ALL_COUNTS } from "../constants";
import { useFilterStore } from "../store/filterStore";

const MAX_HEIGHT = 48;

export function CountStrip({ data }: { data: CountCellRow[] | null }) {
  const { count: activeCount, setFilter } = useFilterStore();

  const cellMap = Object.fromEntries((data ?? []).map((c) => [c.count, c]));
  const maxCount = Math.max(...(data ?? []).map((c) => c.pitch_count), 1);

  const toggleCount = (c: string) => {
    const next = activeCount.includes(c)
      ? activeCount.filter((x) => x !== c)
      : [...activeCount, c];
    setFilter("count", next);
  };

  return (
    <div className="bg-surface rounded-lg p-4 flex flex-col gap-2">
      <span className="text-text2 font-mono text-sm">Count Distribution</span>
      <div className="flex gap-1 items-end">
        {ALL_COUNTS.map((count) => {
          const cell = cellMap[count];
          const barH = cell ? (cell.pitch_count / maxCount) * MAX_HEIGHT : 0;
          const dominant = cell?.by_pitch_type[0];
          const active = activeCount.includes(count);

          return (
            <button
              key={count}
              onClick={() => toggleCount(count)}
              className={`flex flex-col items-center gap-0.5 flex-1 group transition-opacity ${
                active ? "opacity-100" : "opacity-70 hover:opacity-90"
              }`}
            >
              <div
                className="w-full rounded-sm transition-all"
                style={{
                  height: barH,
                  minHeight: cell ? 2 : 0,
                  backgroundColor: dominant
                    ? pitchColor(dominant.pitch_type)
                    : "#252b35",
                  outline: active ? "1px solid #00d4ff" : "none",
                }}
              />
              <span
                className={`font-mono text-[9px] ${
                  active ? "text-accent" : "text-text3 group-hover:text-text2"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
