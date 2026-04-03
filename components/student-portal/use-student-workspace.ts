"use client"

import { useEffect, useState } from "react"
import type {
  AccessGrant,
  Course,
  CreditTransferRequest,
  Credential,
  GradeRecord,
  Notification,
  TranscriptRequest,
  User,
} from "@/lib/unichain/types"

export interface StudentWorkspaceData {
  student: User
  cgpa: number
  creditsEarned: number
  grades: GradeRecord[]
  credentials: Credential[]
  transcriptRequests: TranscriptRequest[]
  accessGrants: AccessGrant[]
  transfers: CreditTransferRequest[]
  notifications: Notification[]
  courses: Course[]
}

export function useStudentWorkspace() {
  const [data, setData] = useState<StudentWorkspaceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    setLoading(true)
    setError(null)

    fetch("/api/student/workspace", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load student workspace (${response.status})`)
        }
        return (await response.json()) as StudentWorkspaceData
      })
      .then((payload) => {
        if (mounted) {
          setData(payload)
          setLoading(false)
        }
      })
      .catch((requestError: unknown) => {
        if (mounted) {
          setData(null)
          setError(requestError instanceof Error ? requestError.message : "Failed to load student workspace")
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return { data, loading, error }
}
