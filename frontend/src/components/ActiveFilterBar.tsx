import { useFilterStore } from "../store/filterStore";

interface ChipProps {
  label: string;
  onRemove: () => void;
}

function Chip({ label, onRemove }: ChipProps) {
  return (
    <span className="flex items-center gap-1 bg-surface3 text-text2 font-mono text-xs px-2 py-0.5 rounded">
      {label}
      <button
        className="text-text3 hover:text-red ml-0.5"
        onClick={onRemove}
      >
        ×
      </button>
    </span>
  );
}

export function ActiveFilterBar({ filteredCount }: { filteredCount: number | null }) {
  const store = useFilterStore();
  const chips: { label: string; onRemove: () => void }[] = [];

  store.pitch_type.forEach((pt) =>
    chips.push({
      label: pt,
      onRemove: () =>
        store.setFilter(
          "pitch_type",
          store.pitch_type.filter((x) => x !== pt)
        ),
    })
  );

  if (store.stand)
    chips.push({
      label: `vs ${store.stand}HB`,
      onRemove: () => store.setFilter("stand", null),
    });

  store.count.forEach((c) =>
    chips.push({
      label: c,
      onRemove: () =>
        store.setFilter(
          "count",
          store.count.filter((x) => x !== c)
        ),
    })
  );

  if (store.inning_min !== null || store.inning_max !== null)
    chips.push({
      label: `Inn ${store.inning_min ?? "1"}–${store.inning_max ?? "∞"}`,
      onRemove: () => {
        store.setFilter("inning_min", null);
        store.setFilter("inning_max", null);
      },
    });

  store.times_through_order.forEach((t) =>
    chips.push({
      label: `TTO ${t}`,
      onRemove: () =>
        store.setFilter(
          "times_through_order",
          store.times_through_order.filter((x) => x !== t)
        ),
    })
  );

  store.outcome_filter.forEach((o) =>
    chips.push({
      label: o,
      onRemove: () =>
        store.setFilter(
          "outcome_filter",
          store.outcome_filter.filter((x) => x !== o)
        ),
    })
  );

  if (chips.length === 0 && filteredCount === null) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap px-4 py-2 border-b border-border bg-surface">
      {filteredCount !== null && (
        <span className="font-mono text-xs text-text3">
          {filteredCount.toLocaleString()} pitches
        </span>
      )}
      {chips.map((c, i) => (
        <Chip key={i} label={c.label} onRemove={c.onRemove} />
      ))}
      {chips.length > 0 && (
        <button
          className="font-mono text-xs text-text3 hover:text-red ml-1"
          onClick={store.clearFilters}
        >
          Clear all
        </button>
      )}
    </div>
  );
}
