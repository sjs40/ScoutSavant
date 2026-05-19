from db.connection import get_conn, get_lock
from query.filters import FilterParams, build_where_clause, table_name


def _pct(numerator: int | None, denominator: int | None) -> float | None:
    if not denominator:
        return None
    return round(numerator / denominator, 4) if numerator is not None else None


def query(p: FilterParams) -> dict:
    where, bindings = build_where_clause(p)
    tbl = table_name(p)
    conn = get_conn()

    with get_lock():
        row = conn.execute(
            f"""
            SELECT
                COUNT(*)                                        AS pitch_count,
                SUM(CAST(is_whiff AS INTEGER))                  AS whiffs,
                SUM(CAST(is_csw AS INTEGER))                    AS csw,
                SUM(CAST(is_chase AS INTEGER))                  AS chases,
                SUM(CAST(is_hard_hit AS INTEGER))               AS hard_hits,
                SUM(CAST(is_barrel AS INTEGER))                 AS barrels,
                AVG(release_speed)                              AS avg_velocity
            FROM {tbl} WHERE {where}
            """,
            bindings,
        ).fetchone()

        baselines = None
        if p.mode == "game":
            b = conn.execute(
                """
                SELECT
                    COUNT(*)                                    AS pitch_count,
                    SUM(CAST(is_whiff AS INTEGER))              AS whiffs,
                    SUM(CAST(is_csw AS INTEGER))                AS csw,
                    SUM(CAST(is_chase AS INTEGER))              AS chases,
                    SUM(CAST(is_hard_hit AS INTEGER))           AS hard_hits,
                    SUM(CAST(is_barrel AS INTEGER))             AS barrels
                FROM pitches_season
                WHERE pitcher_id = ? AND season = ?
                """,
                [p.pitcher_id, p.season],
            ).fetchone()
            if b and b[0]:
                baselines = {
                    "whiff_pct": _pct(b[1], b[0]),
                    "csw_pct": _pct(b[2], b[0]),
                    "chase_pct": _pct(b[3], b[0]),
                    "hard_hit_pct": _pct(b[4], b[0]),
                    "barrel_pct": _pct(b[5], b[0]),
                }

    if not row:
        return {
            "pitch_count": 0, "whiff_pct": None, "csw_pct": None,
            "chase_pct": None, "hard_hit_pct": None, "barrel_pct": None,
            "avg_velocity": None, "baselines": baselines,
        }

    n = row[0]
    return {
        "pitch_count": n,
        "whiff_pct": _pct(row[1], n),
        "csw_pct": _pct(row[2], n),
        "chase_pct": _pct(row[3], n),
        "hard_hit_pct": _pct(row[4], n),
        "barrel_pct": _pct(row[5], n),
        "avg_velocity": round(row[6], 1) if row[6] is not None else None,
        "baselines": baselines,
    }
