import type { OpenWeatherHourly, AdjustedHourData } from "../types.ts";
import {
  LAPSE_RATE_F_PER_1000FT,
  WIND_MULTIPLIER_DIVISOR,
  GUST_AMPLIFICATION,
  PRECIP_BOOST,
  SNOW_THRESHOLD_F,
} from "../config.ts";

function calculateWindChill(tempF: number, windMph: number): number {
  if (tempF <= 50 && windMph >= 3) {
    return (
      35.74 +
      0.6215 * tempF -
      35.75 * Math.pow(windMph, 0.16) +
      0.4275 * tempF * Math.pow(windMph, 0.16)
    );
  }
  return tempF;
}

export function adjustHour(
  hour: OpenWeatherHourly,
  peakElevationFt: number,
  forecastElevationFt: number
): AdjustedHourData {
  const elevationDiffFt = peakElevationFt - forecastElevationFt;

  const adjustedTemp = hour.temp - (elevationDiffFt / 1000) * LAPSE_RATE_F_PER_1000FT;
  const adjustedFeelsLike =
    hour.feels_like - (elevationDiffFt / 1000) * LAPSE_RATE_F_PER_1000FT;

  const windMultiplier = 1 + elevationDiffFt / WIND_MULTIPLIER_DIVISOR;
  const adjustedWindSpeed = hour.wind_speed * windMultiplier;

  const adjustedWindGust = (hour.wind_gust ?? hour.wind_speed) * GUST_AMPLIFICATION;

  const adjustedPop = Math.min(hour.pop * PRECIP_BOOST, 1);

  let precipType: string | null = null;
  if (adjustedTemp <= SNOW_THRESHOLD_F && adjustedPop > 0) {
    precipType = "snow_or_mixed";
  } else if (adjustedPop > 0) {
    precipType = "rain";
  }

  const windChill = calculateWindChill(adjustedTemp, adjustedWindSpeed);

  const weather = hour.weather[0] || { id: 800, main: "Clear", description: "clear sky" };

  return {
    dt: hour.dt,
    temp: Math.round(adjustedTemp * 10) / 10,
    feels_like: Math.round(adjustedFeelsLike * 10) / 10,
    wind_speed: Math.round(adjustedWindSpeed * 10) / 10,
    wind_gust: Math.round(adjustedWindGust * 10) / 10,
    wind_deg: hour.wind_deg,
    humidity: hour.humidity,
    pop: Math.round(adjustedPop * 100) / 100,
    precip_type: precipType,
    weather_id: weather.id,
    weather_main: weather.main,
    weather_description: weather.description,
    wind_chill: Math.round(windChill * 10) / 10,
    clouds: hour.clouds,
    visibility: hour.visibility,
    uvi: hour.uvi,
  };
}

export function adjustForecast(
  rawHourly: OpenWeatherHourly[],
  peakElevationFt: number,
  forecastElevationFt: number
): AdjustedHourData[] {
  return rawHourly.map((hour) => adjustHour(hour, peakElevationFt, forecastElevationFt));
}
