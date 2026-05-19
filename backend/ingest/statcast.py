import time
import pandas as pd
import pybaseball

pybaseball.cache.enable()

REQUIRED_COLUMNS = [
    "pitcher", "game_pk", "game_date", "game_type",
    "home_team", "away_team", "inning", "inning_topbot",
    "at_bat_number", "pitch_number", "batter", "stand", "p_throws",
    "pitch_type", "pitch_name",
    "release_speed", "release_spin_rate", "release_extension",
    "release_pos_x", "release_pos_y", "release_pos_z",
    "pfx_x", "pfx_z", "plate_x", "plate_z",
    "vx0", "vy0", "vz0", "ax", "ay", "az",
    "sz_top", "sz_bot", "effective_speed", "spin_axis",
    "zone", "type", "description", "events", "bb_type",
    "launch_speed", "launch_angle", "hit_distance_sc",
    "hc_x", "hc_y",
    "estimated_ba_using_speedangle", "estimated_woba_using_speedangle",
    "delta_run_exp", "delta_home_win_exp",
    "post_home_score", "post_away_score",
    "balls", "strikes", "outs_when_up",
    "on_1b", "on_2b", "on_3b",
]

_RETRIES = 4
_BACKOFF = [2, 4, 8, 16]


def fetch_season(pitcher_id: int, season: int) -> pd.DataFrame:
    start_dt = f"{season}-03-01"
    end_dt = f"{season}-11-30"
    return _fetch_with_retry(pitcher_id, start_dt, end_dt)


def fetch_game(pitcher_id: int, game_pk: int, season: int) -> pd.DataFrame:
    start_dt = f"{season}-03-01"
    end_dt = f"{season}-11-30"
    df = _fetch_with_retry(pitcher_id, start_dt, end_dt)
    if df.empty:
        return df
    return df[df["game_pk"] == game_pk].copy()


def _fetch_with_retry(pitcher_id: int, start_dt: str, end_dt: str) -> pd.DataFrame:
    last_err: Exception | None = None
    for attempt in range(_RETRIES):
        try:
            df = pybaseball.statcast_pitcher(start_dt, end_dt, pitcher_id)
            return _normalize(df)
        except Exception as exc:
            last_err = exc
            if attempt < _RETRIES - 1:
                time.sleep(_BACKOFF[attempt])
    raise RuntimeError(f"statcast fetch failed after {_RETRIES} attempts: {last_err}")


def _normalize(df: pd.DataFrame) -> pd.DataFrame:
    if df is None or df.empty:
        return pd.DataFrame(columns=REQUIRED_COLUMNS)

    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"pybaseball DataFrame missing expected columns: {missing}")

    df = df.rename(columns={"pitcher": "pitcher_id"})
    cols = ["pitcher_id"] + [c for c in REQUIRED_COLUMNS if c != "pitcher"]
    df = df[cols].copy()

    df["pitcher_id"] = df["pitcher_id"].astype("Int32")
    df["batter"] = df["batter"].astype("Int32")
    df["game_pk"] = df["game_pk"].astype("Int32")
    df["game_date"] = pd.to_datetime(df["game_date"]).dt.date
    df["inning"] = df["inning"].astype("Int16")
    df["at_bat_number"] = df["at_bat_number"].astype("Int16")
    df["pitch_number"] = df["pitch_number"].astype("Int16")
    df["balls"] = df["balls"].astype("Int16")
    df["strikes"] = df["strikes"].astype("Int16")
    df["outs_when_up"] = df["outs_when_up"].astype("Int16")
    df["zone"] = df["zone"].astype("Int16")
    df["post_home_score"] = df["post_home_score"].astype("Int16")
    df["post_away_score"] = df["post_away_score"].astype("Int16")
    df["on_1b"] = df["on_1b"].astype("Int32")
    df["on_2b"] = df["on_2b"].astype("Int32")
    df["on_3b"] = df["on_3b"].astype("Int32")

    return df.reset_index(drop=True)
