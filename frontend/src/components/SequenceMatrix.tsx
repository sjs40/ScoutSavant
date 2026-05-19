import type { SequencesResponse } from "../types/api";
import { pitchColor } from "../constants";

function pct(v: number | null | undefined) {
  return v !== null && v !== undefined ? `${(v * 100).toFixed(0)}%` : "—";
}

export function SequenceMatrix({ data }: { data: SequencesResponse | null | undefined }) {
  if (!data) {
    return (
      <div className="bg-surface rounded-lg p-4 text-text3 font-mono text-sm animate-pulse h-40" />
    );
  }

  const pitchTypes = Array.from(
    new Set([
      ...Object.keys(data.matrix),
      ...Object.values(data.matrix).flatMap((nexts) => Object.keys(nexts)),
    ])
  ).filter(Boolean);

  // Total pitches in matrix for usage% denominator
  const total = Object.values(data.matrix).reduce(
    (sum, nexts) => sum + Object.values(nexts).reduce((s, c) => s + c.count, 0),
    0
  );

  return (
    <div className="bg-surface rounded-lg p-4 flex flex-col gap-4">
      <span className="text-text2 font-mono text-sm">Pitch Sequences</span>

      {pitchTypes.length === 0 ? (
        <span className="text-text3 font-mono text-xs">No sequence data</span>
      ) : (
        <div className="overflow-x-auto">
          <table className="text-xs font-mono border-collapse">
            <thead>
              <tr>
                <th className="text-text3 p-1 text-left">prev ↓ next →</th>
                {pitchTypes.map((next) => (
                  <th key={next} className="p-1 text-center" style={{ color: pitchColor(next) }}>
                    {next}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pitchTypes.map((prev) => (
                <tr key={prev} className="border-b border-border/30">
                  <td className="p-1 font-semibold" style={{ color: pitchColor(prev) }}>
                    {prev}
                  </td>
                  {pitchTypes.map((next) => {
                    const cell = data.matrix[prev]?.[next];
                    const usagePct = cell ? cell.count / total : 0;
                    return (
                      <td
                        key={next}
                        className="p-1 text-center"
                        style={{
                          backgroundColor: cell
                            ? `rgba(0, 212, 255, ${Math.min(usagePct * 10, 0.3)})`
                            : "transparent",
                        }}
                      >
                        {cell ? (
                          <div className="flex flex-col items-center">
                            <span className="text-text">{pct(usagePct)}</span>
                            <span className="text-text3 text-[10px]">
                              {pct(cell.whiff_pct)} w
                            </span>
                          </div>
                        ) : (
                          <span className="text-border">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.top_sequences.length > 0 && (
        <div>
          <div className="text-text3 font-mono text-xs mb-2">Top Sequences (by whiff%)</div>
          <div className="flex flex-col gap-1">
            {data.top_sequences.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-mono">
                <span className="text-text3 w-4">{i + 1}.</span>
                <span style={{ color: pitchColor(r.from) }}>{r.from}</span>
                <span className="text-text3">→</span>
                <span style={{ color: pitchColor(r.to) }}>{r.to}</span>
                <span className="text-text3 ml-1 text-[10px]">n={r.sample}</span>
                <span className="text-text2 ml-auto">{pct(r.whiff_pct)} whiff</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
