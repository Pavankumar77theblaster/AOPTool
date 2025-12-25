import useSWR from 'swr'
import { getExecutions, getExecutionById } from '@/lib/api'
import type { AttackExecution } from '@/types/execution'
import { REFRESH_INTERVALS } from '@/lib/constants'

export function useExecutions(params?: {
  plan_id?: number
  attack_id?: number
  target_id?: number
  status?: string
}) {
  const { data, error, isLoading } = useSWR<AttackExecution[]>(
    ['executions', JSON.stringify(params)],
    () => getExecutions(params),
    {
      refreshInterval: REFRESH_INTERVALS.EXECUTIONS, // 5 seconds
      revalidateOnFocus: false,
    }
  )

  return {
    executions: data || [],
    isLoading,
    error,
  }
}

export function useExecution(id: number) {
  const { data, error, isLoading, mutate } = useSWR<AttackExecution>(
    id ? `execution-${id}` : null,
    () => getExecutionById(id),
    {
      // Refresh more often if execution is running
      refreshInterval: (data) => {
        if (!data) return 0
        return data.status === 'running' || data.status === 'queued'
          ? REFRESH_INTERVALS.RUNNING_EXECUTION // 3 seconds
          : 0 // Don't refresh if completed
      },
      revalidateOnFocus: false,
    }
  )

  return {
    execution: data,
    isLoading,
    error,
    refresh: mutate,
  }
}
