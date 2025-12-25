import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Spinner from '@/components/common/Spinner'
import { useEvidenceItem } from '@/hooks/useEvidence'
import { formatDate, formatBytes, copyToClipboard } from '@/lib/utils'
import { getEvidenceDownloadUrl } from '@/lib/api'
import toast from 'react-hot-toast'

export default function EvidenceDetailsPage() {
  const router = useRouter()
  const { id } = router.query
  const evidenceId = id ? parseInt(id as string) : 0

  const { evidenceItem, isLoading, error } = useEvidenceItem(evidenceId)

  const handleCopyHash = () => {
    if (evidenceItem) {
      copyToClipboard(evidenceItem.hash_sha256)
      toast.success('Hash copied to clipboard')
    }
  }

  const handleDownload = () => {
    if (evidenceItem) {
      const url = getEvidenceDownloadUrl(evidenceItem.evidence_id)
      window.open(url, '_blank')
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Spinner text="Loading evidence..." />
        </div>
      </Layout>
    )
  }

  if (error || !evidenceItem) {
    return (
      <Layout>
        <Card>
          <div className="text-center py-12">
            <p className="text-danger-400">Failed to load evidence</p>
            <Button className="mt-4" onClick={() => router.push('/evidence')}>
              Back to Evidence
            </Button>
          </div>
        </Card>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head>
        <title>Evidence #{evidenceItem.evidence_id} - Details</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-dark-text">Evidence #{evidenceItem.evidence_id}</h1>
              <Badge className="capitalize">{evidenceItem.evidence_type.replace('_', ' ')}</Badge>
              {evidenceItem.validated && (
                <Badge className="badge-success">Validated</Badge>
              )}
            </div>
            <p className="text-dark-muted font-mono">{evidenceItem.file_path}</p>
          </div>

          <div className="flex items-center space-x-3">
            <Link href={`/executions/${evidenceItem.execution_id}`}>
              <Button variant="outline">View Execution</Button>
            </Link>
            <Button onClick={handleDownload}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </Button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>File Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-dark-muted">Evidence ID</dt>
                  <dd className="mt-1 text-dark-text font-mono">#{evidenceItem.evidence_id}</dd>
                </div>
                <div>
                  <dt className="text-sm text-dark-muted">File Path</dt>
                  <dd className="mt-1 text-dark-text font-mono break-all">{evidenceItem.file_path}</dd>
                </div>
                <div>
                  <dt className="text-sm text-dark-muted">File Size</dt>
                  <dd className="mt-1 text-dark-text">{formatBytes(evidenceItem.file_size_bytes)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-dark-muted">Evidence Type</dt>
                  <dd className="mt-1">
                    <Badge className="capitalize">{evidenceItem.evidence_type.replace('_', ' ')}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-dark-muted">Validation Status</dt>
                  <dd className="mt-1">
                    {evidenceItem.validated ? (
                      <Badge className="badge-success">Validated</Badge>
                    ) : (
                      <Badge className="bg-warning-900 text-warning-300">Not Validated</Badge>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-dark-muted">Execution ID</dt>
                  <dd className="mt-1">
                    <Link href={`/executions/${evidenceItem.execution_id}`} className="text-primary-400 hover:text-primary-300">
                      #{evidenceItem.execution_id}
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-dark-muted">Collected At</dt>
                  <dd className="mt-1 text-dark-text">{formatDate(evidenceItem.collected_at)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-dark-muted">SHA-256 Hash</dt>
                  <dd className="mt-1">
                    <div className="flex items-center space-x-2">
                      <code className="text-xs font-mono text-dark-text break-all">
                        {evidenceItem.hash_sha256}
                      </code>
                      <button
                        onClick={handleCopyHash}
                        className="p-1 hover:bg-dark-hover rounded transition-colors flex-shrink-0"
                      >
                        <svg className="w-4 h-4 text-dark-muted hover:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metadata */}
        {evidenceItem.metadata && Object.keys(evidenceItem.metadata).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="code-block text-xs">
                {JSON.stringify(evidenceItem.metadata, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
