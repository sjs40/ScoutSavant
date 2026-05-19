import type { SummaryResponse } from "../types/api";

interface CardProps {
  label: string;
  abbr?: string;
  value: number | null | undefined;
  delta: number | null | undefined;
  format: (v: number) => string;
  deltaFormat?: (v: number) => string;
  higherIsBetter?: boolean;
  threshold?: { green: number; red: number };
}

function fmt(v: number | null | undefined, f: (n: number) => string): string {
  return v === null || v === undefined ? "—" : f(v);
}

function MetricCard({
  label, abbr, value, delta, format, deltaFormat, higherIsBetter = true, threshold,
}: CardProps) {
  const dFmt = deltaFormat ?? format;
  const sign = delta !== null && delta !== undefined ? (delta > 0 ? "+" : "") : "";
  const positive = delta !== null && delta !== undefined
    ? delta * (higherIsBetter ? 1 : -1) > 0
    : null;

  let valueColor = "text-text";
  if (threshold && value !== null && value !== undefined) {
    if (higherIsBetter) {
      if (value >= threshold.green) valueColor = "text-green";
      else if (value <= threshold.red) valueColor = "text-red";
    } else {
      if (value <= threshold.green) valueColor = "text-green";
      else if (value >= threshold.red) valueColor = "text-red";
    }
  }

  return (
    <div className="bg-surface rounded-lg px-4 py-3 flex flex-col gap-1 min-w-[110px]">
      <span className="text-text3 font-mono text-xs uppercase tracking-wider" title={abbr}>
        {label}
      </span>
      <span className={`font-mono text-xl font-semibold ${valueColor}`}>
        {fmt(value, format)}
      </span>
      {delta !== null && delta !== undefined && (
        <span className={`font-mono text-xs ${positive ? "text-green" : "text-red"}`}>
          {sign}{fmt(delta, dFmt)} vs season
        </span>
      )}
    </div>
  );
}

function SkeletonCard() {
  return <div className="bg-surface rounded-lg px-4 py-3 w-28 h-16 animate-pulse" />;
}

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const pctDelta = (v: number) => `${(v * 100).toFixed(1)}pp`;
const mph = (v: number) => `${v.toFixed(1)}`;
const xwoba = (v: number) => v.toFixed(3);
const rv = (v: number) => (v > 0 ? "+" : "") + v.toFixed(1);

export function MetricCards({ data, loading }: { data: SummaryResponse | null | undefined; loading?: boolean }) {
  if (loading && !data) {
    return (
      <div className="flex gap-3 flex-wrap">
        {Array.from({ length: 11 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="flex gap-3 flex-wrap">
      <MetricCard
        label="Pitches"
        value={data.pitch_count}
        delta={null}
        format={(v) => v.toLocaleString()}
      />
      <MetricCard
        label="Velo"
        abbr="Average release velocity (mph)"
        value={data.avg_velocity}
        delta={data.avg_velocity_delta}
        format={mph}
        higherIsBetter={true}
      />
      <MetricCard
        label="Strike%"
        abbr="Strikes / total pitches"
        value={data.strike_pct}
        delta={data.strike_pct_delta}
        format={pct}
        deltaFormat={pctDelta}
        higherIsBetter={true}
        threshold={{ green: 0.65, red: 0.58 }}
      />
      <MetricCard
        label="Zone%"
        abbr="Pitches in the strike zone (zones 1–9)"
        value={data.zone_pct}
        delta={data.zone_pct_delta}
        format={pct}
        deltaFormat={pctDelta}
        higherIsBetter={true}
        threshold={{ green: 0.50, red: 0.40 }}
      />
      <MetricCard
        label="Whiff%"
        abbr="Swinging strikes / swings"
        value={data.whiff_pct}
        delta={data.whiff_pct_delta}
        format={pct}
        deltaFormat={pctDelta}
        higherIsBetter={true}
        threshold={{ green: 0.30, red: 0.20 }}
      />
      <MetricCard
        label="Chase%"
        abbr="Swings at out-of-zone pitches"
        value={data.chase_pct}
        delta={data.chase_pct_delta}
        format={pct}
        deltaFormat={pctDelta}
        higherIsBetter={true}
        threshold={{ green: 0.32, red: 0.24 }}
      />
      <MetricCard
        label="CSW%"
        abbr="Called strikes + whiffs / total pitches"
        value={data.csw_pct}
        delta={data.csw_pct_delta}
        format={pct}
        deltaFormat={pctDelta}
        higherIsBetter={true}
        threshold={{ green: 0.32, red: 0.26 }}
      />
      <MetricCard
        label="Hard Hit%"
        abbr="Balls in play with exit velocity ≥ 95 mph"
        value={data.hard_hit_pct}
        delta={data.hard_hit_pct_delta}
        format={pct}
        deltaFormat={pctDelta}
        higherIsBetter={false}
        threshold={{ green: 0.35, red: 0.42 }}
      />
      <MetricCard
        label="xwOBA"
        abbr="Expected weighted on-base average (Statcast)"
        value={data.xwoba}
        delta={data.xwoba_delta}
        format={xwoba}
        higherIsBetter={false}
        threshold={{ green: 0.280, red: 0.340 }}
      />
      <MetricCard
        label="Avg EV"
        abbr="Average exit velocity on balls in play (mph)"
        value={data.avg_ev}
        delta={data.avg_ev_delta}
        format={mph}
        higherIsBetter={false}
        threshold={{ green: 86, red: 92 }}
      />
      <MetricCard
        label="Run Val"
        abbr="Cumulative run value (delta_run_exp)"
        value={data.run_value}
        delta={null}
        format={rv}
        higherIsBetter={false}
      />
    </div>
  );
}
