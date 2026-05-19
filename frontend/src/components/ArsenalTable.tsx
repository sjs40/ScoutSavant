import { useState } from "react";
import type { UsageResponse } from "../types/api";
import { pitchColor, ALL_COUNTS } from "../constants";

type Tab = "pitch" | "count" | "stand";

const TABS: { id: Tab; label: string }[] = [
  { id: "pitch", label: "By Pitch" },
  { id: "count", label: "By Count" },
  { id: "stand", label: "By Hand" },
];

function pct(v: number | null | undefined) {
  return v !== null && v !== undefined ? `${(v * 100).toFixed(1)}%` : "—";
}

function coloredPct(
  v: number | null | undefined,
  opts: { greenAbove?: number; redAbove?: number; greenBelow?: number; redBelow?: number }
): { value: string; className: string } {
  if (v === null || v === undefined) return { value: "—", className: "text-text3" };
  const value = `${(v * 100).toFixed(1)}%`;
  let className = "text-text2";
  if (opts.greenAbove !== undefined && v >= opts.greenAbove) className = "text-green";
  else if (opts.redAbove !== undefined && v >= opts.redAbove) className = "text-red";
  else if (opts.greenBelow !== undefined && v <= opts.greenBelow) className = "text-green";
  else if (opts.redBelow !== undefined && v <= opts.redBelow) className = "text-red";
  return { value, className };
}

