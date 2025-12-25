import Head from 'next/head'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Layout from '@/components/layout/Layout'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Spinner from '@/components/common/Spinner'
import { useWhitelist } from '@/hooks/useWhitelist'
import { isValidIP, isValidCIDR, isValidDomain, formatDate } from '@/lib/utils'

const whitelistSchema = z.object({
  entry_type: z.enum(['ip', 'cidr', 'domain']),
  value: z.string().min(1, 'Value is required'),
  description: z.string().optional(),
}).refine((data) => {
  if (data.entry_type === 'ip') return isValidIP(data.value)
  if (data.entry_type === 'cidr') return isValidCIDR(data.value)
  if (data.entry_type === 'domain') return isValidDomain(data.value)
  return true
}, {
  message: 'Invalid value for selected type',
  path: ['value'],
})

type WhitelistFormData = z.infer<typeof whitelistSchema>

export default function WhitelistPage() {
  const { whitelist, isLoading, addEntry, removeEntry } = useWhitelist()
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<WhitelistFormData>({
    resolver: zodResolver(whitelistSchema),
    defaultValues: {
      entry_type: 'domain',
    },
  })

  const entryType = watch('entry_type')

  const onSubmit = async (data: WhitelistFormData) => {
    try {
      await addEntry(data)
      reset()
    } catch (error) {
      console.error('Failed to add whitelist entry:', error)
    }
  }

  const handleDelete = async (id: number) => {
    await removeEntry(id)
    setDeleteConfirm(null)
  }

  const groupedEntries = {
    domain: whitelist.filter((e) => e.entry_type === 'domain'),
    ip: whitelist.filter((e) => e.entry_type === 'ip'),
    cidr: whitelist.filter((e) => e.entry_type === 'cidr'),
  }

  return (
    <Layout>
      <Head>
        <title>Scope Whitelist - AOPTool</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Scope Whitelist</h1>
          <p className="mt-1 text-dark-muted">
            Manage authorized targets for penetration testing
          </p>
        </div>

        {/* Warning */}
        <Card className="border-warning-700 bg-warning-950 bg-opacity-20">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-warning-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold text-warning-300">Scope Control</p>
              <p className="text-sm text-warning-400 mt-1">
                Only targets matching whitelist entries can be tested. Ensure you have proper authorization before adding entries.
              </p>
            </div>
          </div>
        </Card>

        {/* Add Entry Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Whitelist Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    Entry Type
                  </label>
                  <select {...register('entry_type')} className="input">
                    <option value="domain">Domain</option>
                    <option value="ip">IP Address</option>
                    <option value="cidr">CIDR Range</option>
                  </select>
                </div>

                <Input
                  {...register('value')}
                  label="Value"
                  placeholder={
                    entryType === 'domain' ? 'example.com' :
                    entryType === 'ip' ? '192.168.1.100' :
                    '192.168.1.0/24'
                  }
                  error={errors.value?.message}
                  required
                />

                <Input
                  {...register('description')}
                  label="Description (Optional)"
                  placeholder="Production server"
                />
              </div>

              <Button type="submit" loading={isSubmitting}>
                Add to Whitelist
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Whitelist Entries */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner text="Loading whitelist..." />
          </div>
        ) : whitelist.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-dark-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="text-lg font-semibold text-dark-text mb-2">No whitelist entries</h3>
              <p className="text-dark-muted">Add your first authorized target above</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Domains */}
            {groupedEntries.domain.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Domains ({groupedEntries.domain.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {groupedEntries.domain.map((entry) => (
                      <div
                        key={entry.whitelist_id}
                        className="flex items-center justify-between p-3 bg-dark-hover rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-dark-text font-mono font-semibold">{entry.value}</p>
                          {entry.description && (
                            <p className="text-sm text-dark-muted mt-1">{entry.description}</p>
                          )}
                          <p className="text-xs text-dark-muted mt-1">
                            Added {formatDate(entry.added_at, 'PPp')}
                          </p>
                        </div>
                        {deleteConfirm === entry.whitelist_id ? (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(entry.whitelist_id)}
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
                            onClick={() => setDeleteConfirm(entry.whitelist_id)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* IP Addresses */}
            {groupedEntries.ip.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>IP Addresses ({groupedEntries.ip.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {groupedEntries.ip.map((entry) => (
                      <div
                        key={entry.whitelist_id}
                        className="flex items-center justify-between p-3 bg-dark-hover rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-dark-text font-mono font-semibold">{entry.value}</p>
                          {entry.description && (
                            <p className="text-sm text-dark-muted mt-1">{entry.description}</p>
                          )}
                          <p className="text-xs text-dark-muted mt-1">
                            Added {formatDate(entry.added_at, 'PPp')}
                          </p>
                        </div>
                        {deleteConfirm === entry.whitelist_id ? (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(entry.whitelist_id)}
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
                            onClick={() => setDeleteConfirm(entry.whitelist_id)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CIDR Ranges */}
            {groupedEntries.cidr.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>CIDR Ranges ({groupedEntries.cidr.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {groupedEntries.cidr.map((entry) => (
                      <div
                        key={entry.whitelist_id}
                        className="flex items-center justify-between p-3 bg-dark-hover rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-dark-text font-mono font-semibold">{entry.value}</p>
                          {entry.description && (
                            <p className="text-sm text-dark-muted mt-1">{entry.description}</p>
                          )}
                          <p className="text-xs text-dark-muted mt-1">
                            Added {formatDate(entry.added_at, 'PPp')}
                          </p>
                        </div>
                        {deleteConfirm === entry.whitelist_id ? (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(entry.whitelist_id)}
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
                            onClick={() => setDeleteConfirm(entry.whitelist_id)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
