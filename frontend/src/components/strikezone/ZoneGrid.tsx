const CANVAS_W = 300;
const CANVAS_H = 350;
const SZ_X_MIN = -1.5;
const SZ_X_MAX = 1.5;
const SZ_Z_MIN = 1.0;
const SZ_Z_MAX = 4.5;

export const toSvgX = (px: number) =>
  ((px - SZ_X_MIN) / (SZ_X_MAX - SZ_X_MIN)) * CANVAS_W;

export const toSvgY = (pz: number) =>
  CANVAS_H - ((pz - SZ_Z_MIN) / (SZ_Z_MAX - SZ_Z_MIN)) * CANVAS_H;

const ZONE_LEFT = toSvgX(-0.708);
const ZONE_RIGHT = toSvgX(0.708);
const ZONE_TOP = toSvgY(3.5);
const ZONE_BOT = toSvgY(1.5);
const ZONE_W = ZONE_RIGHT - ZONE_LEFT;
const ZONE_H = ZONE_BOT - ZONE_TOP;

export function ZoneGrid() {
  return (
    <g>
      <rect
        x={ZONE_LEFT}
        y={ZONE_TOP}
        width={ZONE_W}
        height={ZONE_H}
        fill="none"
        stroke="#252b35"
        strokeWidth={1.5}
      />
      {[1 / 3, 2 / 3].map((t) => (
        <line
          key={`v${t}`}
          x1={ZONE_LEFT + ZONE_W * t}
          y1={ZONE_TOP}
          x2={ZONE_LEFT + ZONE_W * t}
          y2={ZONE_BOT}
          stroke="#252b35"
          strokeWidth={1}
        />
      ))}
      {[1 / 3, 2 / 3].map((t) => (
        <line
          key={`h${t}`}
          x1={ZONE_LEFT}
          y1={ZONE_TOP + ZONE_H * t}
          x2={ZONE_RIGHT}
          y2={ZONE_TOP + ZONE_H * t}
          stroke="#252b35"
          strokeWidth={1}
        />
      ))}
      <rect
        x={toSvgX(-0.708) - 6}
        y={CANVAS_H - 6}
        width={ZONE_W + 12}
        height={6}
        fill="#333"
        rx={1}
      />
    </g>
  );
}

export { CANVAS_W, CANVAS_H };
