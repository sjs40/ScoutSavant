from db.connection import get_conn, get_lock
from query.filters import FilterParams, build_where_clause, table_name

MIN_SAMPLES = 5


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

    total = sum(r[2] for r in rows)

    # Build nested dict: matrix[prev][next] = {usage_pct, whiff_pct, count}
    matrix: dict[str, dict[str, dict]] = {}
    for r in rows:
        prev, nxt, cnt, whiffs = r[0], r[1], r[2], r[3]
        usage_pct = round(cnt / total, 4) if total else 0
        whiff_pct = round(whiffs / cnt, 4) if cnt else None
        matrix.setdefault(prev, {})[nxt] = {
            "count": cnt,
            "usage_pct": usage_pct,
            "whiff_pct": whiff_pct,
        }

    # Top 5 sequences: min MIN_SAMPLES, sorted by whiff_pct desc
    eligible = [
        {
            "from": r[0],
            "to": r[1],
            "sample": r[2],
            "usage_pct": round(r[2] / total, 4) if total else 0,
            "whiff_pct": round(r[3] / r[2], 4) if r[2] else 0,
        }
        for r in rows
        if r[2] >= MIN_SAMPLES
    ]
    top_sequences = sorted(eligible, key=lambda x: x["whiff_pct"], reverse=True)[:5]

    return {"matrix": matrix, "top_sequences": top_sequences}
