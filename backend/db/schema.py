import duckdb


def init_schema(conn: duckdb.DuckDBPyConnection) -> None:
    conn.execute("""
        CREATE TABLE IF NOT EXISTS pitches_season (
            pitch_id        VARCHAR PRIMARY KEY,
            pitcher_id      INTEGER,
            season          INTEGER,
            game_pk         INTEGER,
            game_date       DATE,
            at_bat_number   INTEGER,
            pitch_number    INTEGER,
            pitch_type      VARCHAR,
            release_speed   FLOAT,
            pfx_x           FLOAT,
            pfx_z           FLOAT,
            spin_rate       FLOAT,
            plate_x         FLOAT,
            plate_z         FLOAT,
            balls           INTEGER,
            strikes         INTEGER,
            count           VARCHAR,
            stand           VARCHAR,
            inning          INTEGER,
            description     VARCHAR,
            events          VARCHAR,
            estimated_ba_using_speedangle    FLOAT,
            estimated_woba_using_speedangle  FLOAT,
            launch_speed    FLOAT,
            launch_angle    FLOAT,
            delta_run_exp   FLOAT,
            is_whiff        BOOLEAN,
            is_chase        BOOLEAN,
            is_csw          BOOLEAN,
            is_hard_hit     BOOLEAN,
            is_barrel       BOOLEAN,
            sequence_prev_pitch_type    VARCHAR,
            sequence_prev_location_x    FLOAT,
            sequence_prev_location_z    FLOAT,
            times_through_order         INTEGER,
            pa_complete     BOOLEAN
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS pitches_game (
            pitch_id        VARCHAR PRIMARY KEY,
            pitcher_id      INTEGER,
            season          INTEGER,
            game_pk         INTEGER,
            game_date       DATE,
            at_bat_number   INTEGER,
            pitch_number    INTEGER,
            pitch_type      VARCHAR,
            release_speed   FLOAT,
            pfx_x           FLOAT,
            pfx_z           FLOAT,
            spin_rate       FLOAT,
            plate_x         FLOAT,
            plate_z         FLOAT,
            balls           INTEGER,
            strikes         INTEGER,
            count           VARCHAR,
            stand           VARCHAR,
            inning          INTEGER,
            description     VARCHAR,
            events          VARCHAR,
            estimated_ba_using_speedangle    FLOAT,
            estimated_woba_using_speedangle  FLOAT,
            launch_speed    FLOAT,
            launch_angle    FLOAT,
            delta_run_exp   FLOAT,
            is_whiff        BOOLEAN,
            is_chase        BOOLEAN,
            is_csw          BOOLEAN,
            is_hard_hit     BOOLEAN,
            is_barrel       BOOLEAN,
            sequence_prev_pitch_type    VARCHAR,
            sequence_prev_location_x    FLOAT,
            sequence_prev_location_z    FLOAT,
            times_through_order         INTEGER,
            pa_complete     BOOLEAN
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS metadata (
            record_id   VARCHAR PRIMARY KEY,
            pitcher_id  INTEGER,
            season      INTEGER,
            game_pk     INTEGER,
            mode        VARCHAR,
            last_pulled TIMESTAMP,
            pitch_count INTEGER
        )
    """)

    conn.execute("CREATE INDEX IF NOT EXISTS idx_ps_pitcher_season ON pitches_season (pitcher_id, season)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_ps_game ON pitches_season (pitcher_id, game_pk)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_pg_pitcher_game ON pitches_game (pitcher_id, game_pk)")
