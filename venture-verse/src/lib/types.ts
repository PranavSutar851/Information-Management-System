export type UserRole = 'founder' | 'manager'

export type IdeaStatus = 'submitted' | 'under_review' | 'funded' | 'rejected'

export type Decision = 'approved' | 'rejected'

export interface User {
  id: string
  role: UserRole
  name: string
  email: string
  avatar_url?: string
  created_at: string
}

export interface Idea {
  id: string
  founder_id: string
  title: string
  description: string
  category: string
  market_size: string
  business_model: string
  status: IdeaStatus
  ai_score?: number
  ai_recommendations?: any
  created_at: string
  updated_at: string
}

export interface Assessment {
  id: string
  idea_id: string
  criteria: {
    innovation: number
    market_fit: number
    team_strength: number
    revenue_potential: number
  }
  overall_score: number
  completed_at: string
}

export interface ManagerDecision {
  id: string
  idea_id: string
  manager_id: string
  decision: Decision
  funding_amount?: number
  competitor_analysis?: string
  notes?: string
  created_at: string
}

export interface IdeaWithDetails extends Idea {
  founder: User
  assessment?: Assessment
  manager_decision?: ManagerDecision
}

export interface AIAssessmentResponse {
  scores: {
    innovation: number
    market_fit: number
    team_strength: number
    revenue_potential: number
  }
  overall_score: number
  recommendations: string[]
  analysis: string
}

export interface DashboardStats {
  total_ideas: number
  pending_review: number
  approved: number
  rejected: number
  average_score: number
}

export interface CategoryStats {
  category: string
  count: number
  average_score: number
}