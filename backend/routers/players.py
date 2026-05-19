import pandas as pd
from fastapi import APIRouter, HTTPException, Query
import pybaseball

router = APIRouter(tags=["players"])


@router.get("/players/search")
def search_players(name: str = Query(...)):
    parts = name.strip().split()
    if not parts:
        return []

    # Last word = last name, rest = first name (handles "Gerrit Cole" → last=Cole, first=Gerrit)
    last = parts[-1]
    first = " ".join(parts[:-1]) if len(parts) > 1 else ""

    try:
        df = pybaseball.playerid_lookup(last, first, fuzzy=True)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if df is None or df.empty:
        return []

    results = []
    for _, row in df.iterrows():
        mlbam = row.get("key_mlbam")
        if pd.isna(mlbam):
            continue
        name_str = f"{row.get('name_first', '')} {row.get('name_last', '')}".strip()
        results.append({
            "pitcher_id": int(mlbam),
            "name": name_str,
            "throws": row.get("throws") if not pd.isna(row.get("throws", float("nan"))) else None,
        })

    return results[:15]
