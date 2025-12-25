import Head from 'next/head'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Layout from '@/components/layout/Layout'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Spinner from '@/components/common/Spinner'
import { useTarget, useTargets } from '@/hooks/useTargets'
import { isValidUrl, isValidIP } from '@/lib/utils'

const targetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  url_or_ip: z.string().min(1, 'URL or IP is required').refine(
    (val) => isValidUrl(val) || isValidIP(val),
    'Must be a valid URL or IP address'
  ),
  scope: z.enum(['in_scope', 'out_of_scope', 'undefined']),
  risk_tolerance: z.enum(['low', 'medium', 'high', 'critical']),
  owner_approval: z.boolean(),
})

type TargetFormData = z.infer<typeof targetSchema>

export default function EditTargetPage() {
  const router = useRouter()
  const { id } = router.query
  const targetId = id ? parseInt(id as string) : 0

  const { target, isLoading } = useTarget(targetId)
  const { updateTarget } = useTargets()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TargetFormData>({
    resolver: zodResolver(targetSchema),
    values: target ? {
      name: target.name,
      url_or_ip: target.url_or_ip,
      scope: target.scope,
      risk_tolerance: target.risk_tolerance,
      owner_approval: target.owner_approval,
    } : undefined,
  })

  const onSubmit = async (data: TargetFormData) => {
    try {
      await updateTarget(targetId, data)
      router.push(`/targets/${targetId}`)
    } catch (error) {
      console.error('Failed to update target:', error)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Spinner text="Loading target..." />
        </div>
      </Layout>
    )
  }

  if (!target) {
    return (
      <Layout>
        <Card>
          <div className="text-center py-12">
            <p className="text-danger-400">Target not found</p>
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
        <title>Edit {target.name} - AOPTool</title>
      </Head>

      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Edit Target</h1>
          <p className="mt-1 text-dark-muted">
            Update target information
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Target Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                {...register('name')}
                label="Target Name"
                error={errors.name?.message}
                required
              />

              <Input
                {...register('url_or_ip')}
                label="URL or IP Address"
                error={errors.url_or_ip?.message}
                required
              />

              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Scope <span className="text-danger-400">*</span>
                </label>
                <select {...register('scope')} className="input">
                  <option value="undefined">Undefined</option>
                  <option value="in_scope">In Scope</option>
                  <option value="out_of_scope">Out of Scope</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Risk Tolerance <span className="text-danger-400">*</span>
                </label>
                <select {...register('risk_tolerance')} className="input">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  {...register('owner_approval')}
                  type="checkbox"
                  id="owner_approval"
                  className="mt-1 w-4 h-4 rounded border-dark-border bg-dark-card text-primary-600"
                />
                <label htmlFor="owner_approval" className="text-sm font-medium text-dark-text">
                  Owner authorization confirmed
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-dark-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
