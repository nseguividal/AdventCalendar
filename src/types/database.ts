export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      calendars: {
        Row: {
          id: string
          slug: string
          title: string
          puzzle_image_url: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          puzzle_image_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          puzzle_image_url?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      calendar_riddles: {
        Row: {
          id: string
          calendar_id: string
          day_number: number
          riddle_text: string
          solution: string
          hint: string | null
          challenge_type: string
          config: Json
          created_at: string | null
        }
        Insert: {
          id?: string
          calendar_id: string
          day_number: number
          riddle_text?: string
          solution?: string
          hint?: string | null
          challenge_type?: string
          config?: Json
          created_at?: string | null
        }
        Update: {
          id?: string
          calendar_id?: string
          day_number?: number
          riddle_text?: string
          solution?: string
          hint?: string | null
          challenge_type?: string
          config?: Json
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_riddles_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "calendars"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          name: string
          calendar_id: string
          avatar_color: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          calendar_id: string
          avatar_color?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          calendar_id?: string
          avatar_color?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "calendars"
            referencedColumns: ["id"]
          }
        ]
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          calendar_id: string
          day_number: number
          opened_at: string | null
          solved_at: string | null
          score: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          calendar_id: string
          day_number: number
          opened_at?: string | null
          solved_at?: string | null
          score?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          calendar_id?: string
          day_number?: number
          opened_at?: string | null
          solved_at?: string | null
          score?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "calendars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

/** Convenience type aliases */
export type Calendar = Database['public']['Tables']['calendars']['Row']
export type CalendarInsert = Database['public']['Tables']['calendars']['Insert']
export type CalendarUpdate = Database['public']['Tables']['calendars']['Update']

export type CalendarRiddle = Database['public']['Tables']['calendar_riddles']['Row']
export type CalendarRiddleInsert = Database['public']['Tables']['calendar_riddles']['Insert']
export type CalendarRiddleUpdate = Database['public']['Tables']['calendar_riddles']['Update']

export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type UserProgress = Database['public']['Tables']['user_progress']['Row']
export type UserProgressInsert = Database['public']['Tables']['user_progress']['Insert']
export type UserProgressUpdate = Database['public']['Tables']['user_progress']['Update']
