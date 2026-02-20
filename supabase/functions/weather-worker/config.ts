// Elevation adjustment constants
export const LAPSE_RATE_F_PER_1000FT = 3.5;
export const WIND_MULTIPLIER_DIVISOR = 10000;
export const GUST_AMPLIFICATION = 1.3;
export const PRECIP_BOOST = 1.15;
export const SNOW_THRESHOLD_F = 34;

// Risk thresholds (score-based: 100 = safest, 0 = most dangerous)
export const RISK_THRESHOLD_LOW = 80;
export const RISK_THRESHOLD_MODERATE = 60;
export const RISK_THRESHOLD_HIGH = 40;

// Summit window hours (local time)
export const SUMMIT_WINDOW_START = 6; // 6 AM
export const SUMMIT_WINDOW_END = 11; // 11 AM

// Hazard penalty thresholds
export const WIND_RISK_THRESHOLD_MPH = 35;
export const GUST_RISK_THRESHOLD_MPH = 50;
export const EXTREME_COLD_THRESHOLD_F = 0;
export const WIND_CHILL_PENALTY_THRESHOLD_F = 10;
export const WHITEOUT_CLOUD_THRESHOLD = 90;
export const WHITEOUT_PRECIP_THRESHOLD = 0.5;

// Hazard penalty values (subtracted from 100)
export const PENALTY_THUNDERSTORM = 40;
export const PENALTY_HIGH_WIND = 25;
export const PENALTY_EXTREME_GUST = 15;
export const PENALTY_HEAVY_PRECIP = 15;
export const PENALTY_WIND_CHILL = 15;
export const PENALTY_SNOW = 10;

// OpenWeather API (free tier: current weather + 5-day/3-hour forecast)
export const OPENWEATHER_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather";
export const OPENWEATHER_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

// Default forecast elevation (typical Colorado valley)
export const DEFAULT_FORECAST_ELEVATION_FT = 9000;
