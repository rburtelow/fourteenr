```markdown
# My14er Weather Processing System
## Unified Technical Specification

## Purpose
This document defines the full weather processing architecture for My14er,
including:

- Supabase Edge Function worker structure
- Weather processing pipeline
- Elevation-adjusted summit condition modeling
- Risk scoring and summit window analysis
- Data storage and frontend consumption

The system converts:

Raw Weather API Forecasts
→ Elevation-Adjusted Summit Conditions
→ Risk Analysis
→ Supabase Storage
→ Fast Next.js UI Reads



# System Overview

## High-Level Flow

Cron Trigger
→ Edge Function Worker
→ Load Peaks
→ Fetch Weather API
→ Elevation Adjustment
→ Risk Engine
→ Summit Window Analysis
→ Derived Flags
→ Supabase Upsert
→ Frontend Reads Processed Data



# Directory Structure

```

supabase/functions/weather-worker/
├── index.ts
├── config.ts
├── types.ts
├── clients/
│   ├── supabaseClient.ts
│   └── weatherClient.ts
├── pipeline/
│   ├── processPeak.ts
│   ├── elevationAdjust.ts
│   ├── riskEngine.ts
│   ├── summitWindow.ts
│   └── derivedFlags.ts
└── utils/
├── retry.ts
├── logger.ts
└── time.ts

```



# Database Tables

## peaks
```

id
name
lat
lon
peak_elevation_ft
forecast_elevation_ft

```

## peak_forecasts
```

peak_id
raw_forecast jsonb
adjusted_forecast jsonb
hourly_risk jsonb
summit_window jsonb
risk_score int
risk_level text
storm_eta timestamptz
updated_at timestamptz

```

## weather_worker_logs (optional)
```

peak_id
stage
duration_ms
status
error_message
timestamp

```



# Edge Function Worker

## Entry Point Responsibilities (index.ts)
- Load config
- Initialize clients
- Fetch peaks
- Parallel processing
- Collect results
- Return execution summary

## Execution Model
```

await Promise.all(peaks.map(processPeak))

```



# Pipeline Stages

## Stage 1 — Peak Retrieval
Load all active peaks from Supabase.

## Stage 2 — Raw Weather Fetch
Use OpenWeather OneCall API:
```

/data/3.0/onecall?lat={lat}&lon={lon}&units=imperial

```

Response fields:
```

current
hourly[]
daily[]

```

---

# Elevation-Adjusted Weather Engine

## Core Calculation
```

elevationDiffFt = peakElevationFt - forecastElevationFt

```

## Temperature Adjustment
Standard lapse rate:
```

adjustedTempF =
baseTempF - ((elevationDiffFt / 1000) * 3.5)

```

## Wind Adjustment
```

windMultiplier =
1 + (elevationDiffFt / 10000)

adjustedWindSpeed =
baseWindSpeed * windMultiplier

```

## Gust Amplification
```

adjustedWindGust =
baseWindGust * 1.3

```

## Precipitation Adjustment
```

adjustedPrecipProbability =
min(basePrecipProbability * 1.15, 1)

```

## Snow Detection
```

if adjustedTempF <= 34
AND adjustedPrecipProbability > 0
→ precipType = "snow_or_mixed"

```

## Wind Chill
```

if tempF <= 50 AND windMph >= 3:
windChillF =
35.74 +
(0.6215 * tempF) -
(35.75 * windMph^0.16) +
(0.4275 * tempF * windMph^0.16)
else:
windChillF = tempF

```



# Risk Engine

## Hourly Hazard Penalties
- Thunderstorms
- Wind speed
- Gusts
- Precipitation
- Wind chill
- Snow
- Cloud ceiling vs summit

## Output Per Hour
```

{
timestamp,
riskScore,
riskLevel
}

```

## Overall Risk Classification
```

score >= 80 → LOW
score >= 60 → MODERATE
score >= 40 → HIGH
else → EXTREME

```

---

# Summit Window Analysis

Target Window:
```

06:00 – 11:00 local time

```

Processing:
- Score each hour
- Average morning score
- Detect storm arrival
- Identify best summit hour

Output:
```

{
bestHour,
bestScore,
morningAverage,
stormEta,
unsafeAfter
}

```

---

# Derived Condition Flags

Generate UI-friendly booleans:
```

windRisk
thunderstormRisk
snowRisk
whiteoutRisk
extremeColdRisk

```

Example:
```

if adjustedWindSpeed > 35 → windRisk = true

```



# Processing Pipeline — processPeak()

Steps:
1. fetchForecast(lat, lon)
2. adjustForecast(rawForecast)
3. calculateHourlyRisk()
4. calculateSummitWindow()
5. deriveFlags()
6. upsertForecast()

Output:
```

ProcessingResult

```



# Clients

## Supabase Client
Functions:
```

getPeaks()
upsertForecast()
logWeatherUpdate()

```

## Weather Client
Functions:
```

fetchForecast(lat, lon)

```

Features:
- Timeout protection
- Retry logic
- Standardized response



# Utilities

## retry.ts
```

retry(fn, attempts, delayMs)

```

## logger.ts
Fields:
```

peakId
stage
durationMs
status
errorMessage

```



# Parallel Processing

Recommended:
```

await Promise.all(peaks.map(processPeak))

```

Optional:
- Concurrency limiter



# Error Handling

Per Peak Isolation:
- Catch errors individually
- Continue processing

Fetch Failure:
- Retry attempts
- Fallback to last stored forecast

DB Failure:
- Log error
- Continue worker



# Scheduling

Recommended:
```

pg_cron hourly trigger

```



# Performance Targets

- < 60 API calls/run
- < 15s execution time
- Fully parallel peak processing
- No frontend weather API usage



# Security

- API keys stored in Supabase secrets
- Service role key only in Edge Function
- Validate external responses
- Never expose secrets to frontend



# Frontend Consumption

Next.js reads only:
```

peak_forecasts

```

Frontend must:
- Never call weather APIs directly
- Use processed data only



# Future Enhancements

- Elevation band forecasts
- Colorado monsoon storm predictor
- Lightning nowcast integration
- Avalanche data ingestion (CAIC)
- Route-specific hazard modeling
- AI-generated summit recommendation text



# System Diagram

```

Cron Trigger
→ Edge Function Worker
→ Load Peaks
→ Fetch Weather
→ Elevation Adjustment
→ Risk Engine
→ Summit Window Analysis
→ Supabase Storage
→ Next.js Frontend
```