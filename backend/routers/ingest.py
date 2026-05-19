from fastapi import APIRouter, HTTPException
from models.requests import IngestSeasonRequest, IngestGameRequest
from ingest.season_ingest import ingest_season
from ingest.game_ingest import ingest_game

router = APIRouter(tags=["ingest"])


@router.post("/ingest/season")
def ingest_season_endpoint(req: IngestSeasonRequest):
    try:
        return ingest_season(req.pitcher_id, req.season)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/ingest/game")
def ingest_game_endpoint(req: IngestGameRequest):
    try:
        return ingest_game(req.pitcher_id, req.game_pk, req.season)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/ingest/game/refresh")
def refresh_game_endpoint(req: IngestGameRequest):
    try:
        return ingest_game(req.pitcher_id, req.game_pk, req.season, refresh=True)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
