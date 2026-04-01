"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

// DID Address Display Component
function DIDAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const truncatedAddress = `${address.slice(0, 12)}...${address.slice(-8)}`

  return (
    <div className="flex items-center gap-2 p-3 bg-navy-900 rounded-lg">
      <span className="font-mono text-sm text-teal-400">{truncatedAddress}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-navy-700"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  )
}

// Sample Data
const personalInfo = {
  name: "Alex Kumar",
  email: "alex.kumar@university.edu",
  phone: "+1 (555) 123-4567",
  dateOfBirth: "March 15, 2002",
  address: "123 Campus Drive, University City, CA 90210",
  nationality: "United States",
}

const academicInfo = {
  studentId: "CS-2024-0892",
  program: "Bachelor of Science in Computer Science",
  department: "School of Computing",
  enrollmentDate: "August 2022",
  expectedGraduation: "May 2026",
  advisor: "Dr. Sarah Chen",
  status: "Full-Time",
}

const activeSessions = [
  { device: "Chrome on MacBook Pro", location: "San Francisco, CA", lastActive: "Active now", current: true },
  { device: "Safari on iPhone 15", location: "San Francisco, CA", lastActive: "2 hours ago", current: false },
  { device: "Firefox on Windows PC", location: "Los Angeles, CA", lastActive: "3 days ago", current: false },
]

export default function ProfilePage() {
  const [mfaEnabled, setMfaEnabled] = useState(true)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Profile Card */}
      <div className="space-y-6">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            {/* Profile Photo */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-teal-500">
                  <AvatarImage src="/avatars/student.jpg" alt="Alex Kumar" />
                  <AvatarFallback className="bg-teal-500 text-white text-3xl font-heading">AK</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-white border-2 border-gray-200 shadow-md hover:bg-gray-50"
                >
                  <Camera className="h-5 w-5 text-gray-600" />
                </Button>
              </div>

              <h2 className="font-heading text-xl font-bold text-navy-900 mt-4">Alex Kumar</h2>
              
              {/* Role Chip */}
              <Badge className="mt-2 bg-teal-100 text-teal-700 hover:bg-teal-100 rounded-full px-3 py-1">
                <GraduationCap className="h-3 w-3 mr-1" />
                Undergraduate Student
              </Badge>

              {/* Student ID */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">Student ID</p>
                <p className="font-mono text-sm font-medium text-navy-900">CS-2024-0892</p>
              </div>
            </div>

            {/* DID Address */}
            <div className="mt-6">
              <Label className="text-sm text-gray-500 mb-2 block">Decentralized Identity (DID)</Label>
              <DIDAddress address="did:eth:0x1234567890abcdef1234567890abcdef12345678" />
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-heading font-bold text-teal-600">3.72</p>
                <p className="text-xs text-gray-500">CGPA</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-heading font-bold text-teal-600">124</p>
                <p className="text-xs text-gray-500">Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blockchain Verification */}
        <Card className="border-gray-200 shadow-sm bg-gradient-to-br from-navy-900 to-navy-800">
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
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400">Verification Hash</p>
              <p className="font-mono text-xs text-teal-400 truncate mt-1">
                0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Tabs */}
      <div className="lg:col-span-2">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="w-full justify-start bg-white border border-gray-200 rounded-lg p-1 mb-6">
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

          {/* Personal Info Tab */}
          <TabsContent value="personal">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading text-lg text-navy-900">Personal Information</CardTitle>
                <CardDescription>Your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-500">Full Name</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-navy-900">{personalInfo.name}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Date of Birth</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-navy-900">{personalInfo.dateOfBirth}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Email Address</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-navy-900">{personalInfo.email}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Phone Number</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-navy-900">{personalInfo.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-500">Address</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-navy-900">{personalInfo.address}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                    Request Information Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Info Tab */}
          <TabsContent value="academic">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading text-lg text-navy-900">Academic Information</CardTitle>
                <CardDescription>Your enrollment and program details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-500">Student ID</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="font-mono font-medium text-navy-900">{academicInfo.studentId}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Enrollment Status</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Badge className="bg-teal-100 text-teal-700">{academicInfo.status}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-500">Program</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <GraduationCap className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-navy-900">{academicInfo.program}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Department</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-navy-900">{academicInfo.department}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Academic Advisor</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-navy-900">{academicInfo.advisor}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Enrollment Date</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-navy-900">{academicInfo.enrollmentDate}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-500">Expected Graduation</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-navy-900">{academicInfo.expectedGraduation}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              {/* Password Section */}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              {/* MFA Section */}
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
                {mfaEnabled && (
                  <CardContent>
                    <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-lg border border-teal-200">
                      <Smartphone className="h-5 w-5 text-teal-600" />
                      <div>
                        <p className="text-sm font-medium text-teal-900">Authenticator App Enabled</p>
                        <p className="text-xs text-teal-700">Connected to Google Authenticator</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Active Sessions */}
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
                        <TableHead className="text-gray-500 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeSessions.map((session, index) => (
                        <TableRow key={index} className="border-gray-100">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Monitor className="h-4 w-4 text-gray-400" />
                              <span className="font-medium text-navy-900">{session.device}</span>
                              {session.current && (
                                <Badge className="bg-teal-100 text-teal-700 text-[10px]">Current</Badge>
                              )}
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
                            {!session.current && (
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
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
