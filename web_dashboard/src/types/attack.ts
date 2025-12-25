export type AttackCategory = 'recon' | 'scanning' | 'exploitation' | 'post_exploitation'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type TargetType = 'web' | 'network' | 'api' | 'database' | 'any'

export interface Attack {
  attack_id: number
  name: string
  description: string
  category: AttackCategory
  target_type: TargetType
  risk_level: RiskLevel
  tool_name: string
  command_template: string
  prerequisites?: Record<string, any>
  expected_output?: string
  parsing_rules?: Record<string, any>
  enabled: boolean
  success_rate?: number
  avg_execution_time?: number
  total_executions?: number
}

export interface AttackHistory {
  attack_id: number
  target_type: string
  success: boolean
  execution_count: number
  avg_duration_seconds: number
  last_executed: string
  learned_info?: Record<string, any>
}
