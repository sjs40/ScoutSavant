import type { Pitch } from "./pitch";

export interface PitchesResponse {
  pitches: Pitch[];
  total: number;
  filtered: number;
}

export interface SummaryBaselines {
  whiff_pct: number | null;
  csw_pct: number | null;
  chase_pct: number | null;
  hard_hit_pct: number | null;
  barrel_pct: number | null;
}

export interface SummaryResponse {
  pitch_count: number;
  whiff_pct: number | null;
  csw_pct: number | null;
  chase_pct: number | null;
  hard_hit_pct: number | null;
  barrel_pct: number | null;
  avg_velocity: number | null;
  baselines: SummaryBaselines | null;
}

export interface PitchUsageRow {
  pitch_type: string | null;
  count: number;
  usage_pct: number;
  whiff_pct: number | null;
  avg_velocity: number | null;
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

export interface SequenceRow {
  prev: string | null;
  next: string | null;
  count: number;
  whiff_pct: number | null;
}

export interface SequencesResponse {
  matrix: SequenceRow[];
  top_sequences: SequenceRow[];
}

export interface CountCellRow {
  count: string;
  pitch_count: number;
  whiff_pct: number | null;
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
  player_id: number;
  name: string;
  position: string | null;
  team: string | null;
}

export interface IngestResponse {
  status: "cached" | "ingested";
  row_count: number;
  pulled_at: string | null;
  has_incomplete?: boolean;
  last_pulled_at?: string | null;
}
