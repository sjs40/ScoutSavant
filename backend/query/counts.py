from db.connection import get_conn, get_lock
from query.filters import FilterParams, build_where_clause, table_name, ALL_COUNTS


def query(p: FilterParams) -> list[dict]:
    where, bindings = build_where_clause(p)
    tbl = table_name(p)
    conn = get_conn()

    with get_lock():
        rows = conn.execute(
            f"""
            SELECT
                count,
                pitch_type,
                COUNT(*)                                                    AS cnt,
                SUM(CAST(is_whiff AS INTEGER))                              AS whiffs,
                SUM(CASE WHEN zone >= 1 AND zone <= 9 THEN 1 ELSE 0 END)   AS in_zone
            FROM {tbl}
            WHERE {where} AND pitch_type IS NOT NULL
            GROUP BY count, pitch_type
            ORDER BY count, cnt DESC
            """,
            bindings,
        ).fetchall()

    count_map: dict[str, dict] = {}
    for count_cell in ALL_COUNTS:
        count_map[count_cell] = {
            "count": count_cell,
            "pitch_count": 0,
            "whiff_count": 0,
            "in_zone_count": 0,
            "by_pitch_type": [],
        }

    for r in rows:
        cell, pt, cnt, whiffs, in_zone = r[0], r[1], r[2], r[3], r[4]
        if cell not in count_map:
            count_map[cell] = {"count": cell, "pitch_count": 0, "whiff_count": 0, "in_zone_count": 0, "by_pitch_type": []}
        count_map[cell]["pitch_count"] += cnt
        count_map[cell]["whiff_count"] += (whiffs or 0)
        count_map[cell]["in_zone_count"] += (in_zone or 0)
        count_map[cell]["by_pitch_type"].append({"pitch_type": pt, "count": cnt})

    result = []
    for cell in count_map.values():
        n = cell["pitch_count"]
        by_pt = cell["by_pitch_type"]
        dominant_pitch_type = by_pt[0]["pitch_type"] if by_pt else None
        dominant_pct = round(by_pt[0]["count"] / n, 4) if (by_pt and n) else None
        result.append({
            "count": cell["count"],
            "pitch_count": n,
            "whiff_pct": round(cell["whiff_count"] / n, 4) if n else None,
            "zone_pct": round(cell["in_zone_count"] / n, 4) if n else None,
            "dominant_pitch_type": dominant_pitch_type,
            "dominant_pct": dominant_pct,
            "by_pitch_type": by_pt,
        })

    return result
