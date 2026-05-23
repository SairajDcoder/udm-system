"use client"

import { useEffect, useState } from "react"
import type { User, Course, GradeRecord, TranscriptRequest, CreditTransferRequest } from "@/lib/unichain/types"

export interface FacultyWorkspaceData {
  faculty: User | null
  courses: Course[]
  students: User[]
  grades: GradeRecord[]
  pendingTranscriptRequests: TranscriptRequest[]
  degreeCandidates: User[]
  transfers: CreditTransferRequest[]
}

export function useFacultyWorkspace() {
  const [data, setData] = useState<FacultyWorkspaceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    setLoading(true)
    setError(null)

    fetch("/api/faculty/workspace", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load faculty workspace (${response.status})`)
        }
        return (await response.json()) as FacultyWorkspaceData
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
          setError(requestError instanceof Error ? requestError.message : "Failed to load faculty workspace")
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  return { data, loading, error }
}
