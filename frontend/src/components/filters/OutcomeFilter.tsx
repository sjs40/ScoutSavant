import { useFilterStore } from "../../store/filterStore";

const OUTCOMES = [
  { id: "whiff", label: "Whiff" },
  { id: "chase", label: "Chase" },
  { id: "csw", label: "CSW" },
  { id: "hard_hit", label: "Hard Hit" },
  { id: "barrel", label: "Barrel" },
  { id: "called_strike", label: "Called K" },
  { id: "in_play", label: "In Play" },
];

export function OutcomeFilter() {
  const { outcome_filter, setFilter } = useFilterStore();

  const toggle = (id: string) => {
    const next = outcome_filter.includes(id)
      ? outcome_filter.filter((x) => x !== id)
      : [...outcome_filter, id];
    setFilter("outcome_filter", next);
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-text3 font-mono text-xs uppercase tracking-wider">Outcome</span>
      <div className="flex flex-wrap gap-1">
        {OUTCOMES.map((o) => (
          <button
            key={o.id}
            onClick={() => toggle(o.id)}
            className={`font-mono text-xs px-2 py-0.5 rounded transition-colors ${
              outcome_filter.includes(o.id)
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
