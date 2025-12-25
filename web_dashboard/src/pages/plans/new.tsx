import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Layout from '@/components/layout/Layout'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { usePlans } from '@/hooks/usePlans'
import { useTargets } from '@/hooks/useTargets'
import { useAttacks } from '@/hooks/useAttacks'
import { translateNaturalLanguage } from '@/lib/api'
import type { TranslateResponse } from '@/types/plan'
import toast from 'react-hot-toast'

const aiPlanSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  target_id: z.number().min(1, 'Target is required'),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']),
})

type AIPlanFormData = z.infer<typeof aiPlanSchema>

export default function NewPlanPage() {
  const router = useRouter()
  const { target_id } = router.query
  const { targets } = useTargets()
  const { attacks } = useAttacks()
  const { createPlan } = usePlans()

  const [aiResult, setAiResult] = useState<TranslateResponse | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AIPlanFormData>({
    resolver: zodResolver(aiPlanSchema),
    defaultValues: {
      target_id: target_id ? parseInt(target_id as string) : undefined,
      risk_level: 'medium',
    },
  })

  const selectedTargetId = watch('target_id')

  const onGeneratePlan = async (data: AIPlanFormData) => {
    try {
      setIsGenerating(true)
      const result = await translateNaturalLanguage({
        description: data.description,
        target_id: data.target_id,
        risk_level: data.risk_level,
      })
      setAiResult(result)
      toast.success('AI attack plan generated!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate plan')
    } finally {
      setIsGenerating(false)
    }
  }

  const onCreatePlan = async () => {
    if (!aiResult || !selectedTargetId) return

    try {
      const newPlan = await createPlan({
        target_id: selectedTargetId,
        attack_sequence: aiResult.attack_sequence,
        scheduling: 'manual_trigger',
        max_risk_level: aiResult.risk_assessment,
        metadata: {
          ai_generated: true,
          ai_model: aiResult.ai_model,
          reasoning: aiResult.reasoning,
          estimated_duration: aiResult.estimated_duration_minutes,
        },
      })
      router.push(`/plans/${newPlan.plan_id}`)
    } catch (error) {
      console.error('Failed to create plan:', error)
    }
  }

  return (
    <Layout>
      <Head>
        <title>Create Attack Plan - AOPTool</title>
      </Head>

      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Create Attack Plan</h1>
          <p className="mt-1 text-dark-muted">
            Use AI to generate an optimized attack sequence
          </p>
        </div>

        {/* AI Info */}
        <Card className="border-primary-700 bg-primary-950 bg-opacity-20">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-primary-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <p className="font-semibold text-primary-300">AI-Powered Planning</p>
              <p className="text-sm text-primary-400 mt-1">
                Describe your testing objectives in natural language, and AI will generate an optimized attack sequence from our library of 30 techniques.
              </p>
            </div>
          </div>
        </Card>

        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Attack Planning</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onGeneratePlan)} className="space-y-6">
              {/* Target Selection */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Target <span className="text-danger-400">*</span>
                </label>
                <select
                  {...register('target_id', { valueAsNumber: true })}
                  className="input"
                  disabled={!!target_id}
                >
                  <option value="">Select a target...</option>
                  {targets.map((target) => (
                    <option key={target.target_id} value={target.target_id}>
                      {target.name} ({target.url_or_ip})
                    </option>
                  ))}
                </select>
                {errors.target_id && (
                  <p className="mt-1 text-sm text-danger-400">{errors.target_id.message}</p>
                )}
              </div>

              {/* Natural Language Description */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Attack Description <span className="text-danger-400">*</span>
                </label>
                <textarea
                  {...register('description')}
                  rows={6}
                  className="input resize-none"
                  placeholder="Describe what you want to test. For example:&#10;&#10;- 'Scan for web vulnerabilities and security headers'&#10;- 'Perform comprehensive reconnaissance and identify attack surface'&#10;- 'Test for SQL injection and cross-site scripting vulnerabilities'&#10;- 'Scan for WordPress vulnerabilities and enumerate plugins'"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-danger-400">{errors.description.message}</p>
                )}
                <p className="mt-1 text-sm text-dark-muted">
                  Be specific about your testing objectives. The AI will select appropriate attacks.
                </p>
              </div>

              {/* Risk Level */}
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Maximum Risk Level <span className="text-danger-400">*</span>
                </label>
                <select {...register('risk_level')} className="input">
                  <option value="low">Low - Passive reconnaissance only</option>
                  <option value="medium">Medium - Standard vulnerability scanning</option>
                  <option value="high">High - Active exploitation allowed</option>
                  <option value="critical">Critical - Full penetration testing</option>
                </select>
                <p className="mt-1 text-sm text-dark-muted">
                  AI will only suggest attacks at or below this risk level
                </p>
              </div>

              {/* Generate Button */}
              <Button type="submit" loading={isGenerating} className="w-full">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Attack Plan with AI
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* AI Result */}
        {aiResult && (
          <div className="space-y-6 fade-in">
            {/* Reasoning */}
            <Card className="border-success-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI Analysis</CardTitle>
                  <Badge className="bg-success-900 text-success-300 border-success-700">
                    {aiResult.ai_model}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-dark-text">{aiResult.reasoning}</p>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-dark-border">
                  <div>
                    <p className="text-sm text-dark-muted">Estimated Duration</p>
                    <p className="text-lg font-semibold text-dark-text mt-1">
                      {aiResult.estimated_duration_minutes} minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-muted">Risk Assessment</p>
                    <Badge variant="risk" value={aiResult.risk_assessment} className="mt-1 uppercase">
                      {aiResult.risk_assessment}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attack Sequence */}
            <Card>
              <CardHeader>
                <CardTitle>Attack Sequence ({aiResult.attack_sequence.length} attacks)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiResult.attack_sequence.map((attackId, index) => {
                    const attack = attacks.find((a) => a.attack_id === attackId)
                    return attack ? (
                      <div
                        key={attackId}
                        className="flex items-center space-x-4 p-4 bg-dark-hover rounded-lg"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center text-primary-300 font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-dark-text">{attack.name}</h4>
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
                    ) : null
                  })}
                </div>

                <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-dark-border">
                  <Button variant="outline" onClick={() => setAiResult(null)}>
                    Regenerate
                  </Button>
                  <Button onClick={onCreatePlan}>
                    Create This Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}
