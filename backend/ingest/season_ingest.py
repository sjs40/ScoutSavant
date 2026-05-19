from datetime import datetime, timezone

from db.connection import get_conn, get_lock
from db.transforms import derive_fields
from ingest.statcast import fetch_season

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


def ingest_season(pitcher_id: int, season: int) -> dict:
    conn = get_conn()
    lock = get_lock()

    with lock:
        cached = conn.execute(
            "SELECT pitch_count FROM metadata WHERE pitcher_id = ? AND season = ? AND mode = 'season'",
            [pitcher_id, season],
        ).fetchone()

    if cached:
        return {"status": "cached", "row_count": cached[0], "pulled_at": None}

    df = fetch_season(pitcher_id, season)
    if df.empty:
        return {"status": "ingested", "row_count": 0, "pulled_at": datetime.now(timezone.utc).isoformat()}

    df["season"] = season
    df = derive_fields(df)
    avail = [c for c in _COLS if c in df.columns]
    df = df[avail].copy()

    now = datetime.now(timezone.utc)
    record_id = f"{pitcher_id}_{season}_season"

    with lock:
        conn.register("_df", df)
        cols = ", ".join(avail)
        conn.execute(
            f"INSERT OR IGNORE INTO pitches_season ({cols}) SELECT {cols} FROM _df"
        )
        conn.unregister("_df")
        conn.execute(
            """
            INSERT OR REPLACE INTO metadata (record_id, pitcher_id, season, game_pk, mode, last_pulled, pitch_count)
            VALUES (?, ?, ?, NULL, 'season', ?, ?)
            """,
            [record_id, pitcher_id, season, now, len(df)],
        )

    return {"status": "ingested", "row_count": len(df), "pulled_at": now.isoformat()}
