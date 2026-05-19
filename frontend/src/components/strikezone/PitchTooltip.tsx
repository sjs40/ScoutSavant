import type { Pitch } from "../../types/pitch";

interface Props {
  pitch: Pitch;
  x: number;
  y: number;
}

export function PitchTooltip({ pitch, x, y }: Props) {
  return (
    <div
      className="absolute z-50 pointer-events-none bg-surface border border-border rounded p-2 text-xs font-mono text-text2 shadow-lg min-w-[160px]"
      style={{ left: x + 12, top: y - 10 }}
    >
      <div className="text-text font-semibold mb-1">
        {pitch.pitch_type ?? "?"} — {pitch.release_speed?.toFixed(1) ?? "—"} mph
      </div>
      <div>Spin: {pitch.spin_rate?.toFixed(0) ?? "—"} rpm</div>
      <div>
        Move: {pitch.pfx_x?.toFixed(1) ?? "—"}" / {pitch.pfx_z?.toFixed(1) ?? "—"}"
      </div>
      <div>Count: {pitch.count}</div>
      <div>Result: {pitch.description ?? "—"}</div>
      {pitch.estimated_woba_using_speedangle !== null && (
        <div>xwOBA: {pitch.estimated_woba_using_speedangle?.toFixed(3)}</div>
      )}
      {pitch.sequence_prev_pitch_type && (
        <div className="mt-1 text-text3">
          Prev: {pitch.sequence_prev_pitch_type}
        </div>
      )}
    </div>
  );
}
