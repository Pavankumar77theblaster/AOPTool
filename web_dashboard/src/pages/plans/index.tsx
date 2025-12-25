import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Spinner from '@/components/common/Spinner'
import { usePlans } from '@/hooks/usePlans'
import { formatDate } from '@/lib/utils'
import type { PlanStatus } from '@/types/plan'

export default function PlansPage() {
  const { plans, isLoading, deletePlan } = usePlans()
  const [statusFilter, setStatusFilter] = useState<PlanStatus | 'all'>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const filteredPlans = plans.filter((plan) => {
    if (statusFilter === 'all') return true
    return plan.status === statusFilter
  })

  const statuses = ['all', 'pending', 'approved', 'running', 'completed', 'failed', 'cancelled'] as const

  const handleDelete = async (id: number) => {
    await deletePlan(id)
    setDeleteConfirm(null)
  }

  return (
    <Layout>
      <Head>
        <title>Attack Plans - AOPTool</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark-text">Attack Plans</h1>
            <p className="mt-1 text-dark-muted">
              Manage your attack sequences
            </p>
          </div>
          <Link href="/plans/new">
            <Button>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Plan
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-dark-muted">Filter by status:</span>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    statusFilter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-hover text-dark-muted hover:text-dark-text'
                  }`}
                >
                  {status === 'all' ? 'All' : status}
                </button>
              ))}
            </div>
            <span className="text-sm text-dark-muted ml-auto">
              {filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''}
            </span>
          </div>
        </Card>

        {/* Plans List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner text="Loading plans..." />
          </div>
        ) : filteredPlans.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-dark-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-semibold text-dark-text mb-2">No plans found</h3>
              <p className="text-dark-muted mb-4">
                {statusFilter === 'all' ? 'Create your first attack plan' : `No plans with status: ${statusFilter}`}
              </p>
              <Link href="/plans/new">
                <Button>Create Plan</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPlans.map((plan) => (
              <Card key={plan.plan_id} hover>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Link href={`/plans/${plan.plan_id}`}>
                        <h3 className="text-lg font-semibold text-dark-text hover:text-primary-400 transition-colors">
                          Plan #{plan.plan_id}
                        </h3>
                      </Link>
                      <Badge variant="plan" value={plan.status} className="uppercase">
                        {plan.status}
                      </Badge>
                      <Badge variant="risk" value={plan.max_risk_level} className="uppercase">
                        Max: {plan.max_risk_level}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-dark-muted mb-3">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>Target #{plan.target_id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>{plan.attack_sequence.length} attacks</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Created {formatDate(plan.created_at, 'PP')}</span>
                      </div>
                    </div>

                    {plan.metadata?.reasoning && (
                      <p className="text-sm text-dark-muted italic">
                        "{plan.metadata.reasoning}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link href={`/plans/${plan.plan_id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    {deleteConfirm === plan.plan_id ? (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(plan.plan_id)}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteConfirm(plan.plan_id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
