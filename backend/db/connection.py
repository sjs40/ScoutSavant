import os
import threading

import duckdb
from dotenv import load_dotenv

load_dotenv()

_lock = threading.Lock()
_conn: duckdb.DuckDBPyConnection | None = None

_DEFAULT_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "scout.duckdb")
DB_PATH = os.getenv("DUCKDB_PATH", _DEFAULT_DB_PATH)


def get_conn() -> duckdb.DuckDBPyConnection:
    global _conn
    if _conn is None:
        os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)
        _conn = duckdb.connect(DB_PATH)
    return _conn


def get_lock() -> threading.Lock:
    return _lock
