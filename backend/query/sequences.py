from db.connection import get_conn, get_lock
from query.filters import FilterParams, build_where_clause, table_name


def query(p: FilterParams) -> dict:
    where, bindings = build_where_clause(p)
    tbl = table_name(p)
    conn = get_conn()

    with get_lock():
        rows = conn.execute(
            f"""
            SELECT
                sequence_prev_pitch_type        AS prev,
                pitch_type                      AS next,
                COUNT(*)                        AS cnt,
                SUM(CAST(is_whiff AS INTEGER))  AS whiffs
            FROM {tbl}
            WHERE {where}
              AND sequence_prev_pitch_type IS NOT NULL
              AND pitch_type IS NOT NULL
            GROUP BY prev, next
            ORDER BY cnt DESC
            """,
            bindings,
        ).fetchall()

    matrix = [
        {
            "prev": r[0],
            "next": r[1],
            "count": r[2],
            "whiff_pct": round(r[3] / r[2], 4) if r[2] else None,
        }
        for r in rows
    ]

    return {"matrix": matrix, "top_sequences": matrix[:10]}
