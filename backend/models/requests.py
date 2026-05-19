from pydantic import BaseModel


class IngestSeasonRequest(BaseModel):
    pitcher_id: int
    season: int


class IngestGameRequest(BaseModel):
    pitcher_id: int
    game_pk: int
    season: int
