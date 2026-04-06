import { NextRequest, NextResponse } from "next/server"
import {
  deleteStudentNotification,
  getStudentNotifications,
  markAllStudentNotificationsRead,
  markStudentNotificationRead,
} from "@/lib/unichain/service"
import { getSessionClaimsFromRequest } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  const claims = await getSessionClaimsFromRequest(request)
  const studentId = claims?.sub

  if (!studentId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const notifications = await getStudentNotifications(studentId)
  return NextResponse.json({ notifications })
}

export async function PATCH(request: NextRequest) {
  try {
    const claims = await getSessionClaimsFromRequest(request)
    const studentId = claims?.sub
    
    if (!studentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
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
    const claims = await getSessionClaimsFromRequest(request)
    const studentId = claims?.sub
    
    if (!studentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = request.nextUrl.searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Notification id is required." }, { status: 400 })
    }
    const notification = await deleteStudentNotification(id, studentId)
    return NextResponse.json({ notification })
  } catch {
    return NextResponse.json({ error: "Failed to delete notification." }, { status: 500 })
  }
}
