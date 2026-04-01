'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  FileSpreadsheet,
  FileCheck,
  GraduationCap,
  BookOpen,
  Database,
  Users,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Server,
  HardDrive,
  Cpu,
  Wifi,
} from 'lucide-react'
import Link from 'next/link'

// Stat Cards Data
const statCards = [
  {
    title: 'Pending Grades',
    value: 47,
    description: 'Awaiting submission',
    icon: FileSpreadsheet,
    trend: '+12 from last week',
    color: 'bg-gold',
  },
  {
    title: 'Transcript Requests',
    value: 23,
    description: 'Pending approval',
    icon: FileCheck,
    trend: '5 urgent',
    color: 'bg-navy-600',
  },
  {
    title: 'Degrees to Issue',
    value: 156,
    description: 'Ready for issuance',
    icon: GraduationCap,
    trend: 'Spring 2026 batch',
    color: 'bg-success',
  },
]

// Action Queue Data
const actionQueue = [
  {
    id: 1,
    type: 'grade',
    title: 'Submit CS301 Final Grades',
    deadline: 'Due in 2 days',
    priority: 'high',
  },
  {
    id: 2,
    type: 'transcript',
    title: 'Review transcript for John Smith',
    deadline: 'Due today',
    priority: 'urgent',
  },
  {
    id: 3,
    type: 'degree',
    title: 'Sign degree certificates batch #45',
    deadline: 'Due in 5 days',
    priority: 'medium',
  },
  {
    id: 4,
    type: 'grade',
    title: 'Verify MATH201 grade corrections',
    deadline: 'Due in 3 days',
    priority: 'medium',
  },
]

// Recent Blockchain Activity
const recentActivity = [
  {
    id: 1,
    action: 'Transcript Issued',
    student: 'Alice Johnson',
    txHash: '0x7f9e...3c4d',
    time: '5 min ago',
    status: 'confirmed',
  },
  {
    id: 2,
    action: 'Grade Recorded',
    student: 'Bob Wilson',
    txHash: '0x2a8b...9f1e',
    time: '12 min ago',
    status: 'confirmed',
  },
  {
    id: 3,
    action: 'Degree Minted',
    student: 'Carol Davis',
    txHash: '0x5c3d...7a2b',
    time: '1 hour ago',
    status: 'confirmed',
  },
  {
    id: 4,
    action: 'Credit Transfer',
    student: 'David Lee',
    txHash: '0x8e1f...4d5c',
    time: '2 hours ago',
    status: 'pending',
  },
]

// Quick Navigation Tiles
const quickNavTiles = [
  {
    title: 'Course Management',
    description: 'Manage courses, enrollments, and materials',
    icon: BookOpen,
    href: '/faculty-portal/courses',
    color: 'bg-navy-600',
  },
  {
    title: 'Grade Entry',
    description: 'Enter and submit student grades',
    icon: FileSpreadsheet,
    href: '/faculty-portal/grades',
    color: 'bg-gold',
  },
  {
    title: 'Degree Issuance',
    description: 'Issue blockchain-verified degrees',
    icon: GraduationCap,
    href: '/faculty-portal/degrees',
    color: 'bg-navy-700',
  },
  {
    title: 'Transcript Approval',
    description: 'Review and approve transcript requests',
    icon: FileCheck,
    href: '/faculty-portal/transcripts',
    color: 'bg-navy-500',
  },
  {
    title: 'Research Data',
    description: 'Manage research papers and IPFS storage',
    icon: Database,
    href: '/faculty-portal/research',
    color: 'bg-navy-800',
  },
  {
    title: 'User Management',
    description: 'Manage faculty and staff accounts',
    icon: Users,
    href: '/faculty-portal/users',
    color: 'bg-navy-600',
  },
]

