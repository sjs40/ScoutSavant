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

function PitchBar({ pitch_type, count, total }: { pitch_type: string | null; count: number; total: number }) {
  const pctVal = total > 0 ? count / total : 0;
  return (
    <div className="flex items-center gap-1 h-3">
      <div
        className="h-full rounded-sm"
        style={{
          width: `${pctVal * 100}%`,
          backgroundColor: pitchColor(pitch_type),
          minWidth: pctVal > 0 ? 2 : 0,
        }}
      />
      <span className="text-text3 font-mono text-[10px]">{pitch_type}</span>
    </div>
  );
}

function ByPitchTab({ data }: { data: UsageResponse }) {
  return (
    <table className="w-full text-xs font-mono">
      <thead>
        <tr className="text-text3 border-b border-border">
          <th className="text-left py-1">Type</th>
          <th className="text-right py-1">Usage</th>
          <th className="text-right py-1">Whiff%</th>
          <th className="text-right py-1">Velo</th>
        </tr>
      </thead>
      <tbody>
        {data.by_pitch.map((row) => (
          <tr key={row.pitch_type} className="border-b border-border/50 hover:bg-surface2">
            <td className="py-1 flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-sm inline-block"
                style={{ backgroundColor: pitchColor(row.pitch_type) }}
              />
              {row.pitch_type ?? "?"}
            </td>
            <td className="text-right py-1 text-text2">{pct(row.usage_pct)}</td>
            <td className="text-right py-1 text-text2">{pct(row.whiff_pct)}</td>
            <td className="text-right py-1 text-text2">
              {row.avg_velocity?.toFixed(1) ?? "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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
            <div className="text-text3 mb-1">{count}</div>
            <div className="text-text text-[10px] mb-1">{total}</div>
            <div className="flex flex-col gap-0.5">
              {cell?.by_pitch_type.slice(0, 4).map((pt) => (
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
        <div key={stand.stand} className="flex-1">
          <div className="text-text3 font-mono text-xs mb-2">vs {stand.stand}HB</div>
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-text3 border-b border-border">
                <th className="text-left py-1">Type</th>
                <th className="text-right py-1">Usage</th>
                <th className="text-right py-1">Whiff%</th>
              </tr>
            </thead>
            <tbody>
              {stand.by_pitch_type.map((row) => (
                <tr key={row.pitch_type} className="border-b border-border/50">
                  <td className="py-1 flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-sm inline-block"
                      style={{ backgroundColor: pitchColor(row.pitch_type) }}
                    />
                    {row.pitch_type ?? "?"}
                  </td>
                  <td className="text-right py-1 text-text2">{pct(row.usage_pct)}</td>
                  <td className="text-right py-1 text-text2">{pct(row.whiff_pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export function ArsenalTable({ data }: { data: UsageResponse | null }) {
  const [tab, setTab] = useState<Tab>("pitch");

  return (
    <div className="bg-surface rounded-lg p-4 flex flex-col gap-3 flex-1">
      <div className="flex items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`font-mono text-xs px-3 py-1 rounded transition-colors ${
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
        <div className="text-text3 font-mono text-sm animate-pulse">Loading…</div>
      )}

      {data && tab === "pitch" && <ByPitchTab data={data} />}
      {data && tab === "count" && <ByCountTab data={data} />}
      {data && tab === "stand" && <ByStandTab data={data} />}
    </div>
  );
}
