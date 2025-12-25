import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import Layout from '@/components/layout/Layout'
import Card from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Spinner from '@/components/common/Spinner'
import { useAttacks } from '@/hooks/useAttacks'
import type { AttackCategory, RiskLevel } from '@/types/attack'

export default function AttacksPage() {
  const { attacks, count, isLoading } = useAttacks()
  const [categoryFilter, setCategoryFilter] = useState<AttackCategory | 'all'>('all')
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all')

  const filteredAttacks = attacks.filter((attack) => {
    if (categoryFilter !== 'all' && attack.category !== categoryFilter) return false
    if (riskFilter !== 'all' && attack.risk_level !== riskFilter) return false
    return true
  })

  const categories = ['all', 'recon', 'scanning', 'exploitation', 'post_exploitation'] as const
  const riskLevels = ['all', 'low', 'medium', 'high', 'critical'] as const

  return (
    <Layout>
      <Head>
        <title>Attack Library - AOPTool</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Attack Library</h1>
          <p className="mt-1 text-dark-muted">
            Browse {count} available attack techniques
          </p>
        </div>

        {/* Filters */}
        <Card>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-dark-muted mb-2 block">Filter by category:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      categoryFilter === category
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-hover text-dark-muted hover:text-dark-text'
                    }`}
                  >
                    {category === 'all' ? 'All' : category.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm text-dark-muted mb-2 block">Filter by risk level:</span>
              <div className="flex flex-wrap gap-2">
                {riskLevels.map((risk) => (
                  <button
                    key={risk}
                    onClick={() => setRiskFilter(risk)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      riskFilter === risk
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-hover text-dark-muted hover:text-dark-text'
                    }`}
                  >
                    {risk === 'all' ? 'All' : risk}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-sm text-dark-muted pt-2 border-t border-dark-border">
              Showing {filteredAttacks.length} of {count} attacks
            </div>
          </div>
        </Card>

        {/* Attacks Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner text="Loading attacks..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAttacks.map((attack) => (
              <Link key={attack.attack_id} href={`/attacks/${attack.attack_id}`}>
                <Card hover className="h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-dark-text hover:text-primary-400 transition-colors flex-1">
                        {attack.name}
                      </h3>
                      <Badge variant="risk" value={attack.risk_level} className="ml-2">
                        {attack.risk_level}
                      </Badge>
                    </div>

                    <p className="text-sm text-dark-muted mb-4 flex-1 line-clamp-3">
                      {attack.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-dark-muted pt-3 border-t border-dark-border">
                      <span className="badge bg-dark-hover capitalize">
                        {attack.category.replace('_', ' ')}
                      </span>
                      <span className="font-mono">{attack.tool_name}</span>
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
