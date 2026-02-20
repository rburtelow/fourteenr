import type { ProcessingResult, OpenWeatherResponse } from "../types.ts";
import { OPENWEATHER_CURRENT_URL, OPENWEATHER_FORECAST_URL, DEFAULT_FORECAST_ELEVATION_FT } from "../config.ts";
import { adjustForecast } from "./elevationAdjust.ts";
import { calculateHourlyRisk, calculateOverallRisk } from "./riskEngine.ts";
import { analyzeSummitWindow } from "./summitWindow.ts";
import { deriveFlags } from "./derivedFlags.ts";

interface PeakInput {
  id: string;
  latitude: number | null;
  longitude: number | null;
  elevation: number;
  forecast_elevation_ft: number | null;
}

async function fetchForecast(
  lat: number,
  lon: number,
  apiKey: string
): Promise<OpenWeatherResponse> {
  const params = `lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
  const [currentRes, forecastRes] = await Promise.all([
    fetch(`${OPENWEATHER_CURRENT_URL}?${params}`),
    fetch(`${OPENWEATHER_FORECAST_URL}?${params}`),
  ]);

  if (!currentRes.ok) {
    const text = await currentRes.text();
    throw new Error(`OpenWeather current API error ${currentRes.status}: ${text}`);
  }
  if (!forecastRes.ok) {
    const text = await forecastRes.text();
    throw new Error(`OpenWeather forecast API error ${forecastRes.status}: ${text}`);
  }

  // deno-lint-ignore no-explicit-any
  const cur: any = await currentRes.json();
  // deno-lint-ignore no-explicit-any
  const fcast: any = await forecastRes.json();

  // Normalize 2.5 responses to match the OpenWeatherResponse interface
  return {
    lat: cur.coord.lat,
    lon: cur.coord.lon,
    timezone: cur.name,
    timezone_offset: fcast.city.timezone,
    current: {
      dt: cur.dt,
      temp: cur.main.temp,
      feels_like: cur.main.feels_like,
      humidity: cur.main.humidity,
      clouds: cur.clouds.all,
      visibility: cur.visibility ?? 10000,
      wind_speed: cur.wind.speed,
      wind_deg: cur.wind.deg,
      wind_gust: cur.wind.gust,
      uvi: 0,
      weather: cur.weather,
    },
    // /data/2.5/forecast gives 3-hour intervals (40 entries = 5 days)
    hourly: fcast.list.map((entry: any) => ({
      dt: entry.dt,
      temp: entry.main.temp,
      feels_like: entry.main.feels_like,
      humidity: entry.main.humidity,
      clouds: entry.clouds.all,
      visibility: entry.visibility ?? 10000,
      wind_speed: entry.wind.speed,
      wind_deg: entry.wind.deg,
      wind_gust: entry.wind.gust,
      pop: entry.pop ?? 0,
      uvi: 0,
      weather: entry.weather,
    })),
    daily: [],
  };
}

export async function processPeak(
  peak: PeakInput,
  apiKey: string
): Promise<ProcessingResult> {
  if (!peak.latitude || !peak.longitude) {
    throw new Error(`Peak ${peak.id} is missing coordinates`);
  }

  // 1. Fetch raw forecast
  const rawForecast = await fetchForecast(peak.latitude, peak.longitude, apiKey);

  // 2. Elevation-adjust all hourly data
  const forecastElevation = peak.forecast_elevation_ft ?? DEFAULT_FORECAST_ELEVATION_FT;
  const adjustedForecast = adjustForecast(
    rawForecast.hourly,
    peak.elevation,
    forecastElevation
  );

  // 3. Calculate hourly risk scores
  const hourlyRisk = calculateHourlyRisk(adjustedForecast);

  // 4. Calculate overall risk
  const { score: riskScore, level: riskLevel } = calculateOverallRisk(hourlyRisk);

  // 5. Analyze summit window
  const summitWindow = analyzeSummitWindow(hourlyRisk, rawForecast.timezone_offset);

  // 6. Derive condition flags
  const conditionFlags = deriveFlags(adjustedForecast);

  return {
    peakId: peak.id,
    rawForecast,
    adjustedForecast,
    hourlyRisk,
    summitWindow,
    riskScore,
    riskLevel,
    conditionFlags,
    stormEta: summitWindow.storm_eta,
  };
}
