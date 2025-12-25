import { RiskLevel } from './attack'

export type PlanStatus = 'pending' | 'approved' | 'running' | 'completed' | 'failed' | 'cancelled'
export type SchedulingType = 'immediate' | 'scheduled' | 'manual_trigger' | 'cron'

export interface AttackPlan {
  plan_id: number
  target_id: number
  attack_sequence: number[]
  scheduling: SchedulingType
  scheduled_time?: string
  cron_expression?: string
  max_risk_level: RiskLevel
  stop_on_failure: boolean
  metadata?: Record<string, any>
  status: PlanStatus
  created_at: string
  created_by?: string
  approved_at?: string
  approved_by?: string
  started_at?: string
  completed_at?: string
  error_message?: string
}

export interface AttackPlanCreate {
  target_id: number
  attack_sequence: number[]
  scheduling?: SchedulingType
  scheduled_time?: string
  cron_expression?: string
  max_risk_level?: RiskLevel
  stop_on_failure?: boolean
  metadata?: Record<string, any>
}

export interface TranslateRequest {
  description: string
  target_id: number
  risk_level?: RiskLevel
  max_attacks?: number
}

export interface TranslateResponse {
  success: boolean
  attack_plan_id?: number
  attack_sequence: number[]
  reasoning: string
  estimated_duration_minutes: number
  risk_assessment: RiskLevel
  ai_model: string
  attack_details?: Array<{
    attack_id: number
    name: string
    category: string
    risk_level: RiskLevel
  }>
}
