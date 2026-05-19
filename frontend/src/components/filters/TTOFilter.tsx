import { useFilterStore } from "../../store/filterStore";

export function TTOFilter() {
  const { times_through_order, setFilter } = useFilterStore();

  const toggle = (v: number) => {
    const next = times_through_order.includes(v)
      ? times_through_order.filter((x) => x !== v)
      : [...times_through_order, v];
    setFilter("times_through_order", next);
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-text3 font-mono text-xs uppercase tracking-wider">
        Times Through Order
      </span>
      <div className="flex gap-1">
        {[1, 2, 3].map((v) => (
          <button
            key={v}
            onClick={() => toggle(v)}
            className={`font-mono text-xs px-3 py-1 rounded transition-colors ${
              times_through_order.includes(v)
                ? "bg-accent text-bg"
                : "bg-surface3 text-text2 hover:text-text"
            }`}
          >
            {v}×
          </button>
        ))}
      </div>
    </div>
  );
}
