from db.connection import get_conn, get_lock
from query.filters import FilterParams, build_where_clause, table_name


def query(p: FilterParams) -> dict:
    where, bindings = build_where_clause(p)
    tbl = table_name(p)
    conn = get_conn()

    with get_lock():
        total_row = conn.execute(
            f"SELECT COUNT(*) FROM {tbl} WHERE pitcher_id = ? AND "
            + ("season = ?" if p.mode == "season" else "game_pk = ?"),
            [p.pitcher_id, p.season if p.mode == "season" else p.game_pk],
        ).fetchone()
        total = total_row[0] if total_row else 0

        filtered_row = conn.execute(
            f"SELECT COUNT(*) FROM {tbl} WHERE {where}", bindings
        ).fetchone()
        filtered = filtered_row[0] if filtered_row else 0

        rows = conn.execute(
            f"SELECT * FROM {tbl} WHERE {where} "
            f"ORDER BY game_date, at_bat_number, pitch_number "
            f"LIMIT ? OFFSET ?",
            bindings + [p.limit, p.offset],
        ).fetchdf()

    return {
        "pitches": rows.to_dict(orient="records"),
        "total": total,
        "filtered": filtered,
    }
