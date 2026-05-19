import pandas as pd

WHIFF_DESCRIPTIONS = {"swinging_strike", "swinging_strike_blocked"}

SWING_DESCRIPTIONS = {
    "hit_into_play",
    "hit_into_play_no_out",
    "hit_into_play_score",
    "swinging_strike",
    "swinging_strike_blocked",
    "foul",
    "foul_tip",
    "foul_bunt",
    "missed_bunt",
}

CSW_DESCRIPTIONS = {"called_strike", "swinging_strike", "swinging_strike_blocked"}

OUT_OF_ZONE = {11, 12, 13, 14}


def _barrel_angle_min(speed: float) -> float:
    return max(8.0, 26.0 - 2.0 * (speed - 98.0))


def _barrel_angle_max(speed: float) -> float:
    return min(50.0, 30.0 + 2.0 * (speed - 98.0))


def add_derived_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    df["count"] = df["balls"].astype(str) + "-" + df["strikes"].astype(str)

    df["is_whiff"] = df["description"].isin(WHIFF_DESCRIPTIONS).fillna(False)

    out_of_zone = df["zone"].isin(OUT_OF_ZONE)
    swung = df["description"].isin(SWING_DESCRIPTIONS)
    df["is_chase"] = (out_of_zone & swung).fillna(False)

    df["is_csw"] = df["description"].isin(CSW_DESCRIPTIONS).fillna(False)

    df["is_hard_hit"] = (df["launch_speed"].fillna(0) >= 95)

    mask_speed = df["launch_speed"] >= 98
    mask_angle = (
        df["launch_angle"] >= df["launch_speed"].map(_barrel_angle_min)
    ) & (
        df["launch_angle"] <= df["launch_speed"].map(_barrel_angle_max)
    )
    df["is_barrel"] = (mask_speed & mask_angle).fillna(False)

    df = df.sort_values(["at_bat_number", "pitch_number"])
    grp = df.groupby("at_bat_number")
    df["sequence_prev_pitch_type"] = grp["pitch_type"].shift(1)
    df["sequence_prev_location_x"] = grp["plate_x"].shift(1)
    df["sequence_prev_location_z"] = grp["plate_z"].shift(1)

    df = _add_times_through_order(df)

    return df


def _add_times_through_order(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        df["times_through_order"] = pd.Series(dtype="Int16")
        return df

    df_sorted = df.sort_values(["game_pk", "inning_topbot", "at_bat_number"])
    first_app = df_sorted.drop_duplicates(
        subset=["game_pk", "inning_topbot", "batter"]
    ).copy()
    first_app["_slot"] = (
        first_app.groupby(["game_pk", "inning_topbot"]).cumcount() + 1
    )

    df = df.merge(
        first_app[["game_pk", "inning_topbot", "batter", "_slot"]],
        on=["game_pk", "inning_topbot", "batter"],
        how="left",
    )
    df["times_through_order"] = (
        ((df["_slot"].fillna(1) - 1) // 9 + 1).astype("Int16")
    )
    df.drop(columns=["_slot"], inplace=True)
    return df
