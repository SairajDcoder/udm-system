"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bell,
  GraduationCap,
  FileText,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Filter,
  CheckCheck,
  Trash2,
} from "lucide-react"

// Sample Notifications
const initialNotifications = [
  {
    id: 1,
    type: "grade",
    title: "New Grade Posted",
    body: "Your grade for CS401 - Machine Learning has been posted. You received an A.",
    timestamp: "2 hours ago",
    read: false,
    icon: GraduationCap,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
  {
    id: 2,
    type: "transcript",
    title: "Transcript Ready",
    body: "Your transcript request #TR-2026-0042 is ready for download.",
    timestamp: "5 hours ago",
    read: false,
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: 3,
    type: "access",
    title: "New Access Request",
    body: "Stanford University has requested access to verify your academic records.",
    timestamp: "1 day ago",
    read: false,
    icon: Shield,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    id: 4,
    type: "deadline",
    title: "Upcoming Deadline",
    body: "Reminder: ML Project Submission is due in 4 days (Apr 5, 2026).",
    timestamp: "1 day ago",
    read: true,
    icon: Clock,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    id: 5,
    type: "system",
    title: "Credential Verified",
    body: "Your AWS Cloud Practitioner certification has been successfully verified on the blockchain.",
    timestamp: "2 days ago",
    read: true,
    icon: CheckCircle2,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: 6,
    type: "alert",
    title: "Access Grant Expiring",
    body: "Your access grant to Google Inc. will expire in 7 days. Consider renewing if needed.",
    timestamp: "3 days ago",
    read: true,
    icon: AlertTriangle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    id: 7,
    type: "system",
    title: "Profile Update Approved",
    body: "Your request to update your phone number has been approved and processed.",
    timestamp: "4 days ago",
    read: true,
    icon: Info,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
  {
    id: 8,
    type: "grade",
    title: "Semester Results Published",
    body: "Fall 2025 semester results have been published. Your semester GPA is 3.78.",
    timestamp: "1 week ago",
    read: true,
    icon: GraduationCap,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [filter, setFilter] = useState("all")

  const unreadCount = notifications.filter(n => !n.read).length

  const filteredNotifications = notifications.filter(n => {
    if (filter === "all") return true
    if (filter === "unread") return !n.read
    return n.type === filter
  })

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter:</span>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="unread">Unread Only</SelectItem>
                  <SelectItem value="grade">Grades</SelectItem>
                  <SelectItem value="transcript">Transcripts</SelectItem>
                  <SelectItem value="access">Access Requests</SelectItem>
                  <SelectItem value="deadline">Deadlines</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <Badge className="bg-teal-100 text-teal-700">
                  {unreadCount} unread
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="text-sm"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg text-navy-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-teal-500" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No notifications to display</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => {
                const Icon = notification.icon
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 rounded-lg transition-colors cursor-pointer group ${
                      notification.read 
                        ? "bg-white hover:bg-gray-50" 
                        : "bg-teal-50/50 hover:bg-teal-50"
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    {/* Icon Circle */}
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${notification.iconBg}`}>
                      <Icon className={`h-6 w-6 ${notification.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-medium ${notification.read ? "text-gray-700" : "text-navy-900"}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-teal-500 shrink-0" />
                          )}
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{notification.timestamp}</span>
                      </div>
                      <p className={`text-sm mt-1 ${notification.read ? "text-gray-500" : "text-gray-600"}`}>
                        {notification.body}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
