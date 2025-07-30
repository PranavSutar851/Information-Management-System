export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          role: 'founder' | 'manager'
          name: string | null
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          role: 'founder' | 'manager'
          name?: string | null
          email: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'founder' | 'manager'
          name?: string | null
          email?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ideas: {
        Row: {
          id: string
          founder_id: string
          title: string
          description: string
          category: string
          market_size: string
          business_model: string
          status: 'submitted' | 'under_review' | 'funded' | 'rejected'
          ai_score: number | null
          ai_recommendations: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          founder_id: string
          title: string
          description: string
          category: string
          market_size: string
          business_model: string
          status?: 'submitted' | 'under_review' | 'funded' | 'rejected'
          ai_score?: number | null
          ai_recommendations?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          founder_id?: string
          title?: string
          description?: string
          category?: string
          market_size?: string
          business_model?: string
          status?: 'submitted' | 'under_review' | 'funded' | 'rejected'
          ai_score?: number | null
          ai_recommendations?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          idea_id: string
          criteria: Json
          overall_score: number
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          criteria: Json
          overall_score: number
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          criteria?: Json
          overall_score?: number
          completed_at?: string
          created_at?: string
        }
      }
      manager_decisions: {
        Row: {
          id: string
          idea_id: string
          manager_id: string
          decision: 'approved' | 'rejected'
          funding_amount: number | null
          competitor_analysis: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          manager_id: string
          decision: 'approved' | 'rejected'
          funding_amount?: number | null
          competitor_analysis?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          manager_id?: string
          decision?: 'approved' | 'rejected'
          funding_amount?: number | null
          competitor_analysis?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'founder' | 'manager'
      idea_status: 'submitted' | 'under_review' | 'funded' | 'rejected'
      decision_type: 'approved' | 'rejected'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']