CREATE TABLE peak_coverage (
  id                SERIAL PRIMARY KEY,
  peak_id           UUID NOT NULL REFERENCES peaks(id) ON DELETE CASCADE,
  carrier           TEXT NOT NULL,        -- 'ATT' | 'TMO' | 'VZW'
  signal_dbm        NUMERIC,              -- averageSignalStrength of nearest tower (dBm)
  coverage_tier     TEXT NOT NULL,        -- 'None' | 'Poor' | 'Fair' | 'Good' | 'Great'
  nearest_tower_km  NUMERIC,              -- distance to the closest tower in km
  tower_count       INTEGER,              -- number of towers found within search radius
  tower_samples     INTEGER,              -- crowd-sourced readings backing the signal value
  fetched_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (peak_id, carrier)
);

CREATE INDEX ON peak_coverage (peak_id);

-- Tracks when coverage data was last refreshed
CREATE TABLE coverage_metadata (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL
);
