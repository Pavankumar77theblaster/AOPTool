import useSWR from 'swr'
import { getAttacks, getAttackById, getAttackHistory } from '@/lib/api'
import type { Attack, AttackHistory } from '@/types/attack'

export function useAttacks() {
  const { data, error, isLoading } = useSWR<{ attacks: Attack[]; count: number }>(
    'attacks',
    getAttacks,
    {
      revalidateOnFocus: false,
      refreshInterval: 60000, // 60 seconds
    }
  )

  return {
    attacks: data?.attacks || [],
    count: data?.count || 0,
    isLoading,
    error,
  }
}

export function useAttack(id: number) {
  const { data, error, isLoading } = useSWR<Attack>(
    id ? `attack-${id}` : null,
    () => getAttackById(id),
    {
      revalidateOnFocus: false,
    }
  )

  return {
    attack: data,
    isLoading,
    error,
  }
}

export function useAttackHistory(attackId: number) {
  const { data, error, isLoading } = useSWR<AttackHistory[]>(
    attackId ? `attack-history-${attackId}` : null,
    () => getAttackHistory(attackId),
    {
      revalidateOnFocus: false,
    }
  )

  return {
    history: data || [],
    isLoading,
    error,
  }
}
