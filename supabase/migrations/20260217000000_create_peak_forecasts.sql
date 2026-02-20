-- Add forecast_elevation_ft to peaks table (base elevation the API forecasts for)
ALTER TABLE peaks ADD COLUMN IF NOT EXISTS forecast_elevation_ft int DEFAULT 9000;

-- Create peak_forecasts table (one forecast row per peak)
CREATE TABLE IF NOT EXISTS peak_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  peak_id uuid NOT NULL REFERENCES peaks(id) ON DELETE CASCADE,
  raw_forecast jsonb,
  adjusted_forecast jsonb,
  hourly_risk jsonb,
  summit_window jsonb,
  risk_score int,
  risk_level text,
  condition_flags jsonb,
  storm_eta timestamptz,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT peak_forecasts_peak_id_key UNIQUE (peak_id)
);

-- RLS: public read, service-role write
ALTER TABLE peak_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read forecasts"
  ON peak_forecasts FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert forecasts"
  ON peak_forecasts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update forecasts"
  ON peak_forecasts FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Index for fast lookups by peak_id
CREATE INDEX IF NOT EXISTS idx_peak_forecasts_peak_id ON peak_forecasts(peak_id);
