'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Filter,
  Server,
  Activity,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Plus,
  Settings,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { cn } from '@/lib/utils'

// Sample validator nodes
const validators = [
  {
    id: 'VAL001',
    name: 'Primary Validator Node',
    stake: 32.5,
    uptime: 99.98,
    status: 'active',
    lastBlock: 18547892,
    attestations: 15234,
    rewards: 1.24,
    region: 'US-East',
  },
  {
    id: 'VAL002',
    name: 'Backup Validator A',
    stake: 32.0,
    uptime: 99.95,
    status: 'active',
    lastBlock: 18547892,
    attestations: 15198,
    rewards: 1.18,
    region: 'US-West',
  },
  {
    id: 'VAL003',
    name: 'Academic Records Node',
    stake: 48.0,
    uptime: 99.99,
    status: 'active',
    lastBlock: 18547892,
    attestations: 15267,
    rewards: 1.89,
    region: 'EU-Central',
  },
  {
    id: 'VAL004',
    name: 'Research Data Node',
    stake: 24.0,
    uptime: 97.85,
    status: 'warning',
    lastBlock: 18547880,
    attestations: 14956,
    rewards: 0.95,
    region: 'Asia-Pacific',
  },
  {
    id: 'VAL005',
    name: 'Credential Verification Node',
    stake: 16.0,
    uptime: 0,
    status: 'offline',
    lastBlock: 18547650,
    attestations: 14500,
    rewards: 0.45,
    region: 'US-East',
  },
  {
    id: 'VAL006',
    name: 'Partner University Node',
    stake: 64.0,
    uptime: 99.92,
    status: 'active',
    lastBlock: 18547892,
    attestations: 15245,
    rewards: 2.56,
    region: 'EU-West',
  },
]

// Donut chart data
const stakeDistribution = [
  { name: 'Primary Validator', value: 32.5, color: '#1B3461' },
  { name: 'Backup Validator A', value: 32.0, color: '#2A4A7A' },
  { name: 'Academic Records', value: 48.0, color: '#E8A838' },
  { name: 'Research Data', value: 24.0, color: '#3D5F94' },
  { name: 'Credential Verification', value: 16.0, color: '#5A7AAE' },
  { name: 'Partner University', value: 64.0, color: '#8BA3C7' },
]

const totalStake = validators.reduce((acc, v) => acc + v.stake, 0)

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-success text-white border-0">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Active
        </Badge>
      )
    case 'warning':
      return (
        <Badge className="bg-warning text-navy-900 border-0">
          <AlertCircle className="mr-1 h-3 w-3" />
          Warning
        </Badge>
      )
    case 'offline':
      return (
        <Badge className="bg-destructive text-white border-0">
          <Clock className="mr-1 h-3 w-3" />
          Offline
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getUptimeColor(uptime: number) {
  if (uptime >= 99) return 'text-success'
  if (uptime >= 95) return 'text-warning'
  return 'text-destructive'
}

export default function ValidatorNodesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredValidators = validators.filter(
    (validator) =>
      validator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      validator.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      validator.region.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeNodes = validators.filter(v => v.status === 'active').length
  const totalRewards = validators.reduce((acc, v) => acc + v.rewards, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">Validator Node Management</h1>
          <p className="text-navy-500">Monitor and manage blockchain validator nodes</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-navy-200 text-navy-600">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button className="bg-navy-700 hover:bg-navy-800">
            <Plus className="mr-2 h-4 w-4" />
            Add Node
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-navy-100 p-2">
                <Server className="h-5 w-5 text-navy-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{validators.length}</p>
                <p className="text-xs text-navy-500">Total Nodes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <Activity className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{activeNodes}</p>
                <p className="text-xs text-navy-500">Active Nodes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gold/10 p-2">
                <Wallet className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{totalStake.toFixed(1)} ETH</p>
                <p className="text-xs text-navy-500">Total Staked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-navy-600/10 p-2">
                <Wallet className="h-5 w-5 text-navy-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{totalRewards.toFixed(2)} ETH</p>
                <p className="text-xs text-navy-500">Total Rewards</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Validator Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card className="rounded-[12px] border-navy-100">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                  <Input
                    placeholder="Search validators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white border-navy-200"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[130px] border-navy-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[130px] border-navy-200">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="us-east">US-East</SelectItem>
                    <SelectItem value="us-west">US-West</SelectItem>
                    <SelectItem value="eu-central">EU-Central</SelectItem>
                    <SelectItem value="eu-west">EU-West</SelectItem>
                    <SelectItem value="asia-pacific">Asia-Pacific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="rounded-[12px] border-navy-100">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-navy-50 hover:bg-navy-50">
                    <TableHead className="font-semibold text-navy-700">Validator ID</TableHead>
                    <TableHead className="font-semibold text-navy-700">Node Name</TableHead>
                    <TableHead className="font-semibold text-navy-700 text-center">Stake (ETH)</TableHead>
                    <TableHead className="font-semibold text-navy-700">Uptime</TableHead>
                    <TableHead className="font-semibold text-navy-700">Status</TableHead>
                    <TableHead className="font-semibold text-navy-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredValidators.map((validator) => (
                    <TableRow key={validator.id} className="hover:bg-navy-50">
                      <TableCell className="font-mono text-sm text-navy-600">
                        {validator.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-navy-900">{validator.name}</p>
                          <p className="text-xs text-navy-500">{validator.region}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-mono font-medium text-navy-900">
                          {validator.stake.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="w-32">
                          <div className="flex items-center justify-between mb-1">
                            <span className={cn('text-sm font-medium', getUptimeColor(validator.uptime))}>
                              {validator.uptime.toFixed(2)}%
                            </span>
                          </div>
                          <Progress
                            value={validator.uptime}
                            className={cn(
                              'h-2',
                              validator.uptime >= 99 && '[&>div]:bg-success',
                              validator.uptime >= 95 && validator.uptime < 99 && '[&>div]:bg-warning',
                              validator.uptime < 95 && '[&>div]:bg-destructive'
                            )}
                          />
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(validator.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-navy-500">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Stake Distribution Chart */}
        <Card className="rounded-[12px] border-navy-100">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-lg">Stake Distribution</CardTitle>
            <CardDescription>ETH staked across validator nodes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stakeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stakeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)} ETH`, 'Stake']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #BCC9DE',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-navy-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-500">Total Staked</span>
                <span className="font-mono font-medium text-navy-900">{totalStake.toFixed(1)} ETH</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-500">Active Validators</span>
                <span className="font-medium text-success">{activeNodes}/{validators.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-500">Avg. Uptime</span>
                <span className="font-medium text-navy-900">
                  {(validators.reduce((acc, v) => acc + v.uptime, 0) / validators.length).toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-500">Latest Block</span>
                <span className="font-mono text-navy-900">#{validators[0].lastBlock.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
