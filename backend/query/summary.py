from db.connection import get_conn, get_lock
from query.filters import FilterParams, build_where_clause, table_name

STRIKE_DESCRIPTIONS = (
    "called_strike", "swinging_strike", "swinging_strike_blocked",
    "foul", "foul_tip", "foul_bunt", "hit_into_play",
    "hit_into_play_no_out", "hit_into_play_score",
)


def _pct(numerator: int | None, denominator: int | None) -> float | None:
    if not denominator:
        return None
    return round(numerator / denominator, 4) if numerator is not None else None


def _delta(current: float | None, baseline: float | None) -> float | None:
    if current is None or baseline is None:
        return None
    return round(current - baseline, 4)


def query(p: FilterParams) -> dict:
    where, bindings = build_where_clause(p)
    tbl = table_name(p)
    conn = get_conn()
    strike_list = ", ".join(f"'{d}'" for d in STRIKE_DESCRIPTIONS)

    with get_lock():
        row = conn.execute(
            f"""
            SELECT
                COUNT(*)                                                        AS pitch_count,
                SUM(CAST(is_whiff AS INTEGER))                                  AS whiffs,
                SUM(CAST(is_csw AS INTEGER))                                    AS csw,
                SUM(CAST(is_chase AS INTEGER))                                  AS chases,
                SUM(CAST(is_hard_hit AS INTEGER))                               AS hard_hits,
                SUM(CAST(is_barrel AS INTEGER))                                 AS barrels,
                AVG(release_speed)                                              AS avg_velocity,
                SUM(CASE WHEN description IN ({strike_list}) THEN 1 ELSE 0 END) AS strikes,
                SUM(CASE WHEN zone >= 1 AND zone <= 9 THEN 1 ELSE 0 END)        AS in_zone,
                AVG(launch_speed)                                               AS avg_ev,
                AVG(estimated_woba_using_speedangle)                            AS xwoba,
                SUM(delta_run_exp)                                              AS run_value
            FROM {tbl} WHERE {where}
            """,
            bindings,
        ).fetchone()

        baseline_row = None
        if p.mode == "game" and p.season is not None:
            baseline_row = conn.execute(
                f"""
                SELECT
                    COUNT(*)                                                        AS pitch_count,
                    SUM(CAST(is_whiff AS INTEGER))                                  AS whiffs,
                    SUM(CAST(is_csw AS INTEGER))                                    AS csw,
                    SUM(CAST(is_chase AS INTEGER))                                  AS chases,
                    SUM(CAST(is_hard_hit AS INTEGER))                               AS hard_hits,
                    SUM(CAST(is_barrel AS INTEGER))                                 AS barrels,
                    AVG(release_speed)                                              AS avg_velocity,
                    SUM(CASE WHEN description IN ({strike_list}) THEN 1 ELSE 0 END) AS strikes,
                    SUM(CASE WHEN zone >= 1 AND zone <= 9 THEN 1 ELSE 0 END)        AS in_zone,
                    AVG(launch_speed)                                               AS avg_ev,
                    AVG(estimated_woba_using_speedangle)                            AS xwoba,
                    SUM(delta_run_exp)                                              AS run_value
                FROM pitches_season
                WHERE pitcher_id = ? AND season = ?
                """,
                [p.pitcher_id, p.season],
            ).fetchone()
            if baseline_row and not baseline_row[0]:
                baseline_row = None

    if not row or not row[0]:
        return {
            "pitch_count": 0,
            "whiff_pct": None, "whiff_pct_delta": None,
            "csw_pct": None, "csw_pct_delta": None,
            "chase_pct": None, "chase_pct_delta": None,
            "hard_hit_pct": None, "hard_hit_pct_delta": None,
            "barrel_pct": None, "barrel_pct_delta": None,
            "avg_velocity": None, "avg_velocity_delta": None,
            "strike_pct": None, "strike_pct_delta": None,
            "zone_pct": None, "zone_pct_delta": None,
            "avg_ev": None, "avg_ev_delta": None,
            "xwoba": None, "xwoba_delta": None,
            "run_value": None,
        }

    n = row[0]
    whiff_pct = _pct(row[1], n)
    csw_pct = _pct(row[2], n)
    chase_pct = _pct(row[3], n)
    hard_hit_pct = _pct(row[4], n)
    barrel_pct = _pct(row[5], n)
    avg_velocity = round(row[6], 1) if row[6] is not None else None
    strike_pct = _pct(row[7], n)
    zone_pct = _pct(row[8], n)
    avg_ev = round(row[9], 1) if row[9] is not None else None
    xwoba = round(row[10], 3) if row[10] is not None else None
    run_value = round(row[11], 2) if row[11] is not None else None

    b_whiff = b_csw = b_chase = b_hh = b_barrel = b_velo = b_strike = b_zone = b_ev = b_xwoba = None
    if baseline_row:
        bn = baseline_row[0]
        b_whiff = _pct(baseline_row[1], bn)
        b_csw = _pct(baseline_row[2], bn)
        b_chase = _pct(baseline_row[3], bn)
        b_hh = _pct(baseline_row[4], bn)
        b_barrel = _pct(baseline_row[5], bn)
        b_velo = round(baseline_row[6], 1) if baseline_row[6] is not None else None
        b_strike = _pct(baseline_row[7], bn)
        b_zone = _pct(baseline_row[8], bn)
        b_ev = round(baseline_row[9], 1) if baseline_row[9] is not None else None
        b_xwoba = round(baseline_row[10], 3) if baseline_row[10] is not None else None

    return {
        "pitch_count": n,
        "whiff_pct": whiff_pct,
        "whiff_pct_delta": _delta(whiff_pct, b_whiff),
        "csw_pct": csw_pct,
        "csw_pct_delta": _delta(csw_pct, b_csw),
        "chase_pct": chase_pct,
        "chase_pct_delta": _delta(chase_pct, b_chase),
        "hard_hit_pct": hard_hit_pct,
        "hard_hit_pct_delta": _delta(hard_hit_pct, b_hh),
        "barrel_pct": barrel_pct,
        "barrel_pct_delta": _delta(barrel_pct, b_barrel),
        "avg_velocity": avg_velocity,
        "avg_velocity_delta": _delta(avg_velocity, b_velo),
        "strike_pct": strike_pct,
        "strike_pct_delta": _delta(strike_pct, b_strike),
        "zone_pct": zone_pct,
        "zone_pct_delta": _delta(zone_pct, b_zone),
        "avg_ev": avg_ev,
        "avg_ev_delta": _delta(avg_ev, b_ev),
        "xwoba": xwoba,
        "xwoba_delta": _delta(xwoba, b_xwoba),
        "run_value": run_value,
    }
