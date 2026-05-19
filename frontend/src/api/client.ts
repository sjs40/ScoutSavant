export function apiError(status: number, message: string): Error & { status: number } {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
}

export async function apiFetch<T>(
  path: string,
  signal?: AbortSignal
): Promise<T> {
  const res = await fetch(path, { signal });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw apiError(res.status, text);
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
