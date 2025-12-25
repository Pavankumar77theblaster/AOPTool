import Head from 'next/head'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Layout from '@/components/layout/Layout'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { useTargets } from '@/hooks/useTargets'
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

export default function NewTargetPage() {
  const router = useRouter()
  const { createTarget } = useTargets()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<TargetFormData>({
    resolver: zodResolver(targetSchema),
    defaultValues: {
      scope: 'undefined',
      risk_tolerance: 'medium',
      owner_approval: false,
    },
  })

  const onSubmit = async (data: TargetFormData) => {
    try {
      const newTarget = await createTarget(data)
      router.push(`/targets/${newTarget.target_id}`)
    } catch (error) {
      console.error('Failed to create target:', error)
    }
  }

  const urlOrIp = watch('url_or_ip')

  return (
    <Layout>
      <Head>
        <title>New Target - AOPTool</title>
      </Head>

      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Create New Target</h1>
          <p className="mt-1 text-dark-muted">
            Add a new target for penetration testing
          </p>
        </div>

        {/* Warning */}
        <Card className="border-warning-700 bg-warning-950 bg-opacity-20">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-warning-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold text-warning-300">Authorization Required</p>
              <p className="text-sm text-warning-400 mt-1">
                Ensure this target is in your <a href="/settings/whitelist" className="underline hover:text-warning-300">scope whitelist</a> and
                you have written authorization before conducting any testing.
              </p>
            </div>
          </div>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Target Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <Input
                {...register('name')}
                label="Target Name"
                placeholder="Production Web Server"
                error={errors.name?.message}
                helpText="A descriptive name for this target"
                required
              />

              {/* URL or IP */}
              <Input
                {...register('url_or_ip')}
                label="URL or IP Address"
                placeholder="https://example.com or 192.168.1.100"
                error={errors.url_or_ip?.message}
                helpText="The URL or IP address of the target system"
                required
              />

              {/* Scope */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Scope <span className="text-danger-400">*</span>
                </label>
                <select
                  {...register('scope')}
                  className="input"
                >
                  <option value="undefined">Undefined</option>
                  <option value="in_scope">In Scope</option>
                  <option value="out_of_scope">Out of Scope</option>
                </select>
                {errors.scope && (
                  <p className="mt-1 text-sm text-danger-400">{errors.scope.message}</p>
                )}
                <p className="mt-1 text-sm text-dark-muted">
                  Define whether this target is within your authorized testing scope
                </p>
              </div>

              {/* Risk Tolerance */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Risk Tolerance <span className="text-danger-400">*</span>
                </label>
                <select
                  {...register('risk_tolerance')}
                  className="input"
                >
                  <option value="low">Low - Passive reconnaissance only</option>
                  <option value="medium">Medium - Standard vulnerability scanning</option>
                  <option value="high">High - Active exploitation allowed</option>
                  <option value="critical">Critical - Full penetration testing</option>
                </select>
                {errors.risk_tolerance && (
                  <p className="mt-1 text-sm text-danger-400">{errors.risk_tolerance.message}</p>
                )}
                <p className="mt-1 text-sm text-dark-muted">
                  Maximum risk level allowed for attacks against this target
                </p>
              </div>

              {/* Owner Approval */}
              <div className="flex items-start space-x-3">
                <input
                  {...register('owner_approval')}
                  type="checkbox"
                  id="owner_approval"
                  className="mt-1 w-4 h-4 rounded border-dark-border bg-dark-card text-primary-600 focus:ring-primary-500 focus:ring-offset-dark-bg"
                />
                <div className="flex-1">
                  <label htmlFor="owner_approval" className="text-sm font-medium text-dark-text cursor-pointer">
                    I have written authorization from the target owner
                  </label>
                  <p className="text-sm text-dark-muted mt-1">
                    By checking this box, you confirm that you have explicit permission to test this target
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-dark-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Create Target
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
