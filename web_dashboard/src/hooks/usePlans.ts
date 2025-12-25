import useSWR from 'swr'
import { getPlans, getPlanById, createPlan, approvePlan, cancelPlan, deletePlan } from '@/lib/api'
import type { AttackPlan, AttackPlanCreate } from '@/types/plan'
import toast from 'react-hot-toast'

export function usePlans() {
  const { data, error, isLoading, mutate } = useSWR<AttackPlan[]>('plans', getPlans, {
    revalidateOnFocus: false,
    refreshInterval: 30000,
  })

  const createPlanMutation = async (plan: AttackPlanCreate) => {
    try {
      const newPlan = await createPlan(plan)
      mutate([...(data || []), newPlan], false)
      toast.success('Attack plan created successfully')
      return newPlan
    } catch (error: any) {
      toast.error(error.message || 'Failed to create plan')
      throw error
    }
  }

  const approvePlanMutation = async (id: number) => {
    try {
      const approvedPlan = await approvePlan(id)
      mutate(
        data?.map((p) => (p.plan_id === id ? approvedPlan : p)),
        false
      )
      toast.success('Plan approved and execution started')
      return approvedPlan
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve plan')
      throw error
    }
  }

  const cancelPlanMutation = async (id: number) => {
    try {
      const cancelledPlan = await cancelPlan(id)
      mutate(
        data?.map((p) => (p.plan_id === id ? cancelledPlan : p)),
        false
      )
      toast.success('Plan cancelled')
      return cancelledPlan
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel plan')
      throw error
    }
  }

  const deletePlanMutation = async (id: number) => {
    try {
      await deletePlan(id)
      mutate(
        data?.filter((p) => p.plan_id !== id),
        false
      )
      toast.success('Plan deleted')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete plan')
      throw error
    }
  }

  return {
    plans: data || [],
    isLoading,
    error,
    createPlan: createPlanMutation,
    approvePlan: approvePlanMutation,
    cancelPlan: cancelPlanMutation,
    deletePlan: deletePlanMutation,
    refresh: mutate,
  }
}

export function usePlan(id: number) {
  const { data, error, isLoading, mutate } = useSWR<AttackPlan>(
    id ? `plan-${id}` : null,
    () => getPlanById(id),
    {
      revalidateOnFocus: false,
      refreshInterval: 5000, // Refresh more often for active plans
    }
  )

  return {
    plan: data,
    isLoading,
    error,
    refresh: mutate,
  }
}
