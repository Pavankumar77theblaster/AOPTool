import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Spinner from '@/components/common/Spinner'
import { useExecutions } from '@/hooks/useExecutions'
import { formatDate, formatDuration, formatRelativeTime } from '@/lib/utils'
import type { ExecutionStatus } from '@/types/execution'

export default function ExecutionsPage() {
  const router = useRouter()
  const { plan_id, target_id } = router.query

  const { executions, isLoading } = useExecutions({
    plan_id: plan_id ? parseInt(plan_id as string) : undefined,
    target_id: target_id ? parseInt(target_id as string) : undefined,
  })

  const [statusFilter, setStatusFilter] = useState<ExecutionStatus | 'all'>('all')

  const filteredExecutions = executions.filter((execution) => {
    if (statusFilter === 'all') return true
    return execution.status === statusFilter
  })

  const statuses = ['all', 'queued', 'running', 'completed', 'failed', 'timeout', 'cancelled'] as const

  const activeExecutions = executions.filter(
    (e) => e.status === 'queued' || e.status === 'running'
  )

  return (
    <Layout>
      <Head>
        <title>Executions - AOPTool</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark-text">Attack Executions</h1>
            <p className="mt-1 text-dark-muted">
              {activeExecutions.length > 0 && (
                <span className="text-primary-400 font-semibold">
                  {activeExecutions.length} active execution{activeExecutions.length !== 1 ? 's' : ''}
                </span>
              )}
              {activeExecutions.length === 0 && 'No active executions'}
            </p>
          </div>
          {activeExecutions.length > 0 && (
            <Link href="/executions/monitor">
              <button className="btn-primary">
                <svg className="w-5 h-5 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Monitor Live
              </button>
            </Link>
          )}
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
              {filteredExecutions.length} execution{filteredExecutions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </Card>

        {/* Executions List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner text="Loading executions..." />
          </div>
        ) : filteredExecutions.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-dark-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-lg font-semibold text-dark-text mb-2">No executions found</h3>
              <p className="text-dark-muted">
                {statusFilter === 'all' ? 'No attack executions yet' : `No executions with status: ${statusFilter}`}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredExecutions.map((execution) => (
              <Link key={execution.execution_id} href={`/executions/${execution.execution_id}`}>
                <Card hover>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-dark-text">
                          Execution #{execution.execution_id}
                        </h3>
                        <Badge variant="execution" value={execution.status} className="uppercase">
                          {execution.status}
                        </Badge>
                        {execution.evidence_collected && (
                          <Badge className="badge-success">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Evidence
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-dark-muted">
                        <span>Attack #{execution.attack_id}</span>
                        <span>Target #{execution.target_id}</span>
                        <span>Plan #{execution.plan_id}</span>
                        {execution.retry_count > 0 && (
                          <span className="text-warning-400">Retried {execution.retry_count}x</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-dark-muted">
                        {execution.completed_at
                          ? `Completed ${formatRelativeTime(execution.completed_at)}`
                          : `Started ${formatRelativeTime(execution.started_at)}`}
                      </p>
                      {execution.duration_seconds !== undefined && (
                        <p className="text-sm font-mono text-dark-text mt-1">
                          {formatDuration(execution.duration_seconds)}
                        </p>
                      )}
                      {(execution.status === 'running' || execution.status === 'queued') && (
                        <div className="flex items-center justify-end space-x-2 mt-2">
                          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                          <span className="text-xs text-primary-400">Live</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
