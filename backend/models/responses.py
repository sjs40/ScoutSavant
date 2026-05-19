from typing import Any
from pydantic import BaseModel


class IngestResponse(BaseModel):
    status: str
    row_count: int
    pulled_at: str | None = None
    has_incomplete: bool | None = None
    last_pulled_at: str | None = None


class PitchesResponse(BaseModel):
    pitches: list[dict[str, Any]]
    total: int
    filtered: int


class SummaryResponse(BaseModel):
    pitch_count: int
    whiff_pct: float | None
    csw_pct: float | None
    chase_pct: float | None
    hard_hit_pct: float | None
    barrel_pct: float | None
    avg_velocity: float | None
    baselines: dict[str, float | None] | None = None


class PitchUsageRow(BaseModel):
    pitch_type: str | None
    count: int
    usage_pct: float
    whiff_pct: float | None
    avg_velocity: float | None


class UsageResponse(BaseModel):
    by_pitch: list[PitchUsageRow]
    by_count: list[dict[str, Any]]
    by_stand: list[dict[str, Any]]


class SequenceMatrixRow(BaseModel):
    prev: str | None
    next: str | None
    count: int
    whiff_pct: float | None


class SequencesResponse(BaseModel):
    matrix: list[SequenceMatrixRow]
    top_sequences: list[SequenceMatrixRow]


class CountCellRow(BaseModel):
    count: str
    pitch_count: int
    whiff_pct: float | None
    by_pitch_type: list[dict[str, Any]]
