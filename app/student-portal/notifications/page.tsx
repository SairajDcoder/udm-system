"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell, CheckCheck, Clock, Filter, GraduationCap, Info, Shield, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type NotificationItem = {
  id: string
  title: string
  message: string
  type: "grade" | "credential" | "access" | "transfer" | "system"
  createdAt: string
  read: boolean
}

function getTypeMeta(type: NotificationItem["type"]) {
  if (type === "grade") {
    return { icon: GraduationCap, iconBg: "bg-teal-100", iconColor: "text-teal-600" }
  }
  if (type === "access") {
    return { icon: Shield, iconBg: "bg-purple-100", iconColor: "text-purple-600" }
  }
  if (type === "transfer") {
    return { icon: Clock, iconBg: "bg-amber-100", iconColor: "text-amber-600" }
  }
  return { icon: Info, iconBg: "bg-gray-100", iconColor: "text-gray-600" }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [filter, setFilter] = useState("all")

  const loadNotifications = async () => {
    const response = await fetch("/api/student/notifications")
    const payload = await response.json()
    setNotifications(payload.notifications)
  }

  useEffect(() => {
    loadNotifications().catch(() => setNotifications([]))
  }, [])

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (filter === "all") return true
      if (filter === "unread") return !notification.read
      return notification.type === filter
    })
  }, [filter, notifications])

  const markAsRead = async (id: string) => {
    await fetch("/api/student/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  const markAllAsRead = async () => {
    await fetch("/api/student/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    })
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true }))
    )
  }

  const deleteNotification = async (id: string) => {
    await fetch(`/api/student/notifications?id=${encodeURIComponent(id)}`, { method: "DELETE" })
    setNotifications((current) => current.filter((notification) => notification.id !== id))
  }

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                  <SelectItem value="credential">Credentials</SelectItem>
                  <SelectItem value="access">Access</SelectItem>
                  <SelectItem value="transfer">Transfers</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              {unreadCount > 0 ? <Badge className="bg-teal-100 text-teal-700">{unreadCount} unread</Badge> : null}
              <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all read
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 font-heading text-lg text-navy-900">
            <Bell className="h-5 w-5 text-teal-500" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">No notifications to display</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => {
                const meta = getTypeMeta(notification.type)
                const Icon = meta.icon
                return (
                  <div
                    key={notification.id}
                    className={`group flex cursor-pointer items-start gap-4 rounded-lg p-4 transition-colors ${
                      notification.read ? "bg-white hover:bg-gray-50" : "bg-teal-50/50 hover:bg-teal-50"
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id).catch(() => undefined)
                      }
                    }}
                  >
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${meta.iconBg}`}>
                      <Icon className={`h-6 w-6 ${meta.iconColor}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-sm font-medium ${notification.read ? "text-gray-700" : "text-navy-900"}`}>
                            {notification.title}
                          </h3>
                          {!notification.read ? <span className="h-2 w-2 shrink-0 rounded-full bg-teal-500" /> : null}
                        </div>
                        <span className="shrink-0 text-xs text-gray-400">
                          {new Date(notification.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className={`mt-1 text-sm ${notification.read ? "text-gray-500" : "text-gray-600"}`}>
                        {notification.message}
                      </p>
                    </div>

                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        onClick={(event) => {
                          event.stopPropagation()
                          deleteNotification(notification.id).catch(() => undefined)
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
