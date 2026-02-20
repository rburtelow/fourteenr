import type { AdjustedHourData, HourlyRiskData } from "../types.ts";
import {
  WIND_RISK_THRESHOLD_MPH,
  GUST_RISK_THRESHOLD_MPH,
  EXTREME_COLD_THRESHOLD_F,
  WIND_CHILL_PENALTY_THRESHOLD_F,
  PENALTY_THUNDERSTORM,
  PENALTY_HIGH_WIND,
  PENALTY_EXTREME_GUST,
  PENALTY_HEAVY_PRECIP,
  PENALTY_WIND_CHILL,
  PENALTY_SNOW,
  RISK_THRESHOLD_LOW,
  RISK_THRESHOLD_MODERATE,
  RISK_THRESHOLD_HIGH,
} from "../config.ts";

function getRiskLevel(score: number): string {
  if (score >= RISK_THRESHOLD_LOW) return "LOW";
  if (score >= RISK_THRESHOLD_MODERATE) return "MODERATE";
  if (score >= RISK_THRESHOLD_HIGH) return "HIGH";
  return "EXTREME";
}

function calculateHourRisk(hour: AdjustedHourData): number {
  let score = 100;

  if (hour.weather_id >= 200 && hour.weather_id < 300) {
    score -= PENALTY_THUNDERSTORM;
  }

  if (hour.wind_speed >= WIND_RISK_THRESHOLD_MPH) {
    score -= PENALTY_HIGH_WIND;
  }

  if (hour.wind_gust >= GUST_RISK_THRESHOLD_MPH) {
    score -= PENALTY_EXTREME_GUST;
  }

  if (hour.pop >= 0.6) {
    score -= PENALTY_HEAVY_PRECIP;
  }

  if (hour.wind_chill <= WIND_CHILL_PENALTY_THRESHOLD_F) {
    score -= PENALTY_WIND_CHILL;
  }

  if (hour.temp <= EXTREME_COLD_THRESHOLD_F) {
    score -= 10;
  }

  if (hour.precip_type === "snow_or_mixed") {
    score -= PENALTY_SNOW;
  }

  return Math.max(0, Math.min(100, score));
}

export function calculateHourlyRisk(adjustedHours: AdjustedHourData[]): HourlyRiskData[] {
  return adjustedHours.map((hour) => {
    const riskScore = calculateHourRisk(hour);
    return {
      dt: hour.dt,
      risk_score: riskScore,
      risk_level: getRiskLevel(riskScore),
    };
  });
}

export function calculateOverallRisk(hourlyRisks: HourlyRiskData[]): {
  score: number;
  level: string;
} {
  if (hourlyRisks.length === 0) {
    return { score: 100, level: "LOW" };
  }

  const next24 = hourlyRisks.slice(0, 24);
  const avgScore = Math.round(
    next24.reduce((sum, h) => sum + h.risk_score, 0) / next24.length
  );

  return {
    score: avgScore,
    level: getRiskLevel(avgScore),
  };
}
