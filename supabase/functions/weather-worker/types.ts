// OpenWeather One Call API 3.0 response types

export interface OpenWeatherResponse {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: OpenWeatherCurrent;
  hourly: OpenWeatherHourly[];
  daily: OpenWeatherDaily[];
}

export interface OpenWeatherCurrent {
  dt: number;
  temp: number;
  feels_like: number;
  humidity: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  uvi: number;
  weather: OpenWeatherCondition[];
}

export interface OpenWeatherHourly {
  dt: number;
  temp: number;
  feels_like: number;
  humidity: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  pop: number;
  uvi: number;
  weather: OpenWeatherCondition[];
}

export interface OpenWeatherDaily {
  dt: number;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  humidity: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  pop: number;
  clouds: number;
  uvi: number;
  weather: OpenWeatherCondition[];
  summary?: string;
}

export interface OpenWeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface AdjustedHourData {
  dt: number;
  temp: number;
  feels_like: number;
  wind_speed: number;
  wind_gust: number;
  wind_deg: number;
  humidity: number;
  pop: number;
  precip_type: string | null;
  weather_id: number;
  weather_main: string;
  weather_description: string;
  wind_chill: number;
  clouds: number;
  visibility: number;
  uvi: number;
}

export interface HourlyRiskData {
  dt: number;
  risk_score: number;
  risk_level: string;
}

export interface SummitWindowData {
  best_hour: number | null;
  best_score: number | null;
  morning_average: number | null;
  storm_eta: number | null;
  unsafe_after: number | null;
}

export interface ConditionFlagsData {
  windRisk: boolean;
  thunderstormRisk: boolean;
  snowRisk: boolean;
  whiteoutRisk: boolean;
  extremeColdRisk: boolean;
}

export interface ProcessingResult {
  peakId: string;
  rawForecast: OpenWeatherResponse;
  adjustedForecast: AdjustedHourData[];
  hourlyRisk: HourlyRiskData[];
  summitWindow: SummitWindowData;
  riskScore: number;
  riskLevel: string;
  conditionFlags: ConditionFlagsData;
  stormEta: number | null;
}
