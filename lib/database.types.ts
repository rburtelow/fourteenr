export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
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
    };
  };
}

// Convenience types
export type Peak = Database["public"]["Tables"]["peaks"]["Row"];
export type Route = Database["public"]["Tables"]["routes"]["Row"];
export type PeakWithRoutes = Peak & { routes: Route[] };
