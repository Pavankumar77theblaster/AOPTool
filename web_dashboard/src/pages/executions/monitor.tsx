import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Spinner from '@/components/common/Spinner'
import { useExecutions } from '@/hooks/useExecutions'
import { formatRelativeTime, formatDuration } from '@/lib/utils'

export default function MonitorPage() {
  const { executions, isLoading } = useExecutions()

  const activeExecutions = executions.filter(
    (e) => e.status === 'running' || e.status === 'queued'
  )

  const recentCompleted = executions
    .filter((e) => e.status === 'completed')
    .slice(0, 5)

  const recentFailed = executions
    .filter((e) => e.status === 'failed' || e.status === 'timeout')
    .slice(0, 5)

  return (
    <Layout>
      <Head>
        <title>Live Monitor - AOPTool</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark-text">Live Execution Monitor</h1>
            <p className="mt-1 text-dark-muted">
              Real-time attack execution monitoring (auto-refresh every 5s)
            </p>
          </div>
          {activeExecutions.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-success-500 animate-pulse"></div>
              <span className="text-success-400 font-semibold">
                {activeExecutions.length} Active
              </span>
            </div>
          )}
        </div>

        {/* Active Executions */}
        <Card className="border-primary-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Executions</CardTitle>
              {isLoading && <Spinner size="sm" />}
            </div>
          </CardHeader>
          <CardContent>
            {activeExecutions.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-dark-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-dark-text mb-2">No active executions</h3>
                <p className="text-dark-muted mb-4">All executions have completed</p>
                <Link href="/plans/new">
                  <button className="btn-primary">Create Attack Plan</button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeExecutions.map((execution) => (
                  <Link key={execution.execution_id} href={`/executions/${execution.execution_id}`}>
                    <div className="p-4 bg-dark-hover hover:bg-primary-950 hover:border-primary-700 border border-dark-border rounded-lg transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                          <h4 className="font-semibold text-dark-text">
                            Execution #{execution.execution_id}
                          </h4>
                          <Badge variant="execution" value={execution.status}>
                            {execution.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-dark-muted">
                          Started {formatRelativeTime(execution.started_at)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-dark-muted">
                        <span>Attack #{execution.attack_id}</span>
                        <span>Target #{execution.target_id}</span>
                        <span>Plan #{execution.plan_id}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 h-2 bg-dark-bg rounded-full overflow-hidden">
                        <div className="h-full bg-primary-600 rounded-full animate-pulse" style={{ width: execution.status === 'running' ? '50%' : '10%' }}></div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent>
              <p className="text-sm text-dark-muted">Active Executions</p>
              <p className="text-3xl font-bold text-primary-400 mt-2">
                {activeExecutions.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm text-dark-muted">Completed (Recent)</p>
              <p className="text-3xl font-bold text-success-400 mt-2">
                {recentCompleted.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-sm text-dark-muted">Failed (Recent)</p>
              <p className="text-3xl font-bold text-danger-400 mt-2">
                {recentFailed.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Completed */}
          <Card className="border-success-700">
            <CardHeader>
              <CardTitle className="text-success-300">Recently Completed</CardTitle>
            </CardHeader>
            <CardContent>
              {recentCompleted.length === 0 ? (
                <p className="text-center text-dark-muted py-4">No completed executions</p>
              ) : (
                <div className="space-y-3">
                  {recentCompleted.map((execution) => (
                    <Link key={execution.execution_id} href={`/executions/${execution.execution_id}`}>
                      <div className="p-3 bg-dark-hover rounded-lg hover:bg-success-950 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-dark-text">
                            Execution #{execution.execution_id}
                          </span>
                          <Badge variant="execution" value={execution.status}>
                            {execution.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-dark-muted">
                            {formatRelativeTime(execution.completed_at!)}
                          </span>
                          {execution.duration_seconds && (
                            <span className="text-dark-text font-mono">
                              {formatDuration(execution.duration_seconds)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Failed */}
          <Card className="border-danger-700">
            <CardHeader>
              <CardTitle className="text-danger-300">Recently Failed</CardTitle>
            </CardHeader>
            <CardContent>
              {recentFailed.length === 0 ? (
                <p className="text-center text-dark-muted py-4">No failed executions</p>
              ) : (
                <div className="space-y-3">
                  {recentFailed.map((execution) => (
                    <Link key={execution.execution_id} href={`/executions/${execution.execution_id}`}>
                      <div className="p-3 bg-dark-hover rounded-lg hover:bg-danger-950 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-dark-text">
                            Execution #{execution.execution_id}
                          </span>
                          <Badge variant="execution" value={execution.status}>
                            {execution.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-dark-muted">
                            {formatRelativeTime(execution.completed_at || execution.started_at)}
                          </span>
                          {execution.retry_count > 0 && (
                            <span className="text-warning-400">
                              Retried {execution.retry_count}x
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
