from .connection import get_conn, get_lock

_PITCH_COLUMNS = """
    pitcher_id          INTEGER   NOT NULL,
    season              SMALLINT  NOT NULL,
    game_pk             INTEGER   NOT NULL,
    game_date           DATE      NOT NULL,
    game_type           VARCHAR,
    home_team           VARCHAR,
    away_team           VARCHAR,
    inning              SMALLINT,
    inning_topbot       VARCHAR,
    at_bat_number       SMALLINT,
    pitch_number        SMALLINT,
    batter              INTEGER,
    stand               VARCHAR,
    p_throws            VARCHAR,
    pitch_type          VARCHAR,
    pitch_name          VARCHAR,
    release_speed       DOUBLE,
    release_spin_rate   DOUBLE,
    release_extension   DOUBLE,
    release_pos_x       DOUBLE,
    release_pos_y       DOUBLE,
    release_pos_z       DOUBLE,
    pfx_x               DOUBLE,
    pfx_z               DOUBLE,
    plate_x             DOUBLE,
    plate_z             DOUBLE,
    vx0                 DOUBLE,
    vy0                 DOUBLE,
    vz0                 DOUBLE,
    ax                  DOUBLE,
    ay                  DOUBLE,
    az                  DOUBLE,
    sz_top              DOUBLE,
    sz_bot              DOUBLE,
    effective_speed     DOUBLE,
    spin_axis           DOUBLE,
    zone                SMALLINT,
    type                VARCHAR,
    description         VARCHAR,
    events              VARCHAR,
    bb_type             VARCHAR,
    launch_speed        DOUBLE,
    launch_angle        DOUBLE,
    hit_distance_sc     DOUBLE,
    hc_x                DOUBLE,
    hc_y                DOUBLE,
    estimated_ba_using_speedangle    DOUBLE,
    estimated_woba_using_speedangle  DOUBLE,
    delta_run_exp       DOUBLE,
    delta_home_win_exp  DOUBLE,
    post_home_score     SMALLINT,
    post_away_score     SMALLINT,
    balls               SMALLINT,
    strikes             SMALLINT,
    outs_when_up        SMALLINT,
    on_1b               INTEGER,
    on_2b               INTEGER,
    on_3b               INTEGER,
    count                        VARCHAR  NOT NULL,
    is_whiff                     BOOLEAN  NOT NULL DEFAULT FALSE,
    is_chase                     BOOLEAN  NOT NULL DEFAULT FALSE,
    is_csw                       BOOLEAN  NOT NULL DEFAULT FALSE,
    is_hard_hit                  BOOLEAN  NOT NULL DEFAULT FALSE,
    is_barrel                    BOOLEAN  NOT NULL DEFAULT FALSE,
    sequence_prev_pitch_type     VARCHAR,
    sequence_prev_location_x     DOUBLE,
    sequence_prev_location_z     DOUBLE,
    times_through_order          SMALLINT
"""

_MIGRATIONS = [
    f"""
    CREATE TABLE IF NOT EXISTS pitches_season (
        {_PITCH_COLUMNS},
        PRIMARY KEY (pitcher_id, season, game_pk, at_bat_number, pitch_number)
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_ps_pitcher_season ON pitches_season (pitcher_id, season)",
    "CREATE INDEX IF NOT EXISTS idx_ps_pitch_type ON pitches_season (pitch_type)",
    "CREATE INDEX IF NOT EXISTS idx_ps_game ON pitches_season (pitcher_id, game_pk)",

    f"""
    CREATE TABLE IF NOT EXISTS pitches_game (
        {_PITCH_COLUMNS},
        is_incomplete_pa BOOLEAN NOT NULL DEFAULT FALSE,
        PRIMARY KEY (pitcher_id, game_pk, at_bat_number, pitch_number)
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_pg_pitcher_game ON pitches_game (pitcher_id, game_pk)",
    "CREATE INDEX IF NOT EXISTS idx_pg_pitch_type ON pitches_game (pitch_type)",

    """
    CREATE TABLE IF NOT EXISTS ingest_metadata (
        pitcher_id      INTEGER   NOT NULL,
        game_pk         INTEGER   NOT NULL,
        mode            VARCHAR   NOT NULL,
        season          SMALLINT,
        last_pulled_at  TIMESTAMP NOT NULL,
        row_count       INTEGER,
        has_incomplete  BOOLEAN   NOT NULL DEFAULT FALSE,
        PRIMARY KEY (pitcher_id, game_pk, mode)
    )
    """,

    """
    CREATE TABLE IF NOT EXISTS season_cache (
        pitcher_id  INTEGER  NOT NULL,
        season      SMALLINT NOT NULL,
        pulled_at   TIMESTAMP NOT NULL,
        row_count   INTEGER,
        PRIMARY KEY (pitcher_id, season)
    )
    """,
]


def run_migrations() -> None:
    conn = get_conn()
    with get_lock():
        for sql in _MIGRATIONS:
            conn.execute(sql)
