'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Search, Server, Activity, Wallet, Loader2 } from 'lucide-react'

type ValidatorNode = {
  id: string
  blockchain: 'student' | 'faculty' | 'institutional'
  name: string
  stake: number
  uptime: number
  status: 'active' | 'syncing' | 'degraded'
  walletAddress: string
}

function statusBadge(status: ValidatorNode['status']) {
  if (status === 'active') return <Badge className="bg-success text-white border-0">Active</Badge>
  if (status === 'syncing') return <Badge className="bg-gold text-navy-900 border-0">Syncing</Badge>
  return <Badge variant="destructive">Degraded</Badge>
}

export default function ValidatorNodesPage() {
  const [validators, setValidators] = useState<ValidatorNode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [chainFilter, setChainFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  const filteredValidators = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return validators.filter((validator) => {
      const matchesQuery =
        validator.id.toLowerCase().includes(query) ||
        validator.name.toLowerCase().includes(query) ||
        validator.walletAddress.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || validator.status === statusFilter
      const matchesChain = chainFilter === 'all' || validator.blockchain === chainFilter
      return matchesQuery && matchesStatus && matchesChain
    })
  }, [validators, searchQuery, statusFilter, chainFilter])

  useEffect(() => {
    async function loadValidators() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/faculty/validators', { cache: 'no-store' })
        const data = await response.json()
        setValidators(Array.isArray(data.validators) ? data.validators : [])
      } catch {
        setError('Unable to load validator nodes.')
      } finally {
        setLoading(false)
      }
    }
    void loadValidators()
  }, [])

  const activeCount = validators.filter((validator) => validator.status === 'active').length
  const averageUptime = validators.length === 0
    ? 0
    : Number((validators.reduce((sum, validator) => sum + validator.uptime, 0) / validators.length).toFixed(2))
  const totalStake = validators.reduce((sum, validator) => sum + validator.stake, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy-900">Validator Node Management</h1>
        <p className="text-navy-500">Monitor validator participation across all three blockchains</p>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-navy-700" />
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
              <Activity className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold text-navy-900">{activeCount}</p>
                <p className="text-xs text-navy-500">Active Nodes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-gold" />
              <div>
                <p className="text-2xl font-bold text-navy-900">{totalStake}</p>
                <p className="text-xs text-navy-500">Total Stake</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by validator ID, name, wallet..."
                className="border-navy-200 bg-white pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] border-navy-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="syncing">Syncing</SelectItem>
                <SelectItem value="degraded">Degraded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chainFilter} onValueChange={setChainFilter}>
              <SelectTrigger className="w-[180px] border-navy-200">
                <SelectValue placeholder="Blockchain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="faculty">Faculty/Admin</SelectItem>
                <SelectItem value="institutional">Institutional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-navy-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading validator nodes...
            </div>
          ) : filteredValidators.length === 0 ? (
            <div className="p-8 text-center text-sm text-navy-500">No validator nodes match your filters.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-navy-50 hover:bg-navy-50">
                  <TableHead className="font-semibold text-navy-700">Validator</TableHead>
                  <TableHead className="font-semibold text-navy-700">Blockchain</TableHead>
                  <TableHead className="font-semibold text-navy-700 text-center">Stake</TableHead>
                  <TableHead className="font-semibold text-navy-700 text-center">Uptime</TableHead>
                  <TableHead className="font-semibold text-navy-700">Status</TableHead>
                  <TableHead className="font-semibold text-navy-700">Wallet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredValidators.map((validator) => (
                  <TableRow key={validator.id} className="hover:bg-navy-50">
                    <TableCell>
                      <p className="font-mono text-sm text-navy-700">{validator.id}</p>
                      <p className="font-medium text-navy-900">{validator.name}</p>
                    </TableCell>
                    <TableCell className="capitalize text-navy-700">{validator.blockchain}</TableCell>
                    <TableCell className="text-center text-navy-700">{validator.stake}</TableCell>
                    <TableCell className="text-center text-navy-700">{validator.uptime}%</TableCell>
                    <TableCell>{statusBadge(validator.status)}</TableCell>
                    <TableCell>
                      <code className="text-xs text-navy-600">{validator.walletAddress}</code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-navy-500">Average uptime across validators: {averageUptime}%</p>
    </div>
  )
}
