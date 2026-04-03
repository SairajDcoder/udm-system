"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle2, XCircle, Loader2, ArrowLeft, Copy } from "lucide-react"

type VerificationReport = {
  status: "valid" | "invalid"
  vScore: number
  holderName: string | null
  issuer: string | null
  issueDate: string | null
  reasonCodes: string[]
  credential: {
    id: string
    title: string
    type: string
    cid: string
    hashId: string
  } | null
  checks: {
    hashMatch: boolean
    signatureValid: boolean
    timestampFresh: boolean
    accessGranted: boolean
  }
  blockchainProof: {
    transactionHash: string
    blockNumber: number
    network: string
    contractAddress: string
    gasUsed: number
    timestamp: string
  } | null
}

export default function VerificationResultPage() {
  const searchParams = useSearchParams()
  const hash = searchParams.get("hash") ?? ""
  const [report, setReport] = useState<VerificationReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadReport() {
      if (!hash) {
        setError("No hash provided for verification.")
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/credential/verify/${encodeURIComponent(hash)}?method=hash`, {
          cache: "no-store",
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Verification failed.")
        }
        setReport(data)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Verification failed.")
      } finally {
        setLoading(false)
      }
    }
    void loadReport()
  }, [hash])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verifying credential...
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-4">
          <Card className="border-error/30 bg-error/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-error" />
                <div>
                  <p className="font-medium text-error">Verification could not be completed</p>
                  <p className="mt-1 text-sm text-muted-foreground">{error ?? "Unknown error"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Button asChild variant="outline">
            <Link href="/verifier-portal">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Verifier Portal
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const valid = report.status === "valid"

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className={valid ? "rounded-xl bg-success px-4 py-3 text-success-foreground" : "rounded-xl bg-error px-4 py-3 text-error-foreground"}>
          <div className="flex items-center gap-2">
            {valid ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            <p className="font-medium">
              {valid ? "Credential Verified Successfully" : "Verification Failed"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link href="/verifier-portal" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            New Verification
          </Link>
          <Badge variant="outline" className="font-mono">
            V-Score: {report.vScore}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Verification Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Credential Hash</p>
              <div className="mt-1 flex items-center gap-2">
                <code className="max-w-[340px] truncate rounded bg-muted px-2 py-1 text-xs">{hash}</code>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigator.clipboard.writeText(hash)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Holder</p>
              <p className="font-medium">{report.holderName ?? "Unknown"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Credential</p>
              <p className="font-medium">{report.credential?.title ?? "Not found"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Issuer</p>
              <p className="font-medium">{report.issuer ?? "Unknown"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Issue Date</p>
              <p className="font-medium">{report.issueDate ? new Date(report.issueDate).toLocaleDateString() : "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge className={valid ? "bg-success/20 text-success border-success/30" : "bg-error/20 text-error border-error/30"}>
                {report.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Checks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(report.checks).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                <span className="text-sm">{key}</span>
                <Badge className={value ? "bg-success/20 text-success border-success/30" : "bg-error/20 text-error border-error/30"}>
                  {value ? "pass" : "fail"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Blockchain Proof</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {report.blockchainProof ? (
              <>
                <p>Network: <span className="font-medium">{report.blockchainProof.network}</span></p>
                <p>Block: <span className="font-mono">{report.blockchainProof.blockNumber}</span></p>
                <p className="break-all">Transaction: <span className="font-mono">{report.blockchainProof.transactionHash}</span></p>
                <p className="break-all">Contract: <span className="font-mono">{report.blockchainProof.contractAddress}</span></p>
              </>
            ) : (
              <p className="text-muted-foreground">No blockchain proof available for this hash.</p>
            )}
            {report.reasonCodes.length > 0 ? (
              <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
                <p className="text-sm font-medium text-warning">Reason Codes</p>
                <p className="mt-1 text-xs text-warning">{report.reasonCodes.join(", ")}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
