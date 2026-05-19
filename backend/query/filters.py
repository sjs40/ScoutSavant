from typing import Annotated, Literal, Optional
from fastapi import Query
from pydantic import BaseModel

COUNT_GROUP_MAP: dict[str, list[str]] = {
    "ahead":        ["0-1", "0-2", "1-2"],
    "behind":       ["1-0", "2-0", "3-0", "2-1", "3-1"],
    "two_strike":   ["0-2", "1-2", "2-2", "3-2"],
    "first_pitch":  ["0-0"],
}

OUTCOME_COL_MAP: dict[str, str] = {
    "whiff":         "is_whiff",
    "chase":         "is_chase",
    "csw":           "is_csw",
    "hard_hit":      "is_hard_hit",
    "barrel":        "is_barrel",
    "called_strike": "_called_strike",
    "in_play":       "_in_play",
}

ALL_COUNTS = [
    "0-0", "1-0", "2-0", "3-0",
    "0-1", "1-1", "2-1", "3-1",
    "0-2", "1-2", "2-2", "3-2",
]


class FilterParams(BaseModel):
    mode: Literal["season", "game"] = "season"
    pitcher_id: int
    season: Optional[int] = None
    game_pk: Optional[int] = None
    pitch_type: Optional[list[str]] = None
    stand: Optional[Literal["L", "R"]] = None
    count: Optional[list[str]] = None
    inning_min: Optional[int] = None
    inning_max: Optional[int] = None
    times_through_order: Optional[list[int]] = None
    outcome_filter: Optional[list[str]] = None
    limit: int = 500
    offset: int = 0

    @classmethod
    def depends(cls) -> "FilterParams":
        def _deps(
            pitcher_id: Annotated[int, Query()],
            mode: Annotated[Literal["season", "game"], Query()] = "season",
            season: Annotated[Optional[int], Query()] = None,
            game_pk: Annotated[Optional[int], Query()] = None,
            pitch_type: Annotated[Optional[list[str]], Query()] = None,
            stand: Annotated[Optional[Literal["L", "R"]], Query()] = None,
            count: Annotated[Optional[list[str]], Query()] = None,
            inning_min: Annotated[Optional[int], Query()] = None,
            inning_max: Annotated[Optional[int], Query()] = None,
            times_through_order: Annotated[Optional[list[int]], Query()] = None,
            outcome_filter: Annotated[Optional[list[str]], Query()] = None,
            limit: Annotated[int, Query(ge=1, le=5000)] = 500,
            offset: Annotated[int, Query(ge=0)] = 0,
        ) -> "FilterParams":
            return cls(
                mode=mode, pitcher_id=pitcher_id, season=season, game_pk=game_pk,
                pitch_type=pitch_type, stand=stand, count=count,
                inning_min=inning_min, inning_max=inning_max,
                times_through_order=times_through_order,
                outcome_filter=outcome_filter, limit=limit, offset=offset,
            )
        return _deps  # type: ignore[return-value]


def build_where_clause(p: FilterParams) -> tuple[str, list]:
    clauses: list[str] = []
    bindings: list = []

    clauses.append("pitcher_id = ?")
    bindings.append(p.pitcher_id)

    if p.mode == "season":
        if p.season is not None:
            clauses.append("season = ?")
            bindings.append(p.season)
    else:
        if p.game_pk is not None:
            clauses.append("game_pk = ?")
            bindings.append(p.game_pk)

    if p.pitch_type:
        placeholders = ", ".join("?" * len(p.pitch_type))
        clauses.append(f"pitch_type IN ({placeholders})")
        bindings.extend(p.pitch_type)

    if p.stand:
        clauses.append("stand = ?")
        bindings.append(p.stand)

    if p.count:
        resolved: set[str] = set()
        for c in p.count:
            resolved.update(COUNT_GROUP_MAP.get(c, [c]))
        placeholders = ", ".join("?" * len(resolved))
        clauses.append(f"count IN ({placeholders})")
        bindings.extend(sorted(resolved))

    if p.inning_min is not None:
        clauses.append("inning >= ?")
        bindings.append(p.inning_min)

    if p.inning_max is not None:
        clauses.append("inning <= ?")
        bindings.append(p.inning_max)

    if p.times_through_order:
        placeholders = ", ".join("?" * len(p.times_through_order))
        clauses.append(f"times_through_order IN ({placeholders})")
        bindings.extend(p.times_through_order)

    if p.outcome_filter:
        outcome_clauses: list[str] = []
        for o in p.outcome_filter:
            col = OUTCOME_COL_MAP.get(o)
            if col == "_called_strike":
                outcome_clauses.append("description = 'called_strike'")
            elif col == "_in_play":
                outcome_clauses.append("pa_complete = TRUE")
            elif col:
                outcome_clauses.append(f"{col} = TRUE")
        if outcome_clauses:
            clauses.append("(" + " OR ".join(outcome_clauses) + ")")

    return " AND ".join(clauses), bindings


def table_name(p: FilterParams) -> str:
    return "pitches_season" if p.mode == "season" else "pitches_game"
