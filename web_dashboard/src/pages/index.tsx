import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import Layout from '@/components/layout/Layout'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import Badge from '@/components/common/Badge'
import Spinner from '@/components/common/Spinner'
import VulnerabilityDonutChart from '@/components/dashboard/VulnerabilityDonutChart'
import TerminalActivityFeed from '@/components/dashboard/TerminalActivityFeed'
import ResourceUtilization from '@/components/dashboard/ResourceUtilization'
import { getControlPlaneHealth, getIntelligencePlaneHealth, getDashboardStats } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'

export default function Dashboard() {
  const { data: controlHealth, error: controlError } = useSWR(
    'controlHealth',
    getControlPlaneHealth,
    { refreshInterval: 10000 }
  )

  const { data: intelligenceHealth, error: intelligenceError } = useSWR(
    'intelligenceHealth',
    getIntelligencePlaneHealth,
    { refreshInterval: 10000 }
  )

  const { data: stats, error: statsError, isLoading } = useSWR(
    'dashboardStats',
    getDashboardStats,
    { refreshInterval: 10000 }
  )

  return (
    <Layout>
      <Head>
        <title>Dashboard - AOPTool</title>
        <meta name="description" content="AOPTool Dashboard" />
      </Head>

      <div className="space-y-6 fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Dashboard</h1>
          <p className="mt-1 text-dark-muted">
            Overview of your penetration testing operations
          </p>
        </div>

        {/* System Health & Resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-muted">Control Plane</p>
                <p className="text-2xl font-semibold text-dark-text mt-1">
                  {controlError ? (
                    <span className="text-danger-400">Offline</span>
                  ) : controlHealth?.status === 'healthy' ? (
                    <span className="text-success-400">Healthy</span>
                  ) : (
                    <Spinner size="sm" />
                  )}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                controlError ? 'bg-danger-900' : 'bg-success-900'
              }`}>
                <svg className={`w-6 h-6 ${
                  controlError ? 'text-danger-400' : 'text-success-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-muted">Intelligence Plane</p>
                <p className="text-2xl font-semibold text-dark-text mt-1">
                  {intelligenceError ? (
                    <span className="text-danger-400">Offline</span>
                  ) : intelligenceHealth?.status === 'healthy' ? (
                    <span className="text-success-400">Healthy</span>
                  ) : (
                    <Spinner size="sm" />
                  )}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                intelligenceError ? 'bg-danger-900' : 'bg-primary-900'
              }`}>
                <svg className={`w-6 h-6 ${
                  intelligenceError ? 'text-danger-400' : 'text-primary-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card>
            <ResourceUtilization />
          </Card>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner text="Loading dashboard..." />
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <p className="text-sm text-dark-muted">Total Targets</p>
                <p className="text-3xl font-bold text-dark-text mt-2">{stats.total_targets}</p>
                <Link href="/targets" className="text-sm text-primary-400 hover:text-primary-300 mt-2 inline-block">
                  View all →
                </Link>
              </Card>

              <Card>
                <p className="text-sm text-dark-muted">Attack Plans</p>
                <p className="text-3xl font-bold text-dark-text mt-2">{stats.total_plans}</p>
                <Link href="/plans" className="text-sm text-primary-400 hover:text-primary-300 mt-2 inline-block">
                  View all →
                </Link>
              </Card>

              <Card>
                <p className="text-sm text-dark-muted">Active Executions</p>
                <p className="text-3xl font-bold text-dark-text mt-2">{stats.active_executions}</p>
                <Link href="/executions" className="text-sm text-primary-400 hover:text-primary-300 mt-2 inline-block">
                  Monitor →
                </Link>
              </Card>

              <Card>
                <p className="text-sm text-dark-muted">Evidence Collected</p>
                <p className="text-3xl font-bold text-dark-text mt-2">{stats.total_evidence}</p>
                <Link href="/evidence" className="text-sm text-primary-400 hover:text-primary-300 mt-2 inline-block">
                  Browse →
                </Link>
              </Card>
            </div>

            {/* Recent Executions and Vulnerability Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Executions</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recent_executions && stats.recent_executions.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recent_executions.map((execution) => (
                        <div
                          key={execution.execution_id}
                          className="flex items-center justify-between p-3 bg-dark-hover rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="text-dark-text font-medium">{execution.attack_name}</p>
                            <p className="text-sm text-dark-muted">{execution.target_name}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant="execution" value={execution.status as any}>
                              {execution.status}
                            </Badge>
                            <span className="text-sm text-dark-muted">
                              {formatRelativeTime(execution.started_at)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-dark-muted">No executions yet</p>
                      <Link
                        href="/plans/new"
                        className="text-primary-400 hover:text-primary-300 text-sm mt-2 inline-block"
                      >
                        Create your first attack plan →
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vulnerability Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <VulnerabilityDonutChart
                      critical={3}
                      high={8}
                      medium={15}
                      low={12}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Terminal Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Live Activity Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <TerminalActivityFeed />
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <p className="text-center text-danger-400">Failed to load dashboard stats</p>
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
                href="/targets/new"
                className="p-4 bg-dark-hover hover:bg-primary-900 hover:border-primary-700 border border-dark-border rounded-lg transition-all group"
              >
                <div className="text-primary-400 group-hover:text-primary-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="mt-2 font-medium text-dark-text">New Target</p>
                <p className="text-sm text-dark-muted">Add a new pentesting target</p>
              </Link>

              <Link
                href="/plans/new"
                className="p-4 bg-dark-hover hover:bg-primary-900 hover:border-primary-700 border border-dark-border rounded-lg transition-all group"
              >
                <div className="text-primary-400 group-hover:text-primary-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="mt-2 font-medium text-dark-text">Create Plan</p>
                <p className="text-sm text-dark-muted">Generate AI-powered attack plan</p>
              </Link>

              <Link
                href="/executions/monitor"
                className="p-4 bg-dark-hover hover:bg-primary-900 hover:border-primary-700 border border-dark-border rounded-lg transition-all group"
              >
                <div className="text-primary-400 group-hover:text-primary-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <p className="mt-2 font-medium text-dark-text">Monitor</p>
                <p className="text-sm text-dark-muted">View live execution status</p>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Warning */}
        <Card className="border-warning-700 bg-warning-950 bg-opacity-20">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-warning-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold text-warning-300">Authorized Use Only</p>
              <p className="text-sm text-warning-400 mt-1">
                This tool is for authorized security testing only. Ensure you have proper permissions before conducting any penetration tests.
                All activities are logged and monitored.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
