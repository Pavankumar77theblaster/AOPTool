import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Spinner from '@/components/common/Spinner'
import { useTarget } from '@/hooks/useTargets'
import { formatDate } from '@/lib/utils'

export default function TargetDetailsPage() {
  const router = useRouter()
  const { id } = router.query
  const targetId = id ? parseInt(id as string) : 0

  const { target, isLoading, error } = useTarget(targetId)

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Spinner text="Loading target..." />
        </div>
      </Layout>
    )
  }

  if (error || !target) {
    return (
      <Layout>
        <Card>
          <div className="text-center py-12">
            <p className="text-danger-400">Failed to load target</p>
            <Button className="mt-4" onClick={() => router.push('/targets')}>
              Back to Targets
            </Button>
          </div>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>{target.name} - Target Details</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-dark-text">{target.name}</h1>
              <Badge variant="risk" value={target.risk_tolerance} className="uppercase">
                {target.risk_tolerance}
              </Badge>
              {target.scope === 'in_scope' && (
                <span className="badge badge-success">In Scope</span>
              )}
            </div>
            <p className="text-dark-muted font-mono">{target.url_or_ip}</p>
          </div>

          <div className="flex items-center space-x-3">
            <Link href={`/targets/${target.target_id}/edit`}>
              <Button variant="outline">Edit Target</Button>
            </Link>
            <Link href={`/plans/new?target_id=${target.target_id}`}>
              <Button>Create Attack Plan</Button>
            </Link>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-dark-muted">Target ID</dt>
                  <dd className="mt-1 text-dark-text font-mono">#{target.target_id}</dd>
                </div>
                <div>
                  <dt className="text-sm text-dark-muted">URL / IP Address</dt>
                  <dd className="mt-1 text-dark-text font-mono break-all">{target.url_or_ip}</dd>
                </div>
                <div>
                  <dt className="text-sm text-dark-muted">Scope Status</dt>
                  <dd className="mt-1">
                    {target.scope === 'in_scope' && (
                      <Badge className="badge-success">In Scope</Badge>
                    )}
                    {target.scope === 'out_of_scope' && (
                      <Badge className="bg-dark-muted text-dark-text">Out of Scope</Badge>
                    )}
                    {target.scope === 'undefined' && (
                      <Badge className="bg-warning-900 text-warning-300">Undefined</Badge>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-dark-muted">Risk Tolerance</dt>
                  <dd className="mt-1">
                    <Badge variant="risk" value={target.risk_tolerance} className="uppercase">
                      {target.risk_tolerance}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-dark-muted">Owner Approval</dt>
                  <dd className="mt-1">
                    {target.owner_approval ? (
                      <span className="flex items-center text-success-400">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Approved
                      </span>
                    ) : (
                      <span className="flex items-center text-danger-400">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Not Approved
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-dark-muted">Created At</dt>
                  <dd className="mt-1 text-dark-text">{formatDate(target.created_at)}</dd>
                </div>
                {target.updated_at && (
                  <div>
                    <dt className="text-sm text-dark-muted">Last Updated</dt>
                    <dd className="mt-1 text-dark-text">{formatDate(target.updated_at)}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Metadata */}
        {target.metadata && Object.keys(target.metadata).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="code-block text-xs">
                {JSON.stringify(target.metadata, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href={`/plans/new?target_id=${target.target_id}`}
                className="p-4 bg-dark-hover hover:bg-primary-900 hover:border-primary-700 border border-dark-border rounded-lg transition-all group"
              >
                <div className="text-primary-400 group-hover:text-primary-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="mt-2 font-medium text-dark-text">New Attack Plan</p>
                <p className="text-sm text-dark-muted">Create AI-powered attack sequence</p>
              </Link>

              <Link
                href={`/executions?target_id=${target.target_id}`}
                className="p-4 bg-dark-hover hover:bg-primary-900 hover:border-primary-700 border border-dark-border rounded-lg transition-all group"
              >
                <div className="text-primary-400 group-hover:text-primary-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="mt-2 font-medium text-dark-text">View Executions</p>
                <p className="text-sm text-dark-muted">See attack execution history</p>
              </Link>

              <Link
                href={`/evidence?target_id=${target.target_id}`}
                className="p-4 bg-dark-hover hover:bg-primary-900 hover:border-primary-700 border border-dark-border rounded-lg transition-all group"
              >
                <div className="text-primary-400 group-hover:text-primary-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="mt-2 font-medium text-dark-text">Browse Evidence</p>
                <p className="text-sm text-dark-muted">View collected evidence files</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
