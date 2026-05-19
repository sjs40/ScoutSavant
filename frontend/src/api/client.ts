export function apiError(status: number, message: string): Error & { status: number } {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
}

export async function apiFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(path, { signal });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    if (res.status === 429) {
      throw apiError(429, "Data source rate limited — try again in 60s");
    }
    throw apiError(res.status, text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function buildQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined) continue;
    if (Array.isArray(v)) {
      v.forEach((item) => q.append(k, String(item)));
    } else {
      q.set(k, String(v));
    }
  }
  return q.toString() ? `?${q.toString()}` : "";
}

export function friendlyError(err: unknown): string {
  if (err instanceof Error) {
    const e = err as Error & { status?: number };
    if (e.status === 429) return "Rate limited — try again in 60s";
    return e.message || "Unknown error";
  }
  return String(err);
}
