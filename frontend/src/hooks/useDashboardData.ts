import { useEffect, useRef, useState } from "react";
import { useFilterStore } from "../store/filterStore";
import { fetchPitches } from "../api/pitches";
import { fetchSummary } from "../api/summary";
import { fetchUsage } from "../api/usage";
import { fetchSequences } from "../api/sequences";
import { fetchCounts } from "../api/counts";
import type {
  PitchesResponse,
  SummaryResponse,
  UsageResponse,
  SequencesResponse,
  CountCellRow,
} from "../types/api";

interface DashboardData {
  summary: SummaryResponse | null;
  pitches: PitchesResponse | null;
  usage: UsageResponse | null;
  sequences: SequencesResponse | null;
  counts: CountCellRow[] | null;
  loading: boolean;
  errors: Record<string, string | null>;
}

export function useDashboardData(): DashboardData {
  const store = useFilterStore();
  const trigger = store._trigger;
  const abortRef = useRef<AbortController | null>(null);

  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [pitches, setPitches] = useState<PitchesResponse | null>(null);
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [sequences, setSequences] = useState<SequencesResponse | null>(null);
  const [counts, setCounts] = useState<CountCellRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (!store.pitcher_id) return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);

    const filters = { ...store };

    const handle = <T>(
      key: string,
      promise: Promise<T>,
      setter: (v: T) => void
    ) =>
      promise
        .then((v) => {
          setter(v);
          setErrors((e) => ({ ...e, [key]: null }));
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            setErrors((e) => ({ ...e, [key]: err.message }));
          }
        });

    Promise.allSettled([
      handle("summary", fetchSummary(filters, ctrl.signal), setSummary),
      handle("pitches", fetchPitches(filters, ctrl.signal), setPitches),
      handle("usage", fetchUsage(filters, ctrl.signal), setUsage),
      handle("sequences", fetchSequences(filters, ctrl.signal), setSequences),
      handle("counts", fetchCounts(filters, ctrl.signal), setCounts),
    ]).finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [trigger]);

  return { summary, pitches, usage, sequences, counts, loading, errors };
}
