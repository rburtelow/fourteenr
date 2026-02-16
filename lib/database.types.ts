export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
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

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Peak = Database["public"]["Tables"]["peaks"]["Row"];
export type Route = Database["public"]["Tables"]["routes"]["Row"];
export type SummitLog = Database["public"]["Tables"]["summit_logs"]["Row"];
export type PeakWatchlistItem = Database["public"]["Tables"]["peak_watchlist"]["Row"];
export type PeakWithRoutes = Peak & { routes: Route[] };
