import { useFilterStore } from "../../store/filterStore";

export function InningRangeFilter() {
  const { inning_min, inning_max, setFilter } = useFilterStore();

  return (
    <div className="flex flex-col gap-1">
      <span className="text-text3 font-mono text-xs uppercase tracking-wider">Inning</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={9}
          value={inning_min ?? ""}
          placeholder="1"
          onChange={(e) =>
            setFilter("inning_min", e.target.value ? Number(e.target.value) : null)
          }
          className="w-12 bg-surface3 text-text font-mono text-xs px-2 py-1 rounded border border-border focus:outline-none focus:border-accent"
        />
        <span className="text-text3 font-mono text-xs">–</span>
        <input
          type="number"
          min={1}
          value={inning_max ?? ""}
          placeholder="∞"
          onChange={(e) =>
            setFilter("inning_max", e.target.value ? Number(e.target.value) : null)
          }
          className="w-12 bg-surface3 text-text font-mono text-xs px-2 py-1 rounded border border-border focus:outline-none focus:border-accent"
        />
      </div>
    </div>
  );
}
