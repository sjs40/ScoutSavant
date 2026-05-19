export const CANVAS_W = 290;
export const CANVAS_H = 320;

// Coordinate transforms: plate_x in [-1.5, 1.5] ft, plate_z in [0, 5] ft
export const toSvgX = (px: number) => ((px + 1.5) / 3.0) * 190 + 50;
export const toSvgY = (pz: number) => 290 - (pz / 5.0) * 250;

// Strike zone rect (approx 1.5–3.5 ft height, ±0.708 ft wide)
const ZONE_X = 88;
const ZONE_Y = 90;
const ZONE_W = 114;
const ZONE_H = 140;

// Chase zone (dashed, outer boundary)
const CHASE_X = 50;
const CHASE_Y = 40;
const CHASE_W = 190;
const CHASE_H = 240;

const CELL_W = ZONE_W / 3;
const CELL_H = ZONE_H / 3;

// Home plate polygon (centered at x=145, bottom at y=295)
const PLATE_CX = 145;
const PLATE_Y = 295;
const PLATE_W = 34;
const PLATE_H = 12;

export function ZoneGrid() {
  return (
    <g>
      {/* Chase zone boundary */}
      <rect
        x={CHASE_X}
        y={CHASE_Y}
        width={CHASE_W}
        height={CHASE_H}
        fill="none"
        stroke="#252b35"
        strokeWidth={1}
        strokeDasharray="4,3"
      />

      {/* Strike zone */}
      <rect
        x={ZONE_X}
        y={ZONE_Y}
        width={ZONE_W}
        height={ZONE_H}
        fill="none"
        stroke="#3a4455"
        strokeWidth={1.5}
      />

      {/* 3×3 grid lines */}
      {[1, 2].map((i) => (
        <line
          key={`v${i}`}
          x1={ZONE_X + CELL_W * i}
          y1={ZONE_Y}
          x2={ZONE_X + CELL_W * i}
          y2={ZONE_Y + ZONE_H}
          stroke="#252b35"
          strokeWidth={1}
        />
      ))}
      {[1, 2].map((i) => (
        <line
          key={`h${i}`}
          x1={ZONE_X}
          y1={ZONE_Y + CELL_H * i}
          x2={ZONE_X + ZONE_W}
          y2={ZONE_Y + CELL_H * i}
          stroke="#252b35"
          strokeWidth={1}
        />
      ))}

      {/* Home plate */}
      <polygon
        points={[
          `${PLATE_CX - PLATE_W / 2},${PLATE_Y}`,
          `${PLATE_CX + PLATE_W / 2},${PLATE_Y}`,
          `${PLATE_CX + PLATE_W / 2},${PLATE_Y + PLATE_H - 6}`,
          `${PLATE_CX},${PLATE_Y + PLATE_H}`,
          `${PLATE_CX - PLATE_W / 2},${PLATE_Y + PLATE_H - 6}`,
        ].join(" ")}
        fill="none"
        stroke="#3a4455"
        strokeWidth={1.5}
      />
    </g>
  );
}
