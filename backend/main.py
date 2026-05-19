from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.connection import get_conn, get_lock
from db.schema import init_schema
from routers import ingest, games, players, data


@asynccontextmanager
async def lifespan(app: FastAPI):
    with get_lock():
        init_schema(get_conn())
    yield


app = FastAPI(title="ScoutSavant", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router, prefix="/api")
app.include_router(games.router, prefix="/api")
app.include_router(players.router, prefix="/api")
app.include_router(data.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
