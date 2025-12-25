import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { getRiskBadgeClass, getExecutionStatusBadgeClass, getPlanStatusBadgeClass } from '@/lib/utils'
import type { RiskLevel } from '@/types/attack'
import type { ExecutionStatus } from '@/types/execution'
import type { PlanStatus } from '@/types/plan'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'risk' | 'execution' | 'plan'
  value?: RiskLevel | ExecutionStatus | PlanStatus
  className?: string
}

export default function Badge({ children, variant = 'default', value, className }: BadgeProps) {
  let badgeClass = 'badge'

  if (variant === 'risk' && value) {
    badgeClass = getRiskBadgeClass(value as RiskLevel)
  } else if (variant === 'execution' && value) {
    badgeClass = getExecutionStatusBadgeClass(value as ExecutionStatus)
  } else if (variant === 'plan' && value) {
    badgeClass = getPlanStatusBadgeClass(value as PlanStatus)
  }

  return (
    <span className={cn(badgeClass, className)}>
      {children}
    </span>
  )
}
