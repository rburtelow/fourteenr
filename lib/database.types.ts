export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      community_posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          peak_id: string | null;
          is_condition_report: boolean;
          image_urls: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          content: string;
          peak_id?: string | null;
          is_condition_report?: boolean;
          image_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          peak_id?: string | null;
          is_condition_report?: boolean;
          image_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "community_posts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "community_posts_peak_id_fkey";
            columns: ["peak_id"];
            referencedRelation: "peaks";
            referencedColumns: ["id"];
          }
        ];
      };
      post_likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          post_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_likes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_likes_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "community_posts";
            referencedColumns: ["id"];
          }
        ];
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id?: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_comments_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_comments_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "community_posts";
            referencedColumns: ["id"];
          }
        ];
      };
      community_events: {
        Row: {
          id: string;
          created_by: string;
          title: string;
          description: string | null;
          event_date: string;
          end_date: string | null;
          location: string;
          peak_id: string | null;
          max_attendees: number | null;
          status: string;
          community_post_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by?: string;
          title: string;
          description?: string | null;
          event_date: string;
          end_date?: string | null;
          location: string;
          peak_id?: string | null;
          max_attendees?: number | null;
          status?: string;
          community_post_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          title?: string;
          description?: string | null;
          event_date?: string;
          end_date?: string | null;
          location?: string;
          peak_id?: string | null;
          max_attendees?: number | null;
          status?: string;
          community_post_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "community_events_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "community_events_peak_id_fkey";
            columns: ["peak_id"];
            referencedRelation: "peaks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "community_events_community_post_id_fkey";
            columns: ["community_post_id"];
            referencedRelation: "community_posts";
            referencedColumns: ["id"];
          }
        ];
      };
      event_attendees: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey";
            columns: ["event_id"];
            referencedRelation: "community_events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          actor_id: string | null;
          type: string;
          post_id: string | null;
          comment_id: string | null;
          badge_id: string | null;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          actor_id?: string | null;
          type: string;
          post_id?: string | null;
          comment_id?: string | null;
          badge_id?: string | null;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          actor_id?: string | null;
          type?: string;
          post_id?: string | null;
          comment_id?: string | null;
          badge_id?: string | null;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_actor_id_fkey";
            columns: ["actor_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "community_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_comment_id_fkey";
            columns: ["comment_id"];
            referencedRelation: "post_comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_badge_id_fkey";
            columns: ["badge_id"];
            referencedRelation: "badge_definitions";
            referencedColumns: ["id"];
          }
        ];
      };
      post_saves: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          post_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_saves_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_saves_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "community_posts";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          screen_name: string | null;
          full_name: string | null;
          avatar_url: string | null;
          location: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          screen_name?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          location?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          screen_name?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          location?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      peaks: {
        Row: {
          id: string;
          slug: string;
          name: string;
          elevation: number;
          rank: number | null;
          range: string | null;
          difficulty: string | null;
          prominence: number | null;
          latitude: number | null;
          longitude: number | null;
          county: string | null;
          forest: string | null;
          nearby_towns: string[] | null;
          completions: number | null;
          recent_trip_reports: number | null;
          cell_reception: string | null;
          description: string | null;
          forecast_elevation_ft: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          elevation: number;
          rank?: number | null;
          range?: string | null;
          difficulty?: string | null;
          prominence?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          county?: string | null;
          forest?: string | null;
          nearby_towns?: string[] | null;
          completions?: number | null;
          recent_trip_reports?: number | null;
          cell_reception?: string | null;
          description?: string | null;
          forecast_elevation_ft?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          elevation?: number;
          rank?: number | null;
          range?: string | null;
          difficulty?: string | null;
          prominence?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          county?: string | null;
          forest?: string | null;
          nearby_towns?: string[] | null;
          completions?: number | null;
          recent_trip_reports?: number | null;
          cell_reception?: string | null;
          description?: string | null;
          forecast_elevation_ft?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      routes: {
        Row: {
          id: string;
          peak_id: string;
          name: string;
          distance: number | null;
          elevation_gain: number | null;
          difficulty: string | null;
          estimated_time: string | null;
          trailhead: string | null;
          description: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          peak_id: string;
          name: string;
          distance?: number | null;
          elevation_gain?: number | null;
          difficulty?: string | null;
          estimated_time?: string | null;
          trailhead?: string | null;
          description?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          peak_id?: string;
          name?: string;
          distance?: number | null;
          elevation_gain?: number | null;
          difficulty?: string | null;
          estimated_time?: string | null;
          trailhead?: string | null;
          description?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "routes_peak_id_fkey";
            columns: ["peak_id"];
            referencedRelation: "peaks";
            referencedColumns: ["id"];
          }
        ];
      };
      peak_watchlist: {
        Row: {
          id: string;
          user_id: string;
          peak_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          peak_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          peak_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "peak_watchlist_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "peak_watchlist_peak_id_fkey";
            columns: ["peak_id"];
            referencedRelation: "peaks";
            referencedColumns: ["id"];
          }
        ];
      };
      peak_forecasts: {
        Row: {
          id: string;
          peak_id: string;
          raw_forecast: RawForecastJson | null;
          adjusted_forecast: AdjustedHour[] | null;
          hourly_risk: HourlyRisk[] | null;
          summit_window: SummitWindow | null;
          risk_score: number | null;
          risk_level: string | null;
          condition_flags: ConditionFlags | null;
          storm_eta: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          peak_id: string;
          raw_forecast?: RawForecastJson | null;
          adjusted_forecast?: AdjustedHour[] | null;
          hourly_risk?: HourlyRisk[] | null;
          summit_window?: SummitWindow | null;
          risk_score?: number | null;
          risk_level?: string | null;
          condition_flags?: ConditionFlags | null;
          storm_eta?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          peak_id?: string;
          raw_forecast?: RawForecastJson | null;
          adjusted_forecast?: AdjustedHour[] | null;
          hourly_risk?: HourlyRisk[] | null;
          summit_window?: SummitWindow | null;
          risk_score?: number | null;
          risk_level?: string | null;
          condition_flags?: ConditionFlags | null;
          storm_eta?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "peak_forecasts_peak_id_fkey";
            columns: ["peak_id"];
            referencedRelation: "peaks";
            referencedColumns: ["id"];
          }
        ];
      };
      summit_logs: {
        Row: {
          id: string;
          user_id: string;
          peak_id: string;
          route_id: string | null;
          summit_date: string;
          rating: number | null;
          weather: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          peak_id: string;
          route_id?: string | null;
          summit_date?: string;
          rating?: number | null;
          weather?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          peak_id?: string;
          route_id?: string | null;
          summit_date?: string;
          rating?: number | null;
          weather?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "summit_logs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "summit_logs_peak_id_fkey";
            columns: ["peak_id"];
            referencedRelation: "peaks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "summit_logs_route_id_fkey";
            columns: ["route_id"];
            referencedRelation: "routes";
            referencedColumns: ["id"];
          }
        ];
      };
    };
  };
}

