'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Filter,
  Plus,
  Users,
  UserCheck,
  UserX,
  Shield,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Key,
  Building,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Sample users
const users = [
  {
    id: 'USR001',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    role: 'admin',
    department: 'Computer Science',
    status: 'active',
    lastLogin: '2026-03-28 14:32',
    createdAt: '2024-01-15',
  },
  {
    id: 'USR002',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@university.edu',
    role: 'faculty',
    department: 'Mathematics',
    status: 'active',
    lastLogin: '2026-03-28 10:15',
    createdAt: '2024-02-20',
  },
  {
    id: 'USR003',
    name: 'Dr. Emily White',
    email: 'emily.white@university.edu',
    role: 'faculty',
    department: 'Computer Science',
    status: 'active',
    lastLogin: '2026-03-27 16:45',
    createdAt: '2024-03-10',
  },
  {
    id: 'USR004',
    name: 'Prof. David Lee',
    email: 'david.lee@university.edu',
    role: 'faculty',
    department: 'Electrical Engineering',
    status: 'inactive',
    lastLogin: '2026-02-15 09:20',
    createdAt: '2023-08-01',
  },
  {
    id: 'USR005',
    name: 'Jennifer Martinez',
    email: 'jennifer.martinez@university.edu',
    role: 'staff',
    department: 'Registrar Office',
    status: 'active',
    lastLogin: '2026-03-28 11:30',
    createdAt: '2024-05-15',
  },
  {
    id: 'USR006',
    name: 'Robert Anderson',
    email: 'robert.anderson@university.edu',
    role: 'staff',
    department: 'Dean Office',
    status: 'active',
    lastLogin: '2026-03-28 09:00',
    createdAt: '2023-09-20',
  },
  {
    id: 'USR007',
    name: 'Dr. Carol Davis',
    email: 'carol.davis@university.edu',
    role: 'faculty',
    department: 'Civil Engineering',
    status: 'pending',
    lastLogin: '-',
    createdAt: '2026-03-25',
  },
  {
    id: 'USR008',
    name: 'System Admin',
    email: 'admin@university.edu',
    role: 'superadmin',
    department: 'IT Department',
    status: 'active',
    lastLogin: '2026-03-28 08:00',
    createdAt: '2023-01-01',
  },
]

function getRoleBadge(role: string) {
  switch (role) {
    case 'superadmin':
      return (
        <Badge className="bg-navy-900 text-white border-0">
          <Shield className="mr-1 h-3 w-3" />
          Super Admin
        </Badge>
      )
    case 'admin':
      return (
        <Badge className="bg-navy-700 text-white border-0">
          <Shield className="mr-1 h-3 w-3" />
          Admin
        </Badge>
      )
    case 'faculty':
      return <Badge className="bg-gold text-navy-900 border-0">Faculty</Badge>
    case 'staff':
      return <Badge variant="secondary">Staff</Badge>
    default:
      return <Badge variant="outline">{role}</Badge>
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <Badge className="bg-success text-white border-0">Active</Badge>
    case 'inactive':
      return <Badge variant="secondary">Inactive</Badge>
    case 'pending':
      return <Badge className="bg-gold text-navy-900 border-0">Pending</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeUsers = users.filter(u => u.status === 'active').length
  const pendingUsers = users.filter(u => u.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">User Management</h1>
          <p className="text-navy-500">Manage faculty and staff accounts</p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-navy-700 hover:bg-navy-800">
              <Plus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">Invite New User</DialogTitle>
              <DialogDescription>
                Send an invitation to add a new faculty or staff member
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                  <Input
                    id="inviteEmail"
                    type="email"
                    placeholder="user@university.edu"
                    className="pl-10 border-navy-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inviteName">Full Name</Label>
                <Input
                  id="inviteName"
                  placeholder="Dr. John Doe"
                  className="border-navy-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteRole">Role</Label>
                  <Select defaultValue="faculty">
                    <SelectTrigger className="border-navy-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inviteDept">Department</Label>
                  <Select>
                    <SelectTrigger className="border-navy-200">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cs">Computer Science</SelectItem>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="ee">Electrical Engineering</SelectItem>
                      <SelectItem value="ce">Civil Engineering</SelectItem>
                      <SelectItem value="me">Mechanical Engineering</SelectItem>
                      <SelectItem value="registrar">Registrar Office</SelectItem>
                      <SelectItem value="dean">Dean Office</SelectItem>
                      <SelectItem value="it">IT Department</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg bg-navy-50 p-4 text-sm text-navy-600">
                <p>
                  An invitation email will be sent to the user with instructions to set up their account
                  and connect their blockchain wallet.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-navy-700 hover:bg-navy-800">
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-navy-100 p-2">
                <Users className="h-5 w-5 text-navy-600" />
              </div>
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
              <div className="rounded-lg bg-success/10 p-2">
                <UserCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{activeUsers}</p>
                <p className="text-xs text-navy-500">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gold/10 p-2">
                <Mail className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{pendingUsers}</p>
                <p className="text-xs text-navy-500">Pending Invitations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-navy-600/10 p-2">
                <UserX className="h-5 w-5 text-navy-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">
                  {users.filter(u => u.status === 'inactive').length}
                </p>
                <p className="text-xs text-navy-500">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <Input
                placeholder="Search by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-navy-200"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px] border-navy-200">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px] border-navy-200">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="cs">Computer Science</SelectItem>
                <SelectItem value="math">Mathematics</SelectItem>
                <SelectItem value="ee">Electrical Engineering</SelectItem>
                <SelectItem value="ce">Civil Engineering</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[130px] border-navy-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-navy-200 text-navy-600">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Directory Table */}
      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-navy-50 hover:bg-navy-50">
                <TableHead className="font-semibold text-navy-700">User ID</TableHead>
                <TableHead className="font-semibold text-navy-700">User</TableHead>
                <TableHead className="font-semibold text-navy-700">Role</TableHead>
                <TableHead className="font-semibold text-navy-700">Department</TableHead>
                <TableHead className="font-semibold text-navy-700">Status</TableHead>
                <TableHead className="font-semibold text-navy-700">Last Login</TableHead>
                <TableHead className="font-semibold text-navy-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-navy-50">
                  <TableCell className="font-mono text-sm text-navy-600">{user.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-navy-100 text-navy-600 text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-navy-900">{user.name}</p>
                        <p className="text-xs text-navy-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-navy-600">
                      <Building className="h-4 w-4 text-navy-400" />
                      {user.department}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-navy-600">{user.lastLogin}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-navy-500">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Key className="mr-2 h-4 w-4" />
                          Reset Password
                        </DropdownMenuItem>
                        {user.status === 'pending' && (
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Resend Invitation
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {user.status === 'active' ? (
                          <DropdownMenuItem className="text-warning">
                            <UserX className="mr-2 h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-success">
                            <UserCheck className="mr-2 h-4 w-4" />
                            Activate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
