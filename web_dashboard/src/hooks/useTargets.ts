import useSWR from 'swr'
import { getTargets, getTargetById, createTarget, updateTarget, deleteTarget } from '@/lib/api'
import type { Target, TargetCreate, TargetUpdate } from '@/types/target'
import toast from 'react-hot-toast'

export function useTargets() {
  const { data, error, isLoading, mutate } = useSWR<Target[]>('targets', getTargets, {
    revalidateOnFocus: false,
    refreshInterval: 30000, // 30 seconds
  })

  const createTargetMutation = async (target: TargetCreate) => {
    try {
      const newTarget = await createTarget(target)
      mutate([...(data || []), newTarget], false)
      toast.success('Target created successfully')
      return newTarget
    } catch (error: any) {
      toast.error(error.message || 'Failed to create target')
      throw error
    }
  }

  const updateTargetMutation = async (id: number, target: TargetUpdate) => {
    try {
      const updatedTarget = await updateTarget(id, target)
      mutate(
        data?.map((t) => (t.target_id === id ? updatedTarget : t)),
        false
      )
      toast.success('Target updated successfully')
      return updatedTarget
    } catch (error: any) {
      toast.error(error.message || 'Failed to update target')
      throw error
    }
  }

  const deleteTargetMutation = async (id: number) => {
    try {
      await deleteTarget(id)
      mutate(
        data?.filter((t) => t.target_id !== id),
        false
      )
      toast.success('Target deleted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete target')
      throw error
    }
  }

  return {
    targets: data || [],
    isLoading,
    error,
    createTarget: createTargetMutation,
    updateTarget: updateTargetMutation,
    deleteTarget: deleteTargetMutation,
    refresh: mutate,
  }
}

export function useTarget(id: number) {
  const { data, error, isLoading, mutate } = useSWR<Target>(
    id ? `target-${id}` : null,
    () => getTargetById(id),
    {
      revalidateOnFocus: false,
    }
  )

  return {
    target: data,
    isLoading,
    error,
    refresh: mutate,
  }
}