// Weather forecast types used in the database schema
export interface AdjustedHour {
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

export interface HourlyRisk {
  dt: number;
  risk_score: number;
  risk_level: string;
}

export interface SummitWindow {
  best_hour: number | null;
  best_score: number | null;
  morning_average: number | null;
  storm_eta: number | null;
  unsafe_after: number | null;
}

export interface ConditionFlags {
  windRisk: boolean;
  thunderstormRisk: boolean;
  snowRisk: boolean;
  whiteoutRisk: boolean;
  extremeColdRisk: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RawForecastJson = any;

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

// Badge definition type
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
  created_at: string;
}

// User badge (earned badge) type
export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  trigger_peak_id: string | null;
}

// User badge with joined badge definition
export interface UserBadgeWithDefinition extends UserBadge {
  badge_definitions: BadgeDefinition;
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Peak = Database["public"]["Tables"]["peaks"]["Row"];
export type Route = Database["public"]["Tables"]["routes"]["Row"];
export type SummitLog = Database["public"]["Tables"]["summit_logs"]["Row"];
export type PeakWatchlistItem = Database["public"]["Tables"]["peak_watchlist"]["Row"];
export type PeakForecast = Database["public"]["Tables"]["peak_forecasts"]["Row"];
export type PeakWithRoutes = Peak & { routes: Route[] };
export type CommunityPostRow = Database["public"]["Tables"]["community_posts"]["Row"];
export type PostLike = Database["public"]["Tables"]["post_likes"]["Row"];
export type PostComment = Database["public"]["Tables"]["post_comments"]["Row"];
export type PostSave = Database["public"]["Tables"]["post_saves"]["Row"];
export type CommunityEventRow = Database["public"]["Tables"]["community_events"]["Row"];
export type EventAttendeeRow = Database["public"]["Tables"]["event_attendees"]["Row"];
