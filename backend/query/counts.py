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
                COUNT(*) AS cnt,
                SUM(CAST(is_whiff AS INTEGER)) AS whiffs
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
            "by_pitch_type": [],
        }

    for r in rows:
        cell, pt, cnt, whiffs = r[0], r[1], r[2], r[3]
        if cell not in count_map:
            count_map[cell] = {"count": cell, "pitch_count": 0, "whiff_count": 0, "by_pitch_type": []}
        count_map[cell]["pitch_count"] += cnt
        count_map[cell]["whiff_count"] += (whiffs or 0)
        count_map[cell]["by_pitch_type"].append({"pitch_type": pt, "count": cnt})

    result = []
    for cell in count_map.values():
        n = cell["pitch_count"]
        result.append({
            "count": cell["count"],
            "pitch_count": n,
            "whiff_pct": round(cell["whiff_count"] / n, 4) if n else None,
            "by_pitch_type": cell["by_pitch_type"],
        })

    return result
