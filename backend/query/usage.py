from db.connection import get_conn, get_lock
from query.filters import FilterParams, build_where_clause, table_name, ALL_COUNTS


def query(p: FilterParams) -> dict:
    where, bindings = build_where_clause(p)
    tbl = table_name(p)
    conn = get_conn()

    with get_lock():
        total_row = conn.execute(
            f"SELECT COUNT(*) FROM {tbl} WHERE {where}", bindings
        ).fetchone()
        total = total_row[0] if total_row else 0

        by_pitch_rows = conn.execute(
            f"""
            SELECT
                pitch_type,
                COUNT(*)                                                    AS cnt,
                SUM(CAST(is_whiff AS INTEGER))                              AS whiffs,
                AVG(release_speed)                                          AS avg_velo,
                SUM(CAST(is_csw AS INTEGER))                                AS csw,
                SUM(CASE WHEN zone >= 1 AND zone <= 9 THEN 1 ELSE 0 END)   AS in_zone,
                AVG(estimated_woba_using_speedangle)                        AS xwoba,
                SUM(CAST(is_hard_hit AS INTEGER))                           AS hard_hits,
                SUM(CAST(is_chase AS INTEGER))                              AS chases
            FROM {tbl} WHERE {where}
            GROUP BY pitch_type
            ORDER BY cnt DESC
            """,
            bindings,
        ).fetchall()

        by_count_rows = conn.execute(
            f"""
            SELECT count, pitch_type, COUNT(*) AS cnt
            FROM {tbl} WHERE {where}
            GROUP BY count, pitch_type
            ORDER BY count, cnt DESC
            """,
            bindings,
        ).fetchall()

        by_stand_rows = conn.execute(
            f"""
            SELECT stand, pitch_type, COUNT(*) AS cnt,
                   SUM(CAST(is_whiff AS INTEGER)) AS whiffs,
                   AVG(release_speed) AS avg_velo
            FROM {tbl} WHERE {where}
            GROUP BY stand, pitch_type
            ORDER BY stand, cnt DESC
            """,
            bindings,
        ).fetchall()

    by_pitch = [
        {
            "pitch_type": r[0],
            "count": r[1],
            "usage_pct": round(r[1] / total, 4) if total else 0,
            "whiff_pct": round(r[2] / r[1], 4) if r[1] else None,
            "avg_velocity": round(r[3], 1) if r[3] is not None else None,
            "csw_pct": round(r[4] / r[1], 4) if r[1] else None,
            "zone_pct": round(r[5] / r[1], 4) if r[1] else None,
            "xwoba": round(r[6], 3) if r[6] is not None else None,
            "hard_hit_pct": round(r[7] / r[1], 4) if r[1] else None,
            "chase_pct": round(r[8] / r[1], 4) if r[1] else None,
        }
        for r in by_pitch_rows
    ]

    count_map: dict[str, dict] = {c: {"count": c, "total": 0, "by_pitch_type": []} for c in ALL_COUNTS}
    count_totals: dict[str, int] = {}
    for r in by_count_rows:
        count_cell, pt, cnt = r[0], r[1], r[2]
        if count_cell not in count_map:
            count_map[count_cell] = {"count": count_cell, "total": 0, "by_pitch_type": []}
        count_map[count_cell]["by_pitch_type"].append({"pitch_type": pt, "count": cnt})
        count_totals[count_cell] = count_totals.get(count_cell, 0) + cnt
    for c, cell in count_map.items():
        cell["total"] = count_totals.get(c, 0)
    by_count = list(count_map.values())

    stand_groups: dict[str, list] = {}
    stand_totals: dict[str, int] = {}
    for r in by_stand_rows:
        s, pt, cnt, whiffs, avg_velo = r
        stand_totals[s] = stand_totals.get(s, 0) + cnt
        stand_groups.setdefault(s, []).append(
            {"pitch_type": pt, "count": cnt, "whiff_count": whiffs,
             "avg_velocity": round(avg_velo, 1) if avg_velo else None}
        )
    by_stand = [
        {
            "stand": s,
            "total": stand_totals[s],
            "by_pitch_type": [
                {**row,
                 "usage_pct": round(row["count"] / stand_totals[s], 4) if stand_totals[s] else 0,
                 "whiff_pct": round(row["whiff_count"] / row["count"], 4) if row["count"] else None}
                for row in rows
            ],
        }
        for s, rows in stand_groups.items()
    ]

    return {"by_pitch": by_pitch, "by_count": by_count, "by_stand": by_stand}
