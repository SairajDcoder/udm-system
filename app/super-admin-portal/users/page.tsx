"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/super-admin-portal/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Users, Search, Shield, ShieldCheck, ShieldAlert, MoreVertical, Key, Ban, Trash2, UserCog } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  portal: "Student" | "Faculty" | "Admin" | "Institutional"
  role: string
  mfaEnabled: boolean
  status: "active" | "inactive" | "suspended"
  lastLogin: string
  createdAt: string
}

const users: User[] = [
  { id: "USR001", name: "Alice Johnson", email: "alice.johnson@university.edu", portal: "Student", role: "Student", mfaEnabled: true, status: "active", lastLogin: "2 hours ago", createdAt: "2023-09-01" },
  { id: "USR002", name: "Dr. Robert Smith", email: "r.smith@university.edu", portal: "Faculty", role: "Professor", mfaEnabled: true, status: "active", lastLogin: "1 hour ago", createdAt: "2022-01-15" },
  { id: "USR003", name: "Sarah Williams", email: "s.williams@university.edu", portal: "Admin", role: "Department Admin", mfaEnabled: true, status: "active", lastLogin: "30 min ago", createdAt: "2021-06-20" },
  { id: "USR004", name: "Michael Chen", email: "m.chen@university.edu", portal: "Student", role: "Graduate Student", mfaEnabled: false, status: "active", lastLogin: "5 hours ago", createdAt: "2024-01-10" },
  { id: "USR005", name: "Dr. Emily Davis", email: "e.davis@university.edu", portal: "Faculty", role: "Associate Professor", mfaEnabled: true, status: "inactive", lastLogin: "3 days ago", createdAt: "2020-09-01" },
  { id: "USR006", name: "James Wilson", email: "j.wilson@university.edu", portal: "Institutional", role: "Registrar", mfaEnabled: true, status: "active", lastLogin: "4 hours ago", createdAt: "2019-03-15" },
  { id: "USR007", name: "Lisa Anderson", email: "l.anderson@university.edu", portal: "Student", role: "Student", mfaEnabled: false, status: "suspended", lastLogin: "2 weeks ago", createdAt: "2023-09-01" },
  { id: "USR008", name: "David Brown", email: "d.brown@university.edu", portal: "Admin", role: "Super Admin", mfaEnabled: true, status: "active", lastLogin: "10 min ago", createdAt: "2018-01-01" },
  { id: "USR009", name: "Jennifer Taylor", email: "j.taylor@university.edu", portal: "Faculty", role: "Lecturer", mfaEnabled: true, status: "active", lastLogin: "1 day ago", createdAt: "2022-08-20" },
  { id: "USR010", name: "Chris Martinez", email: "c.martinez@university.edu", portal: "Student", role: "Undergraduate", mfaEnabled: false, status: "active", lastLogin: "6 hours ago", createdAt: "2024-01-15" },
]

function BulkActionsDialog({ selectedCount }: { selectedCount: number }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={selectedCount === 0}>
          Bulk Actions ({selectedCount})
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif">Bulk Actions</DialogTitle>
          <DialogDescription>
            Apply actions to {selectedCount} selected users
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <Button variant="outline" className="w-full justify-start gap-2">
            <ShieldCheck className="h-4 w-4 text-success" />
            Enable MFA for all
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2">
            <Key className="h-4 w-4 text-secondary" />
            Force Password Reset
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2 text-warning">
            <Ban className="h-4 w-4" />
            Suspend Users
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2 text-error">
            <Trash2 className="h-4 w-4" />
            Delete Users
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function UserActionsMenu({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <UserCog className="mr-2 h-4 w-4" />
          Edit User
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Key className="mr-2 h-4 w-4" />
          Reset Password
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ShieldCheck className="mr-2 h-4 w-4" />
          {user.mfaEnabled ? "Disable MFA" : "Force MFA"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-warning">
          <Ban className="mr-2 h-4 w-4" />
          {user.status === "suspended" ? "Unsuspend" : "Suspend"}
        </DropdownMenuItem>
        <DropdownMenuItem className="text-error">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function UserManagementPage() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [portalFilter, setPortalFilter] = useState<string>("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPortal = portalFilter === "all" || user.portal === portalFilter
    return matchesSearch && matchesPortal
  })

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id))
    }
  }

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const portalColors = {
    Student: "bg-info/20 text-info border-info/30",
    Faculty: "bg-secondary/20 text-secondary border-secondary/30",
    Admin: "bg-primary/20 text-primary border-primary/30",
    Institutional: "bg-success/20 text-success border-success/30",
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="User & Role Management" code="ADM-06" />
      <main className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Total Users</p>
                  <p className="font-mono text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Active Users</p>
                  <p className="font-mono text-2xl font-bold">
                    {users.filter((u) => u.status === "active").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <ShieldCheck className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">MFA Enabled</p>
                  <p className="font-mono text-2xl font-bold">
                    {users.filter((u) => u.mfaEnabled).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-error/10">
                  <ShieldAlert className="h-6 w-6 text-error" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Suspended</p>
                  <p className="font-mono text-2xl font-bold">
                    {users.filter((u) => u.status === "suspended").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle className="font-serif text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Directory
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-9 bg-muted border-border"
                  />
                </div>
                <Select value={portalFilter} onValueChange={setPortalFilter}>
                  <SelectTrigger className="w-[150px] bg-muted border-border">
                    <SelectValue placeholder="All Portals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Portals</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Faculty">Faculty</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Institutional">Institutional</SelectItem>
                  </SelectContent>
                </Select>
                <BulkActionsDialog selectedCount={selectedUsers.length} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Portal</TableHead>
                  <TableHead className="text-muted-foreground">Role</TableHead>
                  <TableHead className="text-muted-foreground">MFA</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Last Login</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-border">
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleSelectUser(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={portalColors[user.portal]}>
                        {user.portal}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{user.role}</TableCell>
                    <TableCell>
                      <Switch checked={user.mfaEnabled} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.status === "active"
                            ? "bg-success/20 text-success border-success/30"
                            : user.status === "inactive"
                            ? "bg-muted text-muted-foreground border-muted"
                            : "bg-error/20 text-error border-error/30"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {user.lastLogin}
                    </TableCell>
                    <TableCell className="text-right">
                      <UserActionsMenu user={user} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
