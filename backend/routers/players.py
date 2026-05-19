from fastapi import APIRouter, Query
import statsapi

router = APIRouter(tags=["players"])


@router.get("/players/search")
def search_players(name: str = Query(...)):
    results = statsapi.lookup_player(name)
    return [
        {
            "player_id": p["id"],
            "name": p["fullName"],
            "position": p.get("primaryPosition", {}).get("abbreviation"),
            "team": p.get("currentTeam", {}).get("name"),
        }
        for p in results
        if p.get("primaryPosition", {}).get("abbreviation") == "P"
    ]
