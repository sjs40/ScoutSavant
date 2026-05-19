export const PITCH_COLORS: Record<string, string> = {
  FF: "#3b82f6",
  SL: "#ef4444",
  CH: "#22c55e",
  CU: "#a855f7",
  SI: "#06b6d4",
  FC: "#f97316",
  FS: "#ec4899",
  KC: "#facc15",
  ST: "#84cc16",
  SV: "#f43f5e",
};

export const DEFAULT_PITCH_COLOR = "#8b95a3";

export function pitchColor(type: string | null | undefined): string {
  if (!type) return DEFAULT_PITCH_COLOR;
  return PITCH_COLORS[type] ?? DEFAULT_PITCH_COLOR;
}

export const ALL_COUNTS = [
  "0-0", "1-0", "2-0", "3-0",
  "0-1", "1-1", "2-1", "3-1",
  "0-2", "1-2", "2-2", "3-2",
];
