import useSWR from 'swr'
import { getEvidence, getEvidenceById } from '@/lib/api'
import type { Evidence } from '@/types/evidence'

export function useEvidence(params?: {
  execution_id?: number
  evidence_type?: string
}) {
  const { data, error, isLoading } = useSWR<Evidence[]>(
    ['evidence', JSON.stringify(params)],
    () => getEvidence(params),
    {
      revalidateOnFocus: false,
      refreshInterval: 30000,
    }
  )

  return {
    evidence: data || [],
    isLoading,
    error,
  }
}

export function useEvidenceItem(id: number) {
  const { data, error, isLoading } = useSWR<Evidence>(
    id ? `evidence-${id}` : null,
    () => getEvidenceById(id),
    {
      revalidateOnFocus: false,
    }
  )

  return {
    evidenceItem: data,
    isLoading,
    error,
  }
}
