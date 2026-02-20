// Badge unlock criteria types
export type BadgeUnlockCriteria =
  | { type: "peak_count"; count: number }
  | { type: "range_complete"; range: string }
  | { type: "peak_list"; peaks: string[] }
  | { type: "peak_list_any"; peaks: string[] }
  | { type: "difficulty_complete"; difficulty: string }
  | { type: "difficulty_any"; difficulty: string }
  | { type: "specific_peak"; peak_slug: string }
  | { type: "seasonal_summit"; months: number[] }
  | { type: "weather_count"; weather: string; count: number }
  | { type: "total_elevation"; feet: number }
  | { type: "total_miles"; miles: number };

export type BadgeCategory =
  | "milestone"
  | "range"
  | "difficulty"
  | "special"
  | "seasonal"
  | "dedication";

export interface BadgeDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: BadgeCategory;
  icon_name: string;
  sort_order: number;
  is_active: boolean;
  unlock_criteria: BadgeUnlockCriteria;
}

export interface Peak {
  id: string;
  slug: string;
  name: string;
  range: string | null;
  difficulty: string | null;
}

export interface SummitLog {
  id: string;
  user_id: string;
  peak_id: string;
  route_id: string | null;
  summit_date: string;
  weather: string | null;
}

export interface Route {
  id: string;
  distance: number | null;
  elevation_gain: number | null;
}

export interface UserData {
  userId: string;
  summitLogs: SummitLog[];
  summitedPeakIds: Set<string>;
  summitedPeakSlugs: Set<string>;
  totalElevation: number;
  totalMiles: number;
}

export interface EvaluationResult {
  earned: boolean;
  triggerPeakId?: string;
}
