export const PITCH_COLORS: Record<string, string> = {
  FF: "var(--pitch-ff)",
  SL: "var(--pitch-sl)",
  CH: "var(--pitch-ch)",
  CU: "var(--pitch-cu)",
  SI: "var(--pitch-si)",
  FC: "var(--pitch-fc)",
  FS: "var(--pitch-fs)",
  KC: "var(--pitch-kc)",
  ST: "var(--pitch-st)",
  SV: "var(--pitch-sv)",
};

export const DEFAULT_PITCH_COLOR = "var(--text3)";

export function pitchColor(type: string | null | undefined): string {
  if (!type) return DEFAULT_PITCH_COLOR;
  return PITCH_COLORS[type] ?? DEFAULT_PITCH_COLOR;
}

export const ALL_COUNTS = [
  "0-0", "1-0", "2-0", "3-0",
  "0-1", "1-1", "2-1", "3-1",
  "0-2", "1-2", "2-2", "3-2",
];
