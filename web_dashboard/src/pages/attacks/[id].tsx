import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Spinner from '@/components/common/Spinner'
import { useAttack, useAttackHistory } from '@/hooks/useAttacks'
import { formatDate } from '@/lib/utils'

export default function AttackDetailsPage() {
  const router = useRouter()
  const { id } = router.query
  const attackId = id ? parseInt(id as string) : 0

  const { attack, isLoading, error } = useAttack(attackId)
  const { history, isLoading: historyLoading } = useAttackHistory(attackId)

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Spinner text="Loading attack..." />
        </div>
      </Layout>
    )
  }

  if (error || !attack) {
    return (
      <Layout>
        <Card>
          <div className="text-center py-12">
            <p className="text-danger-400">Failed to load attack</p>
            <Button className="mt-4" onClick={() => router.push('/attacks')}>
              Back to Attack Library
            </Button>
          </div>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>{attack.name} - Attack Details</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-dark-text">{attack.name}</h1>
            <Badge variant="risk" value={attack.risk_level} className="uppercase">
              {attack.risk_level}
            </Badge>
            <span className="badge capitalize">{attack.category.replace('_', ' ')}</span>
          </div>
          <p className="text-dark-muted">{attack.description}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Attack Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-dark-muted">Attack ID</dt>
                  <dd className="mt-1 text-dark-text font-mono">#{attack.attack_id}</dd>
                </div>
                <div>
                  <dt className="text-sm text-dark-muted">Category</dt>
                  <dd className="mt-1">
                    <span className="badge capitalize">{attack.category.replace('_', ' ')}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-dark-muted">Tool</dt>
                  <dd className="mt-1 text-dark-text font-mono">{attack.tool_name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-dark-muted">Target Type</dt>
                  <dd className="mt-1 text-dark-text capitalize">{attack.target_type}</dd>
                </div>
                <div>
                  <dt className="text-sm text-dark-muted">Risk Level</dt>
                  <dd className="mt-1">
                    <Badge variant="risk" value={attack.risk_level}>
                      {attack.risk_level}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                {attack.total_executions !== undefined && (
                  <div>
                    <dt className="text-sm text-dark-muted">Total Executions</dt>
                    <dd className="mt-1 text-2xl font-bold text-dark-text">{attack.total_executions}</dd>
                  </div>
                )}
                {attack.success_rate !== undefined && (
                  <div>
                    <dt className="text-sm text-dark-muted">Success Rate</dt>
                    <dd className="mt-1 text-2xl font-bold text-success-400">{attack.success_rate.toFixed(1)}%</dd>
                  </div>
                )}
                {attack.avg_execution_time !== undefined && (
                  <div>
                    <dt className="text-sm text-dark-muted">Avg Execution Time</dt>
                    <dd className="mt-1 text-dark-text">{attack.avg_execution_time.toFixed(0)}s</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Command Template */}
        <Card>
          <CardHeader>
            <CardTitle>Command Template</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="code-block">
              {attack.command_template}
            </pre>
            <p className="text-xs text-dark-muted mt-2">
              Variables like <code className="text-primary-400">{'{target}'}</code> will be replaced at execution time
            </p>
          </CardContent>
        </Card>

        {/* Prerequisites */}
        {attack.prerequisites && Object.keys(attack.prerequisites).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="code-block text-xs">
                {JSON.stringify(attack.prerequisites, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Execution History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Execution History</CardTitle>
              {!historyLoading && history.length > 0 && (
                <span className="text-sm text-dark-muted">{history.length} records</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="sm" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-dark-muted">No execution history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-dark-hover rounded-lg"
                  >
                    <div>
                      <p className="text-dark-text">
                        Target Type: <span className="font-semibold capitalize">{record.target_type}</span>
                      </p>
                      <p className="text-sm text-dark-muted">
                        {record.execution_count} executions • Avg: {record.avg_duration_seconds.toFixed(1)}s
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={record.success ? 'badge-success' : 'badge-failed'}>
                        {record.success ? 'Success' : 'Failed'}
                      </Badge>
                      <p className="text-xs text-dark-muted mt-1">
                        {formatDate(record.last_executed, 'PP')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
