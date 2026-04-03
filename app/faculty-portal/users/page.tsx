'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Search, Plus, Users, UserCheck, Shield, Loader2 } from 'lucide-react'

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
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('faculty')
  const [inviteDepartment, setInviteDepartment] = useState('CSE')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

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

  useEffect(() => {
    void loadUsers()
  }, [])

  const activeUsers = users.filter((user) => user.keyStatus === 'active').length
  const mfaUsers = users.filter((user) => user.mfaEnabled).length
  const adminUsers = users.filter((user) => user.role === 'admin').length

  const inviteUser = async () => {
    if (!inviteEmail.trim()) return
    setCreating(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch('/api/faculty/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          fullName: inviteName.trim() || undefined,
          role: inviteRole,
          department: inviteDepartment.trim() || undefined,
          mfaEnabled: true,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user.')
      }
      setMessage(`User ${data.user?.id ?? ''} created successfully.`)
      setInviteDialogOpen(false)
      setInviteEmail('')
      setInviteName('')
      await loadUsers()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create user.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">User Management</h1>
          <p className="text-navy-500">Manage faculty and administrative users</p>
        </div>

        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-navy-700 hover:bg-navy-800">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">Create User Profile</DialogTitle>
              <DialogDescription>Create a new UniChain profile for faculty/admin access.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  className="border-navy-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-name">Full Name</Label>
                <Input
                  id="invite-name"
                  value={inviteName}
                  onChange={(event) => setInviteName(event.target.value)}
                  className="border-navy-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as UserRole)}>
                    <SelectTrigger className="border-navy-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="verifier">Verifier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-dept">Department</Label>
                  <Input
                    id="invite-dept"
                    value={inviteDepartment}
                    onChange={(event) => setInviteDepartment(event.target.value)}
                    className="border-navy-200"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => void inviteUser()}
                disabled={creating || !inviteEmail.trim()}
                className="bg-navy-700 hover:bg-navy-800"
              >
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {message}
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
