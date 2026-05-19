import { useFilterStore } from "../../store/filterStore";
import type { Stand } from "../../types/filters";

const OPTIONS: { value: Stand | null; label: string }[] = [
  { value: null, label: "Both" },
  { value: "L", label: "LHB" },
  { value: "R", label: "RHB" },
];

export function StandFilter() {
  const { stand, setFilter } = useFilterStore();

  return (
    <div className="flex flex-col gap-1">
      <span className="text-text3 font-mono text-xs uppercase tracking-wider">Batter Hand</span>
      <div className="flex gap-1">
        {OPTIONS.map((o) => (
          <button
            key={String(o.value)}
            onClick={() => setFilter("stand", o.value)}
            className={`font-mono text-xs px-3 py-1 rounded transition-colors ${
              stand === o.value
                ? "bg-accent text-bg"
                : "bg-surface3 text-text2 hover:text-text"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
