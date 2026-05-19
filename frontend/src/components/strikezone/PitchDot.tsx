import type { Pitch } from "../../types/pitch";
import { pitchColor } from "../../constants";
import { toSvgX, toSvgY } from "./ZoneGrid";

interface Props {
  pitch: Pitch;
  onEnter: (p: Pitch, svgX: number, svgY: number) => void;
  onLeave: () => void;
}

const R = 4;

function diamond(cx: number, cy: number, r: number) {
  return `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;
}

export function PitchDot({ pitch, onEnter, onLeave }: Props) {
  if (pitch.plate_x === null || pitch.plate_z === null) return null;

  const cx = toSvgX(pitch.plate_x);
  const cy = toSvgY(pitch.plate_z);
  const color = pitchColor(pitch.pitch_type);
  const partial = pitch.pa_complete === false;

  const baseProps = {
    fill: color,
    fillOpacity: partial ? 0.5 : 0.85,
    stroke: partial ? color : "#0a0c0f",
    strokeWidth: partial ? 1 : 0.5,
    strokeDasharray: partial ? "2,2" : undefined,
    onMouseEnter: () => onEnter(pitch, cx, cy),
    onMouseLeave: onLeave,
  };

  if (pitch.is_barrel) {
    return (
      <polygon
        points={`${cx},${cy - R - 1} ${cx + R + 1},${cy + R} ${cx - R - 1},${cy + R}`}
        {...baseProps}
      />
    );
  }

  if (pitch.is_whiff) {
    return (
      <polygon
        points={diamond(cx, cy, R)}
        {...baseProps}
      />
    );
  }

  if (pitch.description === "called_strike") {
    return (
      <rect
        x={cx - R}
        y={cy - R}
        width={R * 2}
        height={R * 2}
        {...baseProps}
      />
    );
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      r={R}
      {...baseProps}
      fillOpacity={partial ? 0.5 : 0.7}
    />
  );
}
