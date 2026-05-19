import { useFilterStore } from "../../store/filterStore";
import { CountGroups } from "../../types/filters";
import type { CountGroup } from "../../types/filters";

const GROUPS: { id: CountGroup; label: string }[] = [
  { id: CountGroups.FIRST_PITCH, label: "First" },
  { id: CountGroups.AHEAD, label: "Ahead" },
  { id: CountGroups.BEHIND, label: "Behind" },
  { id: CountGroups.TWO_STRIKE, label: "2-Strike" },
];

const COUNT_GRID = [
  ["0-0", "1-0", "2-0", "3-0"],
  ["0-1", "1-1", "2-1", "3-1"],
  ["0-2", "1-2", "2-2", "3-2"],
];

export function CountFilter() {
  const { count, setFilter } = useFilterStore();

  const toggle = (c: string) => {
    const next = count.includes(c) ? count.filter((x) => x !== c) : [...count, c];
    setFilter("count", next);
  };

  const toggleGroup = (g: CountGroup) => {
    const next = count.includes(g) ? count.filter((x) => x !== g) : [...count, g];
    setFilter("count", next);
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-text3 font-mono text-xs uppercase tracking-wider">Count</span>
      <div className="flex gap-1 flex-wrap">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => toggleGroup(g.id)}
            className={`font-mono text-[10px] px-2 py-0.5 rounded transition-colors ${
              count.includes(g.id)
                ? "bg-accent text-bg"
                : "bg-surface3 text-text3 hover:text-text2"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-0.5">
        {COUNT_GRID.flat().map((c) => (
          <button
            key={c}
            onClick={() => toggle(c)}
            className={`font-mono text-[10px] py-1 rounded transition-colors ${
              count.includes(c)
                ? "bg-accent text-bg"
                : "bg-surface3 text-text3 hover:text-text2"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
