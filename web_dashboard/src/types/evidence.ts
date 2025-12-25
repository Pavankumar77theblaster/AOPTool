export type EvidenceType = 'screenshot' | 'log' | 'pcap' | 'exploit_proof' | 'file' | 'other'

export interface Evidence {
  evidence_id: number
  execution_id: number
  evidence_type: EvidenceType
  file_path: string
  file_size_bytes: number
  hash_sha256: string
  metadata?: Record<string, any>
  collected_at: string
  validated: boolean
}

export interface EvidenceCreate {
  execution_id: number
  evidence_type: EvidenceType
  file_path: string
  file_size_bytes: number
  hash_sha256: string
  metadata?: Record<string, any>
}