function UsageBar({ usage_pct }: { usage_pct: number }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-text2 tabular-nums w-[38px] text-right shrink-0">
        {(usage_pct * 100).toFixed(1)}%
      </span>
      <div className="flex-1 h-1.5 bg-surface3 rounded-full overflow-hidden min-w-[30px]">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(usage_pct * 100, 100)}%`, backgroundColor: "#00d4ff", opacity: 0.6 }}
        />
      </div>
    </div>
  );
}

function PitchBar({ pitch_type, count, total }: { pitch_type: string | null; count: number; total: number }) {
  const pctVal = total > 0 ? count / total : 0;
  return (
    <div className="flex items-center gap-1 h-3">
      <div
        className="h-full rounded-sm shrink-0"
        style={{
          width: `${Math.max(pctVal * 100, pctVal > 0 ? 3 : 0)}%`,
          backgroundColor: pitchColor(pitch_type),
          minWidth: pctVal > 0 ? 2 : 0,
        }}
      />
      <span className="text-text3 font-mono text-[10px]">{pitch_type}</span>
    </div>
  );
}

function ByPitchTab({ data }: { data: UsageResponse }) {
  const whiffOpts = { greenAbove: 0.30, redBelow: 0.20 };
  const cswOpts = { greenAbove: 0.32, redBelow: 0.26 };
  const chaseOpts = { greenAbove: 0.32 };
  const xwobaOpts = { greenBelow: 0.280, redAbove: 0.360 };
  const hhOpts = { redAbove: 0.40, greenBelow: 0.30 };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono" style={{ minWidth: 440 }}>
        <thead>
          <tr className="text-text3 border-b border-border text-right">
            <th className="text-left py-1 pr-2 font-normal">Type</th>
            <th className="py-1 pr-2 font-normal">Usage</th>
            <th className="py-1 pr-1 font-normal">Velo</th>
            <th className="py-1 pr-1 font-normal">Zone%</th>
            <th className="py-1 pr-1 font-normal">Whiff%</th>
            <th className="py-1 pr-1 font-normal">Chase%</th>
            <th className="py-1 pr-1 font-normal">CSW%</th>
            <th className="py-1 pr-1 font-normal">xwOBA</th>
            <th className="py-1 font-normal">HH%</th>
          </tr>
        </thead>
        <tbody>
          {data.by_pitch.map((row) => {
            if (!row.pitch_type) return null;
            const whiff = coloredPct(row.whiff_pct, whiffOpts);
            const csw = coloredPct(row.csw_pct, cswOpts);
            const chase = coloredPct(row.chase_pct, chaseOpts);
            const xwoba = row.xwoba != null
              ? coloredPct(row.xwoba, xwobaOpts)
              : { value: "—", className: "text-text3" };
            const hh = coloredPct(row.hard_hit_pct, hhOpts);

            return (
              <tr key={row.pitch_type} className="border-b border-border/40 hover:bg-surface2">
                <td className="py-1.5 pr-2">
                  <div className="flex items-center gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: pitchColor(row.pitch_type) }}
                    />
                    <span style={{ color: pitchColor(row.pitch_type) }}>{row.pitch_type}</span>
                  </div>
                </td>
                <td className="py-1.5 pr-2">
                  <UsageBar usage_pct={row.usage_pct} />
                </td>
                <td className="py-1.5 pr-1 text-right text-text2 tabular-nums">
                  {row.avg_velocity?.toFixed(1) ?? "—"}
                </td>
                <td className="py-1.5 pr-1 text-right tabular-nums text-text2">
                  {pct(row.zone_pct)}
                </td>
                <td className={`py-1.5 pr-1 text-right tabular-nums ${whiff.className}`}>
                  {whiff.value}
                </td>
                <td className={`py-1.5 pr-1 text-right tabular-nums ${chase.className}`}>
                  {chase.value}
                </td>
                <td className={`py-1.5 pr-1 text-right tabular-nums ${csw.className}`}>
                  {csw.value}
                </td>
                <td className={`py-1.5 pr-1 text-right tabular-nums ${xwoba.className}`}>
                  {row.xwoba?.toFixed(3) ?? "—"}
                </td>
                <td className={`py-1.5 text-right tabular-nums ${hh.className}`}>
                  {hh.value}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ByCountTab({ data }: { data: UsageResponse }) {
  const countMap = Object.fromEntries(data.by_count.map((c) => [c.count, c]));
  return (
    <div className="grid grid-cols-4 gap-1 text-xs font-mono">
      {ALL_COUNTS.map((count) => {
        const cell = countMap[count];
        const total = cell?.total ?? 0;
        return (
          <div key={count} className="bg-surface2 rounded p-1.5">
            <div className="text-text3 text-[10px] mb-0.5">{count}</div>
            <div className="text-text text-[10px] mb-1 font-semibold">{total}</div>
            <div className="flex flex-col gap-0.5">
              {cell?.by_pitch_type.slice(0, 3).map((pt) => (
                <PitchBar
                  key={pt.pitch_type}
                  pitch_type={pt.pitch_type}
                  count={pt.count}
                  total={total}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ByStandTab({ data }: { data: UsageResponse }) {
  return (
    <div className="flex gap-4">
      {data.by_stand.map((stand) => (
        <div key={stand.stand} className="flex-1 min-w-0">
          <div className="text-text3 font-mono text-xs mb-2 font-semibold">vs {stand.stand}HB</div>
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-text3 border-b border-border">
                <th className="text-left py-1 font-normal">Type</th>
                <th className="text-right py-1 font-normal">Usage</th>
                <th className="text-right py-1 font-normal">Whiff%</th>
              </tr>
            </thead>
            <tbody>
              {stand.by_pitch_type.map((row) => (
                <tr key={row.pitch_type} className="border-b border-border/40">
                  <td className="py-1 flex items-center gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: pitchColor(row.pitch_type) }}
                    />
                    <span style={{ color: pitchColor(row.pitch_type) }}>{row.pitch_type}</span>
                  </td>
                  <td className="text-right py-1 text-text2">{pct(row.usage_pct)}</td>
                  <td className="text-right py-1 text-text2">{pct(row.whiff_pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      {data.by_stand.length === 0 && (
        <span className="text-text3 text-xs font-mono">No split data</span>
      )}
    </div>
  );
}

export function ArsenalTable({ data }: { data: UsageResponse | null }) {
  const [tab, setTab] = useState<Tab>("pitch");

  return (
    <div className="bg-surface rounded-lg p-4 flex flex-col gap-3 flex-1 min-w-0 overflow-hidden">
      <div className="flex items-center gap-1 border-b border-border pb-2">
        <span className="text-text2 font-mono text-sm mr-2">Arsenal</span>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`font-mono text-xs px-2.5 py-1 rounded transition-colors ${
              tab === t.id
                ? "bg-surface3 text-text"
                : "text-text3 hover:text-text2"
            }`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!data && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 bg-surface2 rounded animate-pulse" />
          ))}
        </div>
      )}

      {data && tab === "pitch" && <ByPitchTab data={data} />}
      {data && tab === "count" && <ByCountTab data={data} />}
      {data && tab === "stand" && <ByStandTab data={data} />}
    </div>
  );
}
