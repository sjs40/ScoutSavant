import pandas as pd

WHIFF_DESCRIPTIONS = {"swinging_strike", "swinging_strike_blocked"}
CSW_DESCRIPTIONS = {"called_strike", "swinging_strike", "swinging_strike_blocked"}


def _barrel_angle_min(speed: float) -> float:
    return max(8.0, 26.0 - 2.0 * (speed - 98.0))


def _barrel_angle_max(speed: float) -> float:
    return min(50.0, 30.0 + 2.0 * (speed - 98.0))


def derive_fields(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    df["pitch_id"] = (
        df["game_pk"].astype(str) + "_"
        + df["at_bat_number"].astype(str) + "_"
        + df["pitch_number"].astype(str)
    )

    df["count"] = df["balls"].astype(str) + "-" + df["strikes"].astype(str)

    df["is_whiff"] = df["description"].isin(WHIFF_DESCRIPTIONS).fillna(False)

    out_of_zone = (
        (df["plate_x"] < -0.85) | (df["plate_x"] > 0.85) |
        (df["plate_z"] < 1.5) | (df["plate_z"] > 3.5)
    )
    swing = df["description"].str.contains("swing", na=False, case=False)
    df["is_chase"] = (out_of_zone & swing).fillna(False)

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

    df["times_through_order"] = ((df["at_bat_number"] - 1) // 9 + 1).clip(upper=3).astype(int)

    df["pa_complete"] = df["events"].notna()

    df["spin_rate"] = df.get("release_spin_rate", pd.Series(dtype=float))

    return df
