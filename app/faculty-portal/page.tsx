'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, ArrowRight, BookOpen, CheckCircle2, FileCheck, FileSpreadsheet, GraduationCap, HardDrive, Server, Users, Wifi } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

type FacultyWorkspace = {
  faculty: { fullName: string } | null
  stats: {
    pendingGrades: number
    transcriptRequests: number
    degreesToIssue: number
    activeCourses: number
    managedStudents: number
    pendingTransfers: number
  }
  auditLogs: Array<{
    id: string
    action: string
    targetType: string
    targetId: string
    transactionHash: string
    createdAt: string
  }>
}

const quickNavTiles = [
  { title: 'Course Management', description: 'Manage courses, enrollments, and materials', href: '/faculty-portal/courses', icon: BookOpen, color: 'bg-navy-600' },
  { title: 'Grade Entry', description: 'Enter and submit student grades', href: '/faculty-portal/grades', icon: FileSpreadsheet, color: 'bg-gold' },
  { title: 'Degree Issuance', description: 'Issue blockchain-verified degrees', href: '/faculty-portal/degrees', icon: GraduationCap, color: 'bg-navy-700' },
  { title: 'Transcript Approval', description: 'Review and approve transcript requests', href: '/faculty-portal/transcripts', icon: FileCheck, color: 'bg-navy-500' },
  { title: 'Research Data', description: 'Manage research papers and IPFS storage', href: '/faculty-portal/research', icon: HardDrive, color: 'bg-navy-800' },
  { title: 'User Management', description: 'Manage faculty and staff accounts', href: '/faculty-portal/users', icon: Users, color: 'bg-navy-600' },
]

function StatCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  color,
}: {
  title: string
  value: number
  description: string
  trend: string
  icon: React.ElementType
  color: string
}) {
  return (
    <Card className="rounded-[12px] border-navy-100">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-navy-500">{title}</p>
            <p className="mt-2 font-heading text-3xl font-bold text-navy-900">{value}</p>
            <p className="mt-1 text-xs text-navy-400">{description}</p>
          </div>
          <div className={`rounded-lg p-3 ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
        <p className="mt-4 text-xs text-navy-500">{trend}</p>
      </CardContent>
    </Card>
  )
}

function formatAuditAction(action: string) {
  return action
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function DashboardPage() {
  const [data, setData] = useState<FacultyWorkspace | null>(null)

  useEffect(() => {
    let mounted = true

    fetch('/api/faculty/workspace')
      .then((response) => response.json())
      .then((payload: FacultyWorkspace) => {
        if (mounted) setData(payload)
      })
      .catch(() => {
        if (mounted) setData(null)
      })

    return () => {
      mounted = false
    }
  }, [])

  const statCards = [
    {
      title: 'Pending Grades',
      value: data?.stats.pendingGrades ?? 0,
      description: 'Awaiting submission or approval',
      trend: `${data?.stats.activeCourses ?? 0} active courses`,
      icon: FileSpreadsheet,
      color: 'bg-gold',
    },
    {
      title: 'Transcript Requests',
      value: data?.stats.transcriptRequests ?? 0,
      description: 'Student transcript workflows',
      trend: `${data?.stats.pendingTransfers ?? 0} transfer requests in queue`,
      icon: FileCheck,
      color: 'bg-navy-600',
    },
    {
      title: 'Degrees to Issue',
      value: data?.stats.degreesToIssue ?? 0,
      description: 'Eligible candidates ready',
      trend: `${data?.stats.managedStudents ?? 0} managed students`,
      icon: GraduationCap,
      color: 'bg-success',
    },
  ]

  const actionQueue = [
    { id: 'grades', title: 'Submit course grade sheet', deadline: 'Grade registry workflow', href: '/faculty-portal/grades', priority: 'high' },
    { id: 'transcripts', title: 'Review transcript issuance requests', deadline: 'Transcript manager queue', href: '/faculty-portal/transcripts', priority: 'urgent' },
    { id: 'degrees', title: 'Issue eligible degree credentials', deadline: 'Credential issuance batch', href: '/faculty-portal/degrees', priority: 'medium' },
    { id: 'transfers', title: 'Review credit transfer mappings', deadline: 'Cross-institution approvals', href: '/faculty-portal/transfers', priority: 'medium' },
  ]

  const systemHealth = {
    blockchain: 99.9,
    ipfs: 98.5,
    database: 100,
    api: 94.2,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy-900">Dashboard</h1>
        <p className="text-navy-500">
          Welcome back, {data?.faculty?.fullName ?? 'Faculty Member'}. Here&apos;s your live academic workflow overview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-[12px] border-navy-100 lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading text-lg">Action Queue</CardTitle>
                <CardDescription>Tasks requiring your attention</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actionQueue.map((action) => (
                <div key={action.id} className="flex items-center justify-between rounded-lg border border-navy-100 bg-white p-4 hover:bg-navy-50">
                  <div>
                    <p className="font-medium text-navy-900">{action.title}</p>
                    <p className="text-sm text-navy-500">{action.deadline}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={action.priority === 'urgent' ? 'destructive' : 'secondary'}>
                      {action.priority}
                    </Badge>
                    <Button size="sm" variant="ghost" className="text-navy-600" asChild>
                      <Link href={action.href}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading text-lg">Blockchain Activity</CardTitle>
                <CardDescription>Recent audited events</CardDescription>
              </div>
              <Activity className="h-5 w-5 text-navy-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data?.auditLogs ?? []).slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy-900">{formatAuditAction(activity.action)}</p>
                    <p className="text-xs text-navy-500">{activity.targetType}: {activity.targetId}</p>
                    <p className="mt-1 font-mono text-xs text-navy-400">{activity.transactionHash.slice(0, 18)}...</p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-navy-400">
                    {new Date(activity.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 font-heading text-lg font-semibold text-navy-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickNavTiles.map((tile) => (
            <Link key={tile.href} href={tile.href}>
              <Card className="group h-full cursor-pointer rounded-[12px] border-navy-100 transition-all hover:border-navy-300 hover:shadow-md">
                <CardContent className="p-6">
                  <div className={`mb-4 inline-flex rounded-lg p-3 ${tile.color}`}>
                    <tile.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-navy-900 group-hover:text-navy-700">{tile.title}</h3>
                  <p className="mt-1 text-sm text-navy-500">{tile.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card className="rounded-[12px] border-navy-100">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-heading text-lg">System Health</CardTitle>
              <CardDescription>Infrastructure status overview</CardDescription>
            </div>
            <Badge className="border-0 bg-success text-white">Operational</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Blockchain', value: systemHealth.blockchain, icon: Server, tone: 'text-success' },
              { label: 'IPFS Storage', value: systemHealth.ipfs, icon: HardDrive, tone: 'text-success' },
              { label: 'Database', value: systemHealth.database, icon: Users, tone: 'text-success' },
              { label: 'API Gateway', value: systemHealth.api, icon: Wifi, tone: 'text-warning' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-navy-100 p-4">
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-navy-600" />
                  <span className="font-medium text-navy-900">{item.label}</span>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-navy-500">Availability</span>
                    <span className={`font-medium ${item.tone}`}>{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="mt-2 h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
