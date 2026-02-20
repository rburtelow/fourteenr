import type { HourlyRiskData, SummitWindowData } from "../types.ts";
import { SUMMIT_WINDOW_START, SUMMIT_WINDOW_END, RISK_THRESHOLD_HIGH } from "../config.ts";

export function analyzeSummitWindow(
  hourlyRisks: HourlyRiskData[],
  timezoneOffset: number
): SummitWindowData {
  const windowHours = hourlyRisks.filter((h) => {
    const localHour = new Date((h.dt + timezoneOffset) * 1000).getUTCHours();
    return localHour >= SUMMIT_WINDOW_START && localHour < SUMMIT_WINDOW_END;
  });

  if (windowHours.length === 0) {
    return {
      best_hour: null,
      best_score: null,
      morning_average: null,
      storm_eta: null,
      unsafe_after: null,
    };
  }

  const bestHour = windowHours.reduce((best, h) =>
    h.risk_score > best.risk_score ? h : best
  );

  const morningAverage = Math.round(
    windowHours.reduce((sum, h) => sum + h.risk_score, 0) / windowHours.length
  );

  const stormHour = hourlyRisks.find(
    (h) => h.dt > hourlyRisks[0].dt && h.risk_score < RISK_THRESHOLD_HIGH
  );

  const unsafeHour = hourlyRisks.find(
    (h) => h.dt >= windowHours[0].dt && h.risk_score < RISK_THRESHOLD_HIGH
  );

  return {
    best_hour: bestHour.dt,
    best_score: bestHour.risk_score,
    morning_average: morningAverage,
    storm_eta: stormHour?.dt ?? null,
    unsafe_after: unsafeHour?.dt ?? null,
  };
}
