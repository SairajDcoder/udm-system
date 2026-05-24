import { Credential, GradeRecord } from "@/lib/unichain/types"

const AI_SERVICE_URL = "http://127.0.0.1:5001"

export async function fetchSmartVerify(credential: Credential) {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/api/smart-verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credential }),
    })

    if (!res.ok) {
      console.warn("AI Service smart-verify returned status", res.status)
      return null
    }

    const data = await res.json()
    if (!data.success) {
      console.warn("AI Service smart-verify failed:", data.error)
      return null
    }

    return data.verification as {
      ai_trust_score: number
      ml_confidence: number
      rule_score: number
      risk_level: string
      checks: Record<string, boolean>
      recommendation: string
      details: string[]
    }
  } catch (error) {
    console.error("Could not reach AI Service for smart-verify:", error)
    return null
  }
}

export async function fetchFraudDetection(records: Partial<GradeRecord>[]) {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/api/fraud-detection`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ records }),
    })

    if (!res.ok) {
      console.warn("AI Service fraud-detection returned status", res.status)
      return null
    }

    const data = await res.json()
    if (!data.success) {
      console.warn("AI Service fraud-detection failed:", data.error)
      return null
    }

    return {
      total_records: data.total_records,
      anomalies_found: data.anomalies_found,
      results: data.results,
      summary: data.summary,
    }
  } catch (error) {
    console.error("Could not reach AI Service for fraud-detection:", error)
    return null
  }
}
