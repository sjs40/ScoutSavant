from fastapi import APIRouter, Query
import statsapi

router = APIRouter(tags=["games"])


@router.get("/games")
def list_games(date: str = Query(...), team: str = Query(...)):
    schedule = statsapi.schedule(date=date, team=statsapi.lookup_team(team)[0]["id"])
    return [
        {
            "game_pk": g["game_id"],
            "home_team": g["home_name"],
            "away_team": g["away_name"],
            "status": g["status"],
            "game_date": g["game_date"],
        }
        for g in schedule
    ]
