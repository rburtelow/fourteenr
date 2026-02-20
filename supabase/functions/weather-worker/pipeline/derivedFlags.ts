import type { AdjustedHourData, ConditionFlagsData } from "../types.ts";
import {
  WIND_RISK_THRESHOLD_MPH,
  EXTREME_COLD_THRESHOLD_F,
  WHITEOUT_CLOUD_THRESHOLD,
  WHITEOUT_PRECIP_THRESHOLD,
} from "../config.ts";

export function deriveFlags(adjustedHours: AdjustedHourData[]): ConditionFlagsData {
  const next24 = adjustedHours.slice(0, 24);

  const windRisk = next24.some((h) => h.wind_speed > WIND_RISK_THRESHOLD_MPH);

  const thunderstormRisk = next24.some(
    (h) => h.weather_id >= 200 && h.weather_id < 300
  );

  const snowRisk = next24.some((h) => h.precip_type === "snow_or_mixed");

  const whiteoutRisk = next24.some(
    (h) =>
      h.clouds >= WHITEOUT_CLOUD_THRESHOLD &&
      h.pop >= WHITEOUT_PRECIP_THRESHOLD &&
      h.precip_type === "snow_or_mixed"
  );

  const extremeColdRisk = next24.some(
    (h) => h.wind_chill <= EXTREME_COLD_THRESHOLD_F
  );

  return {
    windRisk,
    thunderstormRisk,
    snowRisk,
    whiteoutRisk,
    extremeColdRisk,
  };
}
