export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ApiError {
  message: string
  status: number
  detail?: any
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version?: string
  services?: Record<string, {
    status: 'up' | 'down'
    latency_ms?: number
  }>
}

export interface DashboardStats {
  total_targets: number
  total_plans: number
  active_executions: number
  total_evidence: number
  success_rate: number
  recent_executions: Array<{
    execution_id: number
    attack_name: string
    target_name: string
    status: string
    started_at: string
  }>
}
