import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Spinner from '@/components/common/Spinner'
import { useExecution } from '@/hooks/useExecutions'
import { useAttack } from '@/hooks/useAttacks'
import { useTarget } from '@/hooks/useTargets'
import { formatDate, formatDuration } from '@/lib/utils'

export default function ExecutionDetailsPage() {
  const router = useRouter()
  const { id } = router.query
  const executionId = id ? parseInt(id as string) : 0

  const { execution, isLoading, error } = useExecution(executionId)
  const { attack } = useAttack(execution?.attack_id || 0)
  const { target } = useTarget(execution?.target_id || 0)

  const isActive = execution?.status === 'running' || execution?.status === 'queued'

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Spinner text="Loading execution..." />
        </div>
      </Layout>
    )
  }

  if (error || !execution) {
    return (
      <Layout>
        <Card>
          <div className="text-center py-12">
            <p className="text-danger-400">Failed to load execution</p>
            <Button className="mt-4" onClick={() => router.push('/executions')}>
              Back to Executions
            </Button>
          </div>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Execution #{execution.execution_id} - Details</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-dark-text">Execution #{execution.execution_id}</h1>
              <Badge variant="execution" value={execution.status} className="uppercase">
                {execution.status}
              </Badge>
              {isActive && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                  <span className="text-sm text-primary-400">Auto-refreshing every 3s</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 text-dark-muted">
              {attack && <span>Attack: {attack.name}</span>}
              {target && <span>Target: {target.name}</span>}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {execution.evidence_collected && (
              <Link href={`/evidence?execution_id=${execution.execution_id}`}>
                <Button variant="outline">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  View Evidence
                </Button>
              </Link>
            )}
            <Link href={`/plans/${execution.plan_id}`}>
              <Button variant="outline">View Plan</Button>
            </Link>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="execution" value={execution.status} className="text-lg">
                {execution.status}
              </Badge>
              {execution.retry_count > 0 && (
                <p className="text-sm text-warning-400 mt-2">
                  Retried {execution.retry_count} time{execution.retry_count !== 1 ? 's' : ''}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Duration</CardTitle>
            </CardHeader>
            <CardContent>
              {execution.duration_seconds !== undefined ? (
                <p className="text-2xl font-bold text-dark-text font-mono">
                  {formatDuration(execution.duration_seconds)}
                </p>
              ) : isActive ? (
                <p className="text-dark-muted">Running...</p>
              ) : (
                <p className="text-dark-muted">N/A</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              {execution.evidence_collected ? (
                <div className="flex items-center text-success-400">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">Collected</span>
                </div>
              ) : (
                <div className="flex items-center text-dark-muted">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>None</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
                <div className="flex-1">
                  <p className="text-dark-text font-semibold">Started</p>
                  <p className="text-sm text-dark-muted">{formatDate(execution.started_at)}</p>
                </div>
              </div>
              {execution.completed_at && (
                <div className="flex items-start space-x-4">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    execution.status === 'completed' ? 'bg-success-500' : 'bg-danger-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-dark-text font-semibold">Completed</p>
                    <p className="text-sm text-dark-muted">{formatDate(execution.completed_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Output / Logs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Execution Output</CardTitle>
              {isActive && (
                <span className="text-xs text-primary-400 animate-pulse">Streaming...</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {execution.output ? (
              <pre className="code-block max-h-96 overflow-y-auto text-xs whitespace-pre-wrap">
                {execution.output}
              </pre>
            ) : (
              <div className="text-center py-8">
                <p className="text-dark-muted">
                  {isActive ? 'Waiting for output...' : 'No output available'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Message */}
        {execution.error_message && (
          <Card className="border-danger-700 bg-danger-950 bg-opacity-20">
            <CardHeader>
              <CardTitle className="text-danger-300">Error Message</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-danger-400 whitespace-pre-wrap">
                {execution.error_message}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        {execution.metadata && Object.keys(execution.metadata).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="code-block text-xs">
                {JSON.stringify(execution.metadata, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
