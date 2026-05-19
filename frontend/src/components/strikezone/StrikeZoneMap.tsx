import { useState } from "react";
import type { Pitch } from "../../types/pitch";
import type { PitchesResponse } from "../../types/api";
import { CANVAS_W, CANVAS_H, ZoneGrid } from "./ZoneGrid";
import { PitchDot } from "./PitchDot";
import { PitchTooltip } from "./PitchTooltip";

const MAX_DOTS = 500;

interface Props {
  data: PitchesResponse | null;
  loading?: boolean;
}

interface TooltipState {
  pitch: Pitch;
  x: number;
  y: number;
}

export function StrikeZoneMap({ data, loading }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const pitches = data?.pitches ?? [];
  const clipped = pitches.length > MAX_DOTS;
  const visible = clipped ? pitches.slice(0, MAX_DOTS) : pitches;

  return (
    <div className="bg-surface rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-text2 font-mono text-sm">Pitch Location</span>
        {clipped && (
          <span className="text-text3 font-mono text-xs">
            showing {MAX_DOTS} of {data?.filtered} pitches
          </span>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center" style={{ width: CANVAS_W, height: CANVAS_H }}>
          <span className="text-text3 font-mono text-sm animate-pulse">Loading…</span>
        </div>
      )}

      {!loading && (
        <div className="relative" style={{ width: CANVAS_W, height: CANVAS_H }}>
          <svg width={CANVAS_W} height={CANVAS_H} className="overflow-visible">
            <ZoneGrid />
            {visible.map((p) => (
              <PitchDot
                key={p.pitch_id}
                pitch={p}
                onEnter={(pitch, x, y) => setTooltip({ pitch, x, y })}
                onLeave={() => setTooltip(null)}
              />
            ))}
          </svg>
          {tooltip && (
            <PitchTooltip pitch={tooltip.pitch} x={tooltip.x} y={tooltip.y} />
          )}
        </div>
      )}

      {!loading && pitches.length === 0 && (
        <div
          className="flex items-center justify-center text-text3 font-mono text-sm"
          style={{ width: CANVAS_W, height: CANVAS_H }}
        >
          No pitches match filters
        </div>
      )}
    </div>
  );
}
