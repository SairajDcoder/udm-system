'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { Search, Users, UserCheck, Shield, Loader2 } from 'lucide-react'

type UserRole = 'student' | 'faculty' | 'admin' | 'verifier'

type FacultyUser = {
  id: string
  role: UserRole
  fullName: string
  institutionalEmail: string
  department?: string
  mfaEnabled: boolean
  keyStatus: 'active' | 'rotated'
  createdAt: string
  lastLoginAt?: string
}

function roleBadge(role: UserRole) {
  if (role === 'admin') return <Badge className="bg-navy-700 text-white border-0">Admin</Badge>
  if (role === 'faculty') return <Badge className="bg-gold text-navy-900 border-0">Faculty</Badge>
  if (role === 'student') return <Badge variant="secondary">Student</Badge>
  return <Badge variant="outline">Verifier</Badge>
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<FacultyUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [error, setError] = useState<string | null>(null)

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return users.filter((user) => {
      const matchesQuery =
        user.fullName.toLowerCase().includes(query) ||
        user.institutionalEmail.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query) ||
        (user.department ?? '').toLowerCase().includes(query)
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      return matchesQuery && matchesRole
    })
  }, [users, searchQuery, roleFilter])

  useEffect(() => {
    async function loadUsers() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/faculty/users', { cache: 'no-store' })
        const data = await response.json()
        setUsers(Array.isArray(data.users) ? data.users : [])
      } catch {
        setError('Unable to load users.')
      } finally {
        setLoading(false)
      }
    }
    void loadUsers()
  }, [])

  const activeUsers = users.filter((user) => user.keyStatus === 'active').length
  const mfaUsers = users.filter((user) => user.mfaEnabled).length
  const adminUsers = users.filter((user) => user.role === 'admin').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy-900">User Management</h1>
        <p className="text-navy-500">Manage faculty and administrative users</p>
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
              <Users className="h-5 w-5 text-navy-700" />
              <div>
                <p className="text-2xl font-bold text-navy-900">{users.length}</p>
                <p className="text-xs text-navy-500">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold text-navy-900">{activeUsers}</p>
                <p className="text-xs text-navy-500">Active Keys</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gold" />
              <div>
                <p className="text-2xl font-bold text-navy-900">{mfaUsers}/{users.length}</p>
                <p className="text-xs text-navy-500">MFA Enabled</p>
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
                placeholder="Search by name, email, department..."
                className="border-navy-200 bg-white pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px] border-navy-200">
                <SelectValue placeholder="Filter role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="verifier">Verifier</SelectItem>
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
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-sm text-navy-500">No users match your filters.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-navy-50 hover:bg-navy-50">
                  <TableHead className="font-semibold text-navy-700">User</TableHead>
                  <TableHead className="font-semibold text-navy-700">Role</TableHead>
                  <TableHead className="font-semibold text-navy-700">Department</TableHead>
                  <TableHead className="font-semibold text-navy-700">MFA</TableHead>
                  <TableHead className="font-semibold text-navy-700">Key</TableHead>
                  <TableHead className="font-semibold text-navy-700">Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-navy-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{user.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-navy-900">{user.fullName}</p>
                          <p className="text-xs text-navy-500">{user.institutionalEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{roleBadge(user.role)}</TableCell>
                    <TableCell className="text-navy-700">{user.department ?? '-'}</TableCell>
                    <TableCell>{user.mfaEnabled ? <Badge variant="outline">Enabled</Badge> : <Badge variant="secondary">Disabled</Badge>}</TableCell>
                    <TableCell>
                      {user.keyStatus === 'active' ? (
                        <Badge className="bg-success text-white border-0">Active</Badge>
                      ) : (
                        <Badge variant="outline">Rotated</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-navy-700">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-navy-500">Admin accounts in scope: {adminUsers}</p>
    </div>
  )
}
