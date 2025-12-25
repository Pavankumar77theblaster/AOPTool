export interface Target {
  target_id: number
  name: string
  url_or_ip: string
  scope: 'in_scope' | 'out_of_scope' | 'undefined'
  risk_tolerance: 'low' | 'medium' | 'high' | 'critical'
  owner_approval: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at?: string
}

export interface TargetCreate {
  name: string
  url_or_ip: string
  scope: 'in_scope' | 'out_of_scope' | 'undefined'
  risk_tolerance: 'low' | 'medium' | 'high' | 'critical'
  owner_approval: boolean
  metadata?: Record<string, any>
}

export interface TargetUpdate {
  name?: string
  url_or_ip?: string
  scope?: 'in_scope' | 'out_of_scope' | 'undefined'
  risk_tolerance?: 'low' | 'medium' | 'high' | 'critical'
  owner_approval?: boolean
  metadata?: Record<string, any>
}

export interface ScopeWhitelistEntry {
  whitelist_id: number
  entry_type: 'ip' | 'cidr' | 'domain'
  value: string
  description?: string
  added_at: string
  added_by?: string
}

export interface ScopeWhitelistCreate {
  entry_type: 'ip' | 'cidr' | 'domain'
  value: string
  description?: string
}
