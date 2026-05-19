import type { Pitch } from "./pitch";

export interface PitchesResponse {
  pitches: Pitch[];
  total: number;
  filtered: number;
}

export interface SummaryResponse {
  pitch_count: number;
  whiff_pct: number | null;
  whiff_pct_delta: number | null;
  csw_pct: number | null;
  csw_pct_delta: number | null;
  chase_pct: number | null;
  chase_pct_delta: number | null;
  hard_hit_pct: number | null;
  hard_hit_pct_delta: number | null;
  barrel_pct: number | null;
  barrel_pct_delta: number | null;
  avg_velocity: number | null;
  avg_velocity_delta: number | null;
  strike_pct: number | null;
  strike_pct_delta: number | null;
  zone_pct: number | null;
  zone_pct_delta: number | null;
  avg_ev: number | null;
  avg_ev_delta: number | null;
  xwoba: number | null;
  xwoba_delta: number | null;
  run_value: number | null;
}

export interface PitchUsageRow {
  pitch_type: string | null;
  count: number;
  usage_pct: number;
  whiff_pct: number | null;
  avg_velocity: number | null;
  csw_pct: number | null;
  zone_pct: number | null;
  xwoba: number | null;
}

export interface CountBucket {
  count: string;
  total: number;
  by_pitch_type: { pitch_type: string | null; count: number }[];
}

export interface StandBucket {
  stand: string;
  total: number;
  by_pitch_type: {
    pitch_type: string | null;
    count: number;
    usage_pct: number;
    whiff_pct: number | null;
    avg_velocity: number | null;
  }[];
}

export interface UsageResponse {
  by_pitch: PitchUsageRow[];
  by_count: CountBucket[];
  by_stand: StandBucket[];
}

export interface SequenceCellData {
  count: number;
  usage_pct: number;
  whiff_pct: number | null;
}

export interface TopSequenceItem {
  from: string;
  to: string;
  sample: number;
  usage_pct: number;
  whiff_pct: number;
}

export interface SequencesResponse {
  matrix: Record<string, Record<string, SequenceCellData>>;
  top_sequences: TopSequenceItem[];
}

export interface CountCellRow {
  count: string;
  pitch_count: number;
  whiff_pct: number | null;
  zone_pct: number | null;
  dominant_pitch_type: string | null;
  dominant_pct: number | null;
  by_pitch_type: { pitch_type: string | null; count: number }[];
}

export interface GameInfo {
  game_pk: number;
  home_team: string;
  away_team: string;
  status: string;
  game_date: string;
}

export interface PlayerInfo {
  pitcher_id: number;
  name: string;
  throws: string | null;
}

export interface IngestResponse {
  status: "cached" | "ingested";
  row_count: number;
  pulled_at: string | null;
  has_incomplete?: boolean;
  last_pulled_at?: string | null;
}
