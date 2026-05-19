from datetime import datetime, timezone

from db.connection import get_conn, get_lock
from db.transforms import derive_fields
from ingest.statcast import fetch_game

_COLS = [
    "pitch_id", "pitcher_id", "season", "game_pk", "game_date",
    "at_bat_number", "pitch_number", "pitch_type",
    "release_speed", "pfx_x", "pfx_z", "spin_rate",
    "plate_x", "plate_z", "balls", "strikes", "count",
    "stand", "inning", "description", "events",
    "estimated_ba_using_speedangle", "estimated_woba_using_speedangle",
    "launch_speed", "launch_angle", "delta_run_exp",
    "is_whiff", "is_chase", "is_csw", "is_hard_hit", "is_barrel",
    "sequence_prev_pitch_type", "sequence_prev_location_x", "sequence_prev_location_z",
    "times_through_order", "pa_complete",
]


def ingest_game(pitcher_id: int, game_pk: int, season: int, refresh: bool = False) -> dict:
    conn = get_conn()
    lock = get_lock()

    if not refresh:
        with lock:
            existing = conn.execute(
                "SELECT COUNT(*) FROM pitches_game WHERE pitcher_id = ? AND game_pk = ?",
                [pitcher_id, game_pk],
            ).fetchone()[0]
        if existing > 0:
            meta = conn.execute(
                "SELECT last_pulled, pitch_count FROM metadata "
                "WHERE pitcher_id = ? AND game_pk = ? AND mode = 'game'",
                [pitcher_id, game_pk],
            ).fetchone()
            has_incomplete = conn.execute(
                "SELECT COUNT(*) FROM pitches_game WHERE pitcher_id = ? AND game_pk = ? AND pa_complete = FALSE",
                [pitcher_id, game_pk],
            ).fetchone()[0] > 0
            return {
                "status": "cached",
                "row_count": meta[1] if meta else existing,
                "has_incomplete": has_incomplete,
                "last_pulled_at": meta[0].isoformat() if meta else None,
            }

    df = fetch_game(pitcher_id, game_pk, season)
    if df.empty:
        return {
            "status": "ingested",
            "row_count": 0,
            "has_incomplete": False,
            "last_pulled_at": datetime.now(timezone.utc).isoformat(),
        }

    df["season"] = season
    df = derive_fields(df)
    has_incomplete = bool((~df["pa_complete"]).any()) if "pa_complete" in df.columns else False
    avail = [c for c in _COLS if c in df.columns]
    df = df[avail].copy()

    now = datetime.now(timezone.utc)
    record_id = f"{pitcher_id}_{game_pk}_game"

    with lock:
        if refresh:
            conn.execute(
                "DELETE FROM pitches_game WHERE pitcher_id = ? AND game_pk = ?",
                [pitcher_id, game_pk],
            )
        conn.register("_df", df)
        cols = ", ".join(avail)
        conn.execute(
            f"INSERT OR IGNORE INTO pitches_game ({cols}) SELECT {cols} FROM _df"
        )
        conn.unregister("_df")
        conn.execute(
            """
            INSERT OR REPLACE INTO metadata (record_id, pitcher_id, season, game_pk, mode, last_pulled, pitch_count)
            VALUES (?, ?, ?, ?, 'game', ?, ?)
            """,
            [record_id, pitcher_id, season, game_pk, now, len(df)],
        )

    return {
        "status": "ingested",
        "row_count": len(df),
        "has_incomplete": has_incomplete,
        "last_pulled_at": now.isoformat(),
    }
