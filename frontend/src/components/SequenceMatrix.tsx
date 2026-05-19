import type { SequencesResponse } from "../types/api";
import { pitchColor } from "../constants";

function pct(v: number | null | undefined) {
  return v !== null && v !== undefined ? `${(v * 100).toFixed(0)}%` : "—";
}

export function SequenceMatrix({ data }: { data: SequencesResponse | null }) {
  if (!data) {
    return (
      <div className="bg-surface rounded-lg p-4 text-text3 font-mono text-sm animate-pulse">
        Loading…
      </div>
    );
  }

  const pitchTypes = Array.from(
    new Set([
      ...data.matrix.map((r) => r.prev),
      ...data.matrix.map((r) => r.next),
    ])
  ).filter(Boolean) as string[];

  const cellMap = new Map<string, (typeof data.matrix)[0]>();
  data.matrix.forEach((r) => {
    if (r.prev && r.next) cellMap.set(`${r.prev}|${r.next}`, r);
  });

  const total = data.matrix.reduce((sum, r) => sum + r.count, 0);

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
                    const cell = cellMap.get(`${prev}|${next}`);
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
          <div className="text-text3 font-mono text-xs mb-2">Top Sequences</div>
          <div className="flex flex-col gap-1">
            {data.top_sequences.slice(0, 5).map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-mono">
                <span className="text-text3 w-4">{i + 1}.</span>
                <span style={{ color: pitchColor(r.prev) }}>{r.prev}</span>
                <span className="text-text3">→</span>
                <span style={{ color: pitchColor(r.next) }}>{r.next}</span>
                <span className="text-text2 ml-auto">{r.count}x</span>
                <span className="text-text3">{pct(r.whiff_pct)} whiff</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
