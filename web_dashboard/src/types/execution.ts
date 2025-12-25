export type ExecutionStatus = 'queued' | 'running' | 'completed' | 'failed' | 'timeout' | 'cancelled'

export interface AttackExecution {
  execution_id: number
  plan_id: number
  attack_id: number
  target_id: number
  status: ExecutionStatus
  started_at: string
  completed_at?: string
  duration_seconds?: number
  output?: string
  error_message?: string
  retry_count: number
  evidence_collected: boolean
  metadata?: Record<string, any>
}

export interface ExecutionCreate {
  plan_id: number
  attack_id: number
  target_id: number
}

export interface ExecutionStats {
  total_executions: number
  running: number
  completed: number
  failed: number
  success_rate: number
  avg_duration_seconds: number
}
