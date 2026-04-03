import { NextRequest, NextResponse } from "next/server"
import {
  deleteStudentNotification,
  listStudentNotifications,
  markAllStudentNotificationsRead,
  markStudentNotificationRead,
} from "@/lib/unichain/service"

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId") || undefined
  const notifications = await listStudentNotifications(studentId)
  return NextResponse.json({ notifications })
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const studentId = body.studentId
    if (body.markAll) {
      const notifications = await markAllStudentNotificationsRead(studentId)
      return NextResponse.json({ notifications })
    }

    const notification = await markStudentNotificationRead(String(body.id), studentId)
    return NextResponse.json({ notification })
  } catch {
    return NextResponse.json({ error: "Failed to update notification." }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id")
    const studentId = request.nextUrl.searchParams.get("studentId") || undefined
    if (!id) {
      return NextResponse.json({ error: "Notification id is required." }, { status: 400 })
    }
    const notification = await deleteStudentNotification(id, studentId)
    return NextResponse.json({ notification })
  } catch {
    return NextResponse.json({ error: "Failed to delete notification." }, { status: 500 })
  }
}
