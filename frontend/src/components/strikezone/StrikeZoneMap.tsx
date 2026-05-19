import { useState } from "react";
import type { Pitch } from "../../types/pitch";
import type { PitchesResponse } from "../../types/api";
import { CANVAS_W, CANVAS_H, ZoneGrid } from "./ZoneGrid";
import { PitchDot } from "./PitchDot";
import { PitchTooltip } from "./PitchTooltip";
import { pitchColor } from "../../constants";

const MAX_DOTS = 500;

interface Props {
  data: PitchesResponse | null;
  loading?: boolean;
  isFetching?: boolean;
  error?: string | null;
}

interface TooltipState {
  pitch: Pitch;
  x: number;
  y: number;
}

function PitchLegend({ pitches }: { pitches: Pitch[] }) {
  const counts: Record<string, number> = {};
  for (const p of pitches) {
    if (p.pitch_type) counts[p.pitch_type] = (counts[p.pitch_type] ?? 0) + 1;
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const hasPartialPA = pitches.some((p) => p.pa_complete === false);
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
      {entries.map(([pt, cnt]) => (
        <div key={pt} className="flex items-center gap-1 font-mono text-[10px] text-text3">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: pitchColor(pt) }}
          />
          <span style={{ color: pitchColor(pt) }}>{pt}</span>
          <span className="text-text3">{cnt}</span>
        </div>
      ))}
      {hasPartialPA && (
        <div className="flex items-center gap-1 font-mono text-[10px] text-text3">
          <span className="text-text3">◌</span>
          <span className="text-text3">Active PA</span>
        </div>
      )}
    </div>
  );
}

export function StrikeZoneMap({ data, loading, isFetching, error }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const pitches = data?.pitches ?? [];
  const clipped = pitches.length > MAX_DOTS;
  const visible = clipped ? pitches.slice(0, MAX_DOTS) : pitches;

  const handleEnter = (pitch: Pitch, x: number, y: number) => {
    setTooltip({ pitch, x, y });
  };

  return (
    <div
      className={`bg-surface rounded-lg p-4 flex flex-col gap-2 shrink-0 transition-opacity ${isFetching && data ? "opacity-50" : ""}`}
      style={{ width: 340 }}
    >
      <div className="flex items-center justify-between">
        <span className="text-text2 font-mono text-sm">Pitch Location</span>
        {clipped && (
          <span className="text-text3 font-mono text-[10px]">
            {MAX_DOTS} of {data?.filtered} shown
          </span>
        )}
      </div>

      {loading && !data && (
        <div
          className="flex items-center justify-center"
          style={{ width: CANVAS_W, height: CANVAS_H }}
        >
          <span className="text-text3 font-mono text-sm animate-pulse">Loading…</span>
        </div>
      )}

      {error && !data && (
        <div
          className="flex items-center justify-center"
          style={{ width: CANVAS_W, height: CANVAS_H }}
        >
          <span className="text-red font-mono text-xs text-center px-4">{error}</span>
        </div>
      )}

      {(!loading || data) && pitches.length === 0 && !loading && (
        <div
          className="flex items-center justify-center text-text3 font-mono text-sm"
          style={{ width: CANVAS_W, height: CANVAS_H }}
        >
          {data ? "No pitches match filters" : "Select a pitcher to begin"}
        </div>
      )}

      {(!loading || data) && pitches.length > 0 && (
        <div className="relative" style={{ width: CANVAS_W, height: CANVAS_H }}>
          <svg
            width={CANVAS_W}
            height={CANVAS_H}
            className="overflow-visible"
            onMouseLeave={() => setTooltip(null)}
          >
            <ZoneGrid />
            {visible.map((p) => (
              <PitchDot
                key={p.pitch_id}
                pitch={p}
                hovered={tooltip?.pitch.pitch_id === p.pitch_id}
                onEnter={handleEnter}
                onLeave={() => setTooltip(null)}
              />
            ))}
          </svg>
          {tooltip && (
            <PitchTooltip pitch={tooltip.pitch} x={tooltip.x} y={tooltip.y} />
          )}
        </div>
      )}

      <PitchLegend pitches={pitches} />
    </div>
  );
}
