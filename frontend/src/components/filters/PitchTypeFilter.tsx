import { useFilterStore } from "../../store/filterStore";
import { PITCH_COLORS } from "../../constants";

const TYPES = Object.keys(PITCH_COLORS);

export function PitchTypeFilter() {
  const { pitch_type, setFilter } = useFilterStore();

  const toggle = (pt: string) => {
    const next = pitch_type.includes(pt)
      ? pitch_type.filter((x) => x !== pt)
      : [...pitch_type, pt];
    setFilter("pitch_type", next);
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-text3 font-mono text-xs uppercase tracking-wider">Pitch Type</span>
      <div className="flex flex-wrap gap-1">
        {TYPES.map((pt) => {
          const active = pitch_type.includes(pt);
          return (
            <button
              key={pt}
              onClick={() => toggle(pt)}
              className="font-mono text-xs px-2 py-0.5 rounded transition-all"
              style={{
                backgroundColor: active ? PITCH_COLORS[pt] : "#171b21",
                color: active ? "#0a0c0f" : PITCH_COLORS[pt],
                border: `1px solid ${PITCH_COLORS[pt]}`,
              }}
            >
              {pt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
