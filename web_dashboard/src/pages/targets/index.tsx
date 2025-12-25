import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Spinner from '@/components/common/Spinner'
import { useTargets } from '@/hooks/useTargets'
import { formatDate } from '@/lib/utils'
import type { Target } from '@/types/target'

export default function TargetsPage() {
  const { targets, isLoading, deleteTarget } = useTargets()
  const [scopeFilter, setScopeFilter] = useState<string>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const filteredTargets = targets.filter((target) => {
    if (scopeFilter === 'all') return true
    return target.scope === scopeFilter
  })

  const handleDelete = async (id: number) => {
    await deleteTarget(id)
    setDeleteConfirm(null)
  }

  return (
    <Layout>
      <Head>
        <title>Targets - AOPTool</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dark-text">Targets</h1>
            <p className="mt-1 text-dark-muted">
              Manage your penetration testing targets
            </p>
          </div>
          <Link href="/targets/new">
            <Button>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Target
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-dark-muted">Filter by scope:</span>
            <div className="flex space-x-2">
              {['all', 'in_scope', 'out_of_scope', 'undefined'].map((scope) => (
                <button
                  key={scope}
                  onClick={() => setScopeFilter(scope)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    scopeFilter === scope
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-hover text-dark-muted hover:text-dark-text'
                  }`}
                >
                  {scope === 'all' ? 'All' : scope.replace('_', ' ')}
                </button>
              ))}
            </div>
            <span className="text-sm text-dark-muted ml-auto">
              {filteredTargets.length} target{filteredTargets.length !== 1 ? 's' : ''}
            </span>
          </div>
        </Card>

        {/* Targets List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner text="Loading targets..." />
          </div>
        ) : filteredTargets.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-dark-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-semibold text-dark-text mb-2">No targets found</h3>
              <p className="text-dark-muted mb-4">
                {scopeFilter === 'all' ? 'Get started by creating your first target' : `No targets with scope: ${scopeFilter}`}
              </p>
              <Link href="/targets/new">
                <Button>Create Target</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTargets.map((target) => (
              <Card key={target.target_id} hover>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Link href={`/targets/${target.target_id}`}>
                        <h3 className="text-lg font-semibold text-dark-text hover:text-primary-400 transition-colors">
                          {target.name}
                        </h3>
                      </Link>
                      <Badge
                        variant="risk"
                        value={target.risk_tolerance}
                        className="uppercase text-xs"
                      >
                        {target.risk_tolerance}
                      </Badge>
                      {target.scope === 'in_scope' && (
                        <span className="badge badge-success">In Scope</span>
                      )}
                      {target.scope === 'out_of_scope' && (
                        <span className="badge bg-dark-muted text-dark-text">Out of Scope</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-dark-muted">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <span className="font-mono">{target.url_or_ip}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Created {formatDate(target.created_at, 'PP')}</span>
                      </div>
                      {target.owner_approval && (
                        <div className="flex items-center space-x-2 text-success-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Approved</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link href={`/targets/${target.target_id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    {deleteConfirm === target.target_id ? (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(target.target_id)}
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
                        onClick={() => setDeleteConfirm(target.target_id)}
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
