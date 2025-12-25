import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Spinner from '@/components/common/Spinner'
import { usePlan, usePlans } from '@/hooks/usePlans'
import { useTarget } from '@/hooks/useTargets'
import { useAttacks } from '@/hooks/useAttacks'
import { formatDate } from '@/lib/utils'

export default function PlanDetailsPage() {
  const router = useRouter()
  const { id } = router.query
  const planId = id ? parseInt(id as string) : 0

  const { plan, isLoading, error } = usePlan(planId)
  const { target } = useTarget(plan?.target_id || 0)
  const { attacks } = useAttacks()
  const { approvePlan, cancelPlan } = usePlans()

  const [approving, setApproving] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const handleApprove = async () => {
    try {
      setApproving(true)
      await approvePlan(planId)
    } finally {
      setApproving(false)
    }
  }

  const handleCancel = async () => {
    try {
      setCancelling(true)
      await cancelPlan(planId)
    } finally {
      setCancelling(false)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Spinner text="Loading plan..." />
        </div>
      </Layout>
    )
  }

  if (error || !plan) {
    return (
      <Layout>
        <Card>
          <div className="text-center py-12">
            <p className="text-danger-400">Failed to load plan</p>
            <Button className="mt-4" onClick={() => router.push('/plans')}>
              Back to Plans
            </Button>
          </div>
        </Card>
      </Layout>
    )
  }

  const planAttacks = attacks.filter((a) => plan.attack_sequence.includes(a.attack_id))

  return (
    <Layout>
      <Head>
        <title>Plan #{plan.plan_id} - Attack Plan Details</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-dark-text">Attack Plan #{plan.plan_id}</h1>
              <Badge variant="plan" value={plan.status} className="uppercase">
                {plan.status}
              </Badge>
              <Badge variant="risk" value={plan.max_risk_level} className="uppercase">
                Max: {plan.max_risk_level}
              </Badge>
            </div>
            {target && (
              <p className="text-dark-muted">
                Target: <span className="font-semibold">{target.name}</span> ({target.url_or_ip})
              </p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {plan.status === 'pending' && (
              <Button onClick={handleApprove} loading={approving}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Approve & Execute
              </Button>
            )}
            {plan.status === 'running' && (
              <Button variant="danger" onClick={handleCancel} loading={cancelling}>
                Cancel Execution
              </Button>
            )}
            {plan.status === 'approved' || plan.status === 'running' ? (
              <Link href={`/executions?plan_id=${plan.plan_id}`}>
                <Button variant="outline">View Executions</Button>
              </Link>
            ) : null}
          </div>
        </div>

        {/* AI Metadata */}
        {plan.metadata?.ai_generated && (
          <Card className="border-primary-700 bg-primary-950 bg-opacity-20">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-primary-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-primary-300">AI-Generated Plan</p>
                  <Badge className="bg-primary-900 text-primary-300">{plan.metadata.ai_model}</Badge>
                </div>
                <p className="text-sm text-primary-400">{plan.metadata.reasoning}</p>
                {plan.metadata.estimated_duration && (
                  <p className="text-sm text-primary-400 mt-2">
                    Estimated duration: {plan.metadata.estimated_duration} minutes
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plan Info */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-dark-muted">Plan ID</dt>
                  <dd className="mt-1 text-dark-text font-mono">#{plan.plan_id}</dd>
                </div>
                <div>
                  <dt className="text-sm text-dark-muted">Target</dt>
                  <dd className="mt-1">
                    {target ? (
                      <Link href={`/targets/${target.target_id}`} className="text-primary-400 hover:text-primary-300">
                        {target.name}
                      </Link>
                    ) : (
                      `Target #${plan.target_id}`
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-dark-muted">Scheduling</dt>
                  <dd className="mt-1 text-dark-text capitalize">{plan.scheduling.replace('_', ' ')}</dd>
                </div>
                <div>
                  <dt className="text-sm text-dark-muted">Max Risk Level</dt>
                  <dd className="mt-1">
                    <Badge variant="risk" value={plan.max_risk_level}>
                      {plan.max_risk_level}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-dark-muted">Stop on Failure</dt>
                  <dd className="mt-1 text-dark-text">{plan.stop_on_failure ? 'Yes' : 'No'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-dark-muted">Created</dt>
                  <dd className="mt-1 text-dark-text">{formatDate(plan.created_at)}</dd>
                  {plan.created_by && (
                    <dd className="text-sm text-dark-muted">by {plan.created_by}</dd>
                  )}
                </div>
                {plan.approved_at && (
                  <div>
                    <dt className="text-sm text-dark-muted">Approved</dt>
                    <dd className="mt-1 text-dark-text">{formatDate(plan.approved_at)}</dd>
                    {plan.approved_by && (
                      <dd className="text-sm text-dark-muted">by {plan.approved_by}</dd>
                    )}
                  </div>
                )}
                {plan.started_at && (
                  <div>
                    <dt className="text-sm text-dark-muted">Started</dt>
                    <dd className="mt-1 text-dark-text">{formatDate(plan.started_at)}</dd>
                  </div>
                )}
                {plan.completed_at && (
                  <div>
                    <dt className="text-sm text-dark-muted">Completed</dt>
                    <dd className="mt-1 text-dark-text">{formatDate(plan.completed_at)}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Attack Sequence */}
        <Card>
          <CardHeader>
            <CardTitle>Attack Sequence ({plan.attack_sequence.length} attacks)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {plan.attack_sequence.map((attackId, index) => {
                const attack = planAttacks.find((a) => a.attack_id === attackId)
                return attack ? (
                  <div
                    key={attackId}
                    className="flex items-center space-x-4 p-4 bg-dark-hover rounded-lg"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center text-primary-300 font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <Link href={`/attacks/${attack.attack_id}`}>
                        <h4 className="font-semibold text-dark-text hover:text-primary-400 transition-colors">
                          {attack.name}
                        </h4>
                      </Link>
                      <p className="text-sm text-dark-muted">{attack.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="badge capitalize text-xs">
                          {attack.category.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-dark-muted font-mono">{attack.tool_name}</span>
                      </div>
                    </div>
                    <Badge variant="risk" value={attack.risk_level}>
                      {attack.risk_level}
                    </Badge>
                  </div>
                ) : (
                  <div key={attackId} className="p-4 bg-dark-hover rounded-lg text-dark-muted">
                    Attack #{attackId} (not found)
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {plan.error_message && (
          <Card className="border-danger-700 bg-danger-950 bg-opacity-20">
            <CardHeader>
              <CardTitle className="text-danger-300">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-danger-400 whitespace-pre-wrap">
                {plan.error_message}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