// System Health Data (Admin only)
const systemHealth = {
  blockchain: { status: 'healthy', value: 99.9 },
  ipfs: { status: 'healthy', value: 98.5 },
  database: { status: 'healthy', value: 100 },
  api: { status: 'warning', value: 94.2 },
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'urgent':
      return <Badge className="bg-destructive text-white border-0">Urgent</Badge>
    case 'high':
      return <Badge className="bg-gold text-navy-900 border-0">High</Badge>
    case 'medium':
      return <Badge variant="secondary">Medium</Badge>
    default:
      return <Badge variant="outline">Low</Badge>
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'confirmed':
      return <CheckCircle2 className="h-4 w-4 text-success" />
    case 'pending':
      return <Clock className="h-4 w-4 text-gold" />
    default:
      return <AlertCircle className="h-4 w-4 text-destructive" />
  }
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy-900">Dashboard</h1>
        <p className="text-navy-500">Welcome back, Dr. Johnson. Here&apos;s your overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className="rounded-[12px] border-navy-100">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-navy-500">{stat.title}</p>
                  <p className="mt-2 font-heading text-3xl font-bold text-navy-900">{stat.value}</p>
                  <p className="mt-1 text-xs text-navy-400">{stat.description}</p>
                </div>
                <div className={`rounded-lg p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="mt-4 text-xs text-navy-500">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Action Queue */}
        <Card className="lg:col-span-2 rounded-[12px] border-navy-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading text-lg">Action Queue</CardTitle>
                <CardDescription>Tasks requiring your attention</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="border-navy-200 text-navy-600">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actionQueue.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between rounded-lg border border-navy-100 bg-white p-4 transition-colors hover:bg-navy-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50">
                      {action.type === 'grade' && <FileSpreadsheet className="h-5 w-5 text-navy-600" />}
                      {action.type === 'transcript' && <FileCheck className="h-5 w-5 text-navy-600" />}
                      {action.type === 'degree' && <GraduationCap className="h-5 w-5 text-navy-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-navy-900">{action.title}</p>
                      <p className="text-sm text-navy-500">{action.deadline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getPriorityBadge(action.priority)}
                    <Button size="sm" variant="ghost" className="text-navy-600">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Blockchain Activity */}
        <Card className="rounded-[12px] border-navy-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-heading text-lg">Blockchain Activity</CardTitle>
                <CardDescription>Recent transactions</CardDescription>
              </div>
              <Activity className="h-5 w-5 text-navy-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900">{activity.action}</p>
                    <p className="text-xs text-navy-500">{activity.student}</p>
                    <p className="font-blockchain text-navy-400 mt-1">{activity.txHash}</p>
                  </div>
                  <span className="text-xs text-navy-400 whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Tiles */}
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
                  <h3 className="font-heading font-semibold text-navy-900 group-hover:text-navy-700">
                    {tile.title}
                  </h3>
                  <p className="mt-1 text-sm text-navy-500">{tile.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* System Health Panel (Admin) */}
      <Card className="rounded-[12px] border-navy-100">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-heading text-lg">System Health</CardTitle>
              <CardDescription>Infrastructure status overview</CardDescription>
            </div>
            <Badge className="bg-success text-white border-0">All Systems Operational</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-navy-100 p-4">
              <div className="flex items-center gap-3">
                <Server className="h-5 w-5 text-navy-600" />
                <span className="font-medium text-navy-900">Blockchain</span>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-navy-500">Uptime</span>
                  <span className="font-medium text-success">{systemHealth.blockchain.value}%</span>
                </div>
                <Progress value={systemHealth.blockchain.value} className="mt-2 h-2" />
              </div>
            </div>

            <div className="rounded-lg border border-navy-100 p-4">
              <div className="flex items-center gap-3">
                <HardDrive className="h-5 w-5 text-navy-600" />
                <span className="font-medium text-navy-900">IPFS Storage</span>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-navy-500">Availability</span>
                  <span className="font-medium text-success">{systemHealth.ipfs.value}%</span>
                </div>
                <Progress value={systemHealth.ipfs.value} className="mt-2 h-2" />
              </div>
            </div>

            <div className="rounded-lg border border-navy-100 p-4">
              <div className="flex items-center gap-3">
                <Cpu className="h-5 w-5 text-navy-600" />
                <span className="font-medium text-navy-900">Database</span>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-navy-500">Health</span>
                  <span className="font-medium text-success">{systemHealth.database.value}%</span>
                </div>
                <Progress value={systemHealth.database.value} className="mt-2 h-2" />
              </div>
            </div>

            <div className="rounded-lg border border-navy-100 p-4">
              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5 text-navy-600" />
                <span className="font-medium text-navy-900">API Gateway</span>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-navy-500">Response</span>
                  <span className="font-medium text-warning">{systemHealth.api.value}%</span>
                </div>
                <Progress value={systemHealth.api.value} className="mt-2 h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
