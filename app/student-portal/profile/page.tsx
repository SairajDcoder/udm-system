"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Copy,
  Check,
  Camera,
  Shield,
  Smartphone,
  Monitor,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Clock,
  Trash2,
} from "lucide-react"
import { useStudentWorkspace } from "@/components/student-portal/use-student-workspace"

function DIDAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)
  const hasAddress = Boolean(address && address !== "Not provided")

  const handleCopy = () => {
    if (!hasAddress) {
      return
    }
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const truncatedAddress = hasAddress ? `${address.slice(0, 12)}...${address.slice(-8)}` : "Not provided"

  return (
    <div className="flex items-center gap-2 rounded-lg bg-navy-900 p-3">
      <span className="font-mono text-sm text-teal-400">{truncatedAddress}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-400 hover:bg-navy-700 hover:text-white"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )
}

const activeSessions = [
  { device: "Chrome on MacBook Pro", location: "San Francisco, CA", lastActive: "Active now", current: true },
  { device: "Safari on iPhone 15", location: "San Francisco, CA", lastActive: "2 hours ago", current: false },
  { device: "Firefox on Windows PC", location: "Los Angeles, CA", lastActive: "3 days ago", current: false },
]

function formatLabel(value: string | undefined | null, fallback = "Not provided") {
  const cleaned = value?.trim()
  return cleaned ? cleaned : fallback
}

export default function ProfilePage() {
  const { data, loading, error } = useStudentWorkspace()
  const student = data?.student
  const [mfaEnabled, setMfaEnabled] = useState(false)

  useEffect(() => {
    setMfaEnabled(Boolean(student?.mfaEnabled))
  }, [student?.mfaEnabled])

  const fullName = formatLabel(student?.fullName, loading ? "Loading student..." : "Student")
  const email = formatLabel(student?.institutionalEmail)
  const studentId = formatLabel(student?.enrollmentId ?? student?.id)
  const did = formatLabel(student?.did)
  const program = [student?.programme, student?.department].filter(Boolean).join(" - ")
  const enrollmentStatus = student ? "Active" : "Loading"
  const enrollmentDate = student?.joinYear ? `Joined ${student.joinYear}` : "Not provided"
  const expectedGraduation = student?.joinYear ? `${Number(student.joinYear) + 4}` : "Not provided"
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-teal-500">
                  <AvatarImage src="/avatars/student.jpg" alt={fullName} />
                  <AvatarFallback className="bg-teal-500 text-3xl font-heading text-white">
                    {initials || "ST"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full border-2 border-gray-200 bg-white shadow-md hover:bg-gray-50"
                >
                  <Camera className="h-5 w-5 text-gray-600" />
                </Button>
              </div>

              <h2 className="mt-4 font-heading text-xl font-bold text-navy-900">{fullName}</h2>

              <Badge className="mt-2 rounded-full bg-teal-100 px-3 py-1 text-teal-700 hover:bg-teal-100">
                <GraduationCap className="mr-1 h-3 w-3" />
                {student ? "Undergraduate Student" : "Loading profile"}
              </Badge>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">Student ID</p>
                <p className="font-mono text-sm font-medium text-navy-900">{studentId}</p>
              </div>
            </div>

            <div className="mt-6">
              <Label className="mb-2 block text-sm text-gray-500">Decentralized Identity (DID)</Label>
              <DIDAddress address={did} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="font-heading text-2xl font-bold text-teal-600">{(data?.cgpa ?? 0).toFixed(2)}</p>
                <p className="text-xs text-gray-500">CGPA</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="font-heading text-2xl font-bold text-teal-600">{data?.creditsEarned ?? 0}</p>
                <p className="text-xs text-gray-500">Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-navy-900 to-navy-800 shadow-sm border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/20">
                <Shield className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Identity Verified</h3>
                <p className="text-sm text-gray-400">Blockchain-secured</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-white/5 p-3">
              <p className="text-xs text-gray-400">Verification Hash</p>
              <p className="mt-1 truncate font-mono text-xs text-teal-400">
                {student ? student.did : "Loading verification data..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="mb-6 w-full justify-start rounded-lg border border-gray-200 bg-white p-1">
            <TabsTrigger value="personal" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="academic" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Academic Info
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading text-lg text-navy-900">Personal Information</CardTitle>
                <CardDescription>
                  {error ? error : "Your personal details and contact information"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-gray-500">Full Name</Label>
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                      <span className="font-medium text-navy-900">{fullName}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Date of Birth</Label>
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-navy-900">{formatLabel(student?.dateOfBirth)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Email Address</Label>
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-navy-900">{email}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Phone Number</Label>
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-navy-900">{formatLabel(student?.phone)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Gender</Label>
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                      <span className="font-medium text-navy-900">{formatLabel(student?.gender)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-500">Address</Label>
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-navy-900">Not provided</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <Button className="bg-teal-500 text-white hover:bg-teal-600">Request Information Update</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading text-lg text-navy-900">Academic Information</CardTitle>
                <CardDescription>Your enrollment and program details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-gray-500">Student ID</Label>
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                      <span className="font-mono font-medium text-navy-900">{studentId}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Enrollment Status</Label>
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                      <Badge className="bg-teal-100 text-teal-700">{enrollmentStatus}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-500">Program</Label>
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                      <GraduationCap className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-navy-900">{formatLabel(program)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Department</Label>
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-navy-900">{formatLabel(student?.department)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Academic Advisor</Label>
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                      <span className="font-medium text-navy-900">Not assigned</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Enrollment Date</Label>
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-navy-900">{enrollmentDate}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Expected Graduation</Label>
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-navy-900">{expectedGraduation}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-lg text-navy-900">Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  <Button className="bg-teal-500 text-white hover:bg-teal-600">Update Password</Button>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-heading text-lg text-navy-900">Two-Factor Authentication</CardTitle>
                      <CardDescription>Add an extra layer of security to your account</CardDescription>
                    </div>
                    <Switch
                      checked={mfaEnabled}
                      onCheckedChange={setMfaEnabled}
                      className="data-[state=checked]:bg-teal-500"
                    />
                  </div>
                </CardHeader>
                {mfaEnabled ? (
                  <CardContent>
                    <div className="flex items-center gap-3 rounded-lg border border-teal-200 bg-teal-50 p-4">
                      <Smartphone className="h-5 w-5 text-teal-600" />
                      <div>
                        <p className="text-sm font-medium text-teal-900">Authenticator App Enabled</p>
                        <p className="text-xs text-teal-700">Connected to Google Authenticator</p>
                      </div>
                    </div>
                  </CardContent>
                ) : null}
              </Card>

              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-lg text-navy-900">Active Sessions</CardTitle>
                  <CardDescription>Manage your active sessions across devices</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-gray-500">Device</TableHead>
                        <TableHead className="text-gray-500">Location</TableHead>
                        <TableHead className="text-gray-500">Last Active</TableHead>
                        <TableHead className="text-right text-gray-500">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeSessions.map((session, index) => (
                        <TableRow key={index} className="border-gray-100">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Monitor className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-navy-900">{session.device}</span>
                              {session.current ? (
                                <Badge className="bg-teal-100 text-[10px] text-teal-700">Current</Badge>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin className="h-3 w-3" />
                              {session.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock className="h-3 w-3" />
                              {session.lastActive}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {!session.current ? (
                              <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
