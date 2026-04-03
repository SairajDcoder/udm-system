"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminHeader } from "@/components/super-admin-portal/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users, Search, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react"

type SystemUser = {
  id: string
  role: "student" | "faculty" | "admin" | "verifier"
  fullName: string
  institutionalEmail: string
  department?: string
  mfaEnabled: boolean
  keyStatus: "active" | "rotated"
  createdAt: string
  lastLoginAt?: string
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<SystemUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  useEffect(() => {
    async function loadUsers() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/system/users", { cache: "no-store" })
        const data = await response.json()
        setUsers(Array.isArray(data.users) ? data.users : [])
      } catch {
        setError("Failed to load system users.")
      } finally {
        setLoading(false)
      }
    }
    void loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return users.filter((user) => {
      const matchesQuery =
        user.fullName.toLowerCase().includes(query) ||
        user.institutionalEmail.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query)
      const matchesRole = roleFilter === "all" || user.role === roleFilter
      return matchesQuery && matchesRole
    })
  }, [users, searchQuery, roleFilter])

  const activeUsers = users.filter((user) => user.keyStatus === "active").length
  const mfaEnabled = users.filter((user) => user.mfaEnabled).length
  const adminCount = users.filter((user) => user.role === "admin").length

  return (
    <div className="min-h-screen">
      <AdminHeader title="User & Role Management" code="ADM-06" />
      <main className="space-y-6 p-6">
        {error ? (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Total Users</p>
                  <p className="font-mono text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-success" />
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Active Keys</p>
                  <p className="font-mono text-2xl font-bold">{activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-secondary" />
                <div>
                  <p className="text-xs uppercase text-muted-foreground">MFA Enabled</p>
                  <p className="font-mono text-2xl font-bold">{mfaEnabled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Admins</p>
                  <p className="font-mono text-2xl font-bold">{adminCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle className="font-serif text-base">User Directory</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search users..."
                    className="w-64 bg-muted border-border pl-9"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[150px] bg-muted border-border">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="verifier">Verifier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading users...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>MFA</TableHead>
                    <TableHead>Key Status</TableHead>
                    <TableHead>Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-border">
                      <TableCell>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">{user.institutionalEmail}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{user.role}</Badge>
                      </TableCell>
                      <TableCell>{user.department ?? "-"}</TableCell>
                      <TableCell>
                        {user.mfaEnabled ? (
                          <Badge className="bg-success/20 text-success border-success/30">Enabled</Badge>
                        ) : (
                          <Badge className="bg-warning/20 text-warning border-warning/30">Disabled</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.keyStatus === "active"
                              ? "bg-success/20 text-success border-success/30"
                              : "bg-warning/20 text-warning border-warning/30"
                          }
                        >
                          {user.keyStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
