from fastapi import APIRouter, Query
import statsapi

router = APIRouter(tags=["games"])


@router.get("/games")
def list_games(date: str = Query(...), team: str = Query(default="")):
    try:
        if team:
            team_results = statsapi.lookup_team(team)
            team_id = team_results[0]["id"] if team_results else None
        else:
            team_id = None
        kwargs: dict = {"date": date}
        if team_id:
            kwargs["team"] = team_id
        schedule = statsapi.schedule(**kwargs)
    except Exception:
        return []
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
