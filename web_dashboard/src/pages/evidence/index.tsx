import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Spinner from '@/components/common/Spinner'
import { useEvidence } from '@/hooks/useEvidence'
import { formatDate, formatBytes, copyToClipboard } from '@/lib/utils'
import type { EvidenceType } from '@/types/evidence'
import toast from 'react-hot-toast'

export default function EvidencePage() {
  const router = useRouter()
  const { execution_id } = router.query

  const { evidence, isLoading } = useEvidence({
    execution_id: execution_id ? parseInt(execution_id as string) : undefined,
  })

  const [typeFilter, setTypeFilter] = useState<EvidenceType | 'all'>('all')

  const filteredEvidence = evidence.filter((item) => {
    if (typeFilter === 'all') return true
    return item.evidence_type === typeFilter
  })

  const types = ['all', 'screenshot', 'log', 'pcap', 'exploit_proof', 'file', 'other'] as const

  const handleCopyHash = (hash: string) => {
    copyToClipboard(hash)
    toast.success('Hash copied to clipboard')
  }

  return (
    <Layout>
      <Head>
        <title>Evidence - AOPTool</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Evidence</h1>
          <p className="mt-1 text-dark-muted">
            Browse collected evidence from attack executions
          </p>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-dark-muted">Filter by type:</span>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    typeFilter === type
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-hover text-dark-muted hover:text-dark-text'
                  }`}
                >
                  {type === 'all' ? 'All' : type.replace('_', ' ')}
                </button>
              ))}
            </div>
            <span className="text-sm text-dark-muted ml-auto">
              {filteredEvidence.length} file{filteredEvidence.length !== 1 ? 's' : ''}
            </span>
          </div>
        </Card>

        {/* Evidence List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner text="Loading evidence..." />
          </div>
        ) : filteredEvidence.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-dark-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-dark-text mb-2">No evidence found</h3>
              <p className="text-dark-muted">
                {typeFilter === 'all' ? 'No evidence collected yet' : `No ${typeFilter} evidence`}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvidence.map((item) => (
              <Link key={item.evidence_id} href={`/evidence/${item.evidence_id}`}>
                <Card hover className="h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="capitalize">{item.evidence_type.replace('_', ' ')}</Badge>
                      {item.validated && (
                        <Badge className="badge-success">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Validated
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-dark-text mb-2 font-mono text-sm break-all">
                      {item.file_path.split('/').pop()}
                    </h3>

                    <div className="space-y-2 text-sm text-dark-muted mb-4 flex-1">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Execution #{item.execution_id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                        <span>{formatBytes(item.file_size_bytes)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatDate(item.collected_at, 'PP')}</span>
                      </div>
                    </div>

                    <div
                      className="flex items-center space-x-2 text-xs font-mono text-dark-muted cursor-pointer hover:text-primary-400 transition-colors"
                      onClick={(e) => {
                        e.preventDefault()
                        handleCopyHash(item.hash_sha256)
                      }}
                    >
                      <span className="truncate">{item.hash_sha256.substring(0, 16)}...</span>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
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
