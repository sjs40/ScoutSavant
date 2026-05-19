import type { Pitch } from "../../types/pitch";
import { pitchColor } from "../../constants";
import { toSvgX, toSvgY } from "./ZoneGrid";

interface Props {
  pitch: Pitch;
  hovered: boolean;
  onEnter: (p: Pitch, svgX: number, svgY: number) => void;
  onLeave: () => void;
}

export function PitchDot({ pitch, hovered, onEnter, onLeave }: Props) {
  if (pitch.plate_x === null || pitch.plate_z === null) return null;

  const cx = toSvgX(pitch.plate_x);
  const cy = toSvgY(pitch.plate_z);
  const color = pitchColor(pitch.pitch_type);
  const r = hovered ? 7 : 5.5;
  const partial = pitch.pa_complete === false;

  const circleProps = {
    cx,
    cy,
    r,
    fill: color,
    fillOpacity: partial ? 0.45 : pitch.description === "called_strike" ? 0.45 : 0.82,
    stroke: hovered ? "white" : partial ? color : "#0a0c0f",
    strokeWidth: hovered ? 1.5 : partial ? 1 : 0.5,
    strokeDasharray: partial ? "2,2" : undefined,
  };

  return (
    <g
      onMouseEnter={() => onEnter(pitch, cx, cy)}
      onMouseLeave={onLeave}
      style={{ cursor: "crosshair" }}
    >
      <circle {...circleProps} />

      {/* ✕ overlay for whiffs */}
      {pitch.is_whiff && (
        <>
          <line
            x1={cx - r * 0.55} y1={cy - r * 0.55}
            x2={cx + r * 0.55} y2={cy + r * 0.55}
            stroke="white" strokeWidth={1.2} strokeOpacity={0.85}
            strokeLinecap="round"
          />
          <line
            x1={cx + r * 0.55} y1={cy - r * 0.55}
            x2={cx - r * 0.55} y2={cy + r * 0.55}
            stroke="white" strokeWidth={1.2} strokeOpacity={0.85}
            strokeLinecap="round"
          />
        </>
      )}

      {/* Larger hit target for hover */}
      <circle cx={cx} cy={cy} r={Math.max(r, 8)} fill="transparent" />
    </g>
  );
}
