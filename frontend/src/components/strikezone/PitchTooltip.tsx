import type { Pitch } from "../../types/pitch";
import { pitchColor } from "../../constants";
import { CANVAS_W, CANVAS_H } from "./ZoneGrid";

interface Props {
  pitch: Pitch;
  x: number;
  y: number;
}

const TOOLTIP_W = 168;
const TOOLTIP_H = 140;

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (value == null) return null;
  return (
    <div className="flex justify-between gap-3">
      <span className="text-text3">{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}

export function PitchTooltip({ pitch, x, y }: Props) {
  const left = x + 14 + TOOLTIP_W > CANVAS_W ? x - TOOLTIP_W - 6 : x + 14;
  const top = Math.max(0, Math.min(y - 8, CANVAS_H - TOOLTIP_H));
  const outcome = pitch.events ?? pitch.description ?? "—";

  return (
    <div
      className="absolute z-50 pointer-events-none bg-surface2 border border-border rounded p-2 font-mono shadow-xl"
      style={{ left, top, width: TOOLTIP_W, fontSize: 10 }}
    >
      <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-border">
        <span
          className="px-1.5 py-0.5 rounded text-bg text-[9px] font-semibold uppercase"
          style={{ backgroundColor: pitchColor(pitch.pitch_type) }}
        >
          {pitch.pitch_type ?? "?"}
        </span>
        <span className="text-text text-[11px] font-semibold">
          {pitch.release_speed?.toFixed(1) ?? "—"} mph
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <Row label="Spin" value={pitch.spin_rate != null ? `${pitch.spin_rate.toFixed(0)} rpm` : null} />
        <Row label="IVB" value={pitch.pfx_z != null ? `${(pitch.pfx_z * 12).toFixed(1)}"` : null} />
        <Row label="HB" value={pitch.pfx_x != null ? `${(pitch.pfx_x * 12).toFixed(1)}"` : null} />
        <Row label="Count" value={pitch.count} />
        <Row label="Inn" value={pitch.inning?.toString()} />
        <Row label="Zone" value={pitch.zone?.toString()} />
        <Row label="xBA" value={pitch.estimated_ba_using_speedangle?.toFixed(3)} />
        <Row label="xwOBA" value={pitch.estimated_woba_using_speedangle?.toFixed(3)} />
        <div className="flex justify-between gap-3 mt-1 pt-1 border-t border-border">
          <span className="text-text3">Result</span>
          <span className="text-text truncate max-w-[100px]">{outcome}</span>
        </div>
        {pitch.sequence_prev_pitch_type && (
          <div className="flex items-center gap-1 mt-0.5 text-text3">
            <span style={{ color: pitchColor(pitch.sequence_prev_pitch_type) }}>
              {pitch.sequence_prev_pitch_type}
            </span>
            <span>→</span>
            <span style={{ color: pitchColor(pitch.pitch_type) }}>{pitch.pitch_type}</span>
          </div>
        )}
      </div>
    </div>
  );
}
