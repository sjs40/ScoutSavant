import type { SummaryResponse } from "../types/api";

interface CardProps {
  label: string;
  value: number | null;
  baseline: number | null | undefined;
  format?: (v: number) => string;
  higherIsBetter?: boolean;
}

function fmt(v: number | null, f?: (n: number) => string): string {
  if (v === null || v === undefined) return "—";
  return f ? f(v) : String(v);
}

function MetricCard({ label, value, baseline, format, higherIsBetter = true }: CardProps) {
  const delta =
    value !== null && baseline !== null && baseline !== undefined
      ? value - baseline
      : null;
  const positive = delta !== null ? delta * (higherIsBetter ? 1 : -1) > 0 : null;

  return (
    <div className="bg-surface rounded-lg px-4 py-3 flex flex-col gap-1 min-w-[120px]">
      <span className="text-text3 font-mono text-xs uppercase tracking-wider">{label}</span>
      <span className="text-text font-mono text-xl font-semibold">{fmt(value, format)}</span>
      {delta !== null && (
        <span
          className={`font-mono text-xs ${positive ? "text-green" : "text-red"}`}
        >
          {delta > 0 ? "+" : ""}
          {fmt(delta, format)} vs season
        </span>
      )}
    </div>
  );
}

export function MetricCards({ data }: { data: SummaryResponse | null }) {
  if (!data) {
    return (
      <div className="flex gap-3 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-lg px-4 py-3 w-32 h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  const pct = (v: number | null) => (v !== null ? `${(v * 100).toFixed(1)}%` : "—");
  const b = data.baselines;

  return (
    <div className="flex gap-3 flex-wrap">
      <MetricCard
        label="Pitches"
        value={data.pitch_count}
        baseline={null}
        format={(v) => v.toLocaleString()}
      />
      <MetricCard
        label="Velocity"
        value={data.avg_velocity}
        baseline={null}
        format={(v) => `${v.toFixed(1)}`}
      />
      <MetricCard
        label="Whiff%"
        value={data.whiff_pct}
        baseline={b?.whiff_pct ?? null}
        format={pct}
        higherIsBetter={true}
      />
      <MetricCard
        label="CSW%"
        value={data.csw_pct}
        baseline={b?.csw_pct ?? null}
        format={pct}
        higherIsBetter={true}
      />
      <MetricCard
        label="Chase%"
        value={data.chase_pct}
        baseline={b?.chase_pct ?? null}
        format={pct}
        higherIsBetter={true}
      />
      <MetricCard
        label="Hard Hit%"
        value={data.hard_hit_pct}
        baseline={b?.hard_hit_pct ?? null}
        format={pct}
        higherIsBetter={false}
      />
      <MetricCard
        label="Barrel%"
        value={data.barrel_pct}
        baseline={b?.barrel_pct ?? null}
        format={pct}
        higherIsBetter={false}
      />
    </div>
  );
}
