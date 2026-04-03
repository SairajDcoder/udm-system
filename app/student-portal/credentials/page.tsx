"use client"

import { useEffect, useState } from "react"
import { Award, Calendar, CheckCircle2, ExternalLink, FileCheck, GraduationCap, Link2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type Credential = {
  id: string
  type: "degree" | "transcript" | "certificate" | "achievement"
  title: string
  issuer: string
  issueDate: string
  expiryDate: string | null
  status: "active" | "revoked"
  vScore: number
  hashId: string
  description: string
  blockchain: string
}

function VScoreMeter({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 28
  const strokeDashoffset = circumference - (score / 100) * circumference
  const tone = score >= 90 ? "text-teal-500" : score >= 70 ? "text-blue-500" : "text-amber-500"

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" fill="none" className="text-gray-200" />
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          className={tone}
          style={{ strokeDasharray: circumference, strokeDashoffset }}
        />
      </svg>
      <div className="absolute">
        <span className={`text-lg font-heading font-bold ${tone}`}>{score}</span>
      </div>
    </div>
  )
}

function getCredentialStyle(type: Credential["type"]) {
  switch (type) {
    case "degree":
      return { label: "Degree", icon: GraduationCap, color: "bg-teal-500" }
    case "achievement":
      return { label: "Achievement", icon: Award, color: "bg-amber-500" }
    default:
      return { label: "Credential", icon: FileCheck, color: "bg-blue-500" }
  }
}

function CredentialCard({ credential }: { credential: Credential }) {
  const style = getCredentialStyle(credential.type)
  const Icon = style.icon

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer overflow-hidden border-gray-200 shadow-sm transition-all hover:shadow-md">
          <div className={`h-2 w-full ${style.color}`} />
          <CardContent className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${style.color} bg-opacity-10`}>
                <Icon className={`h-7 w-7 ${style.color.replace("bg-", "text-")}`} />
              </div>
              <Badge className="flex items-center gap-1 rounded-full bg-navy-900 text-white">
                <Link2 className="h-3 w-3" />
                {credential.blockchain}
              </Badge>
            </div>

            <h3 className="mb-2 line-clamp-2 font-heading text-lg font-semibold text-navy-900 transition-colors group-hover:text-teal-600">
              {credential.title}
            </h3>

            <Badge variant="secondary" className="mb-4 rounded-full bg-gray-100 text-gray-600">
              {style.label}
            </Badge>

            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Issued: {new Date(credential.issueDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
              </div>
              <p className="text-sm text-gray-500">{credential.issuer}</p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">V-Score</span>
                <VScoreMeter score={credential.vScore} />
              </div>
              <Badge className="flex items-center gap-1 rounded-full bg-teal-100 text-teal-700">
                <CheckCircle2 className="h-3 w-3" />
                {credential.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className={`-mx-6 -mt-6 mb-4 h-2 w-full rounded-t-lg ${style.color}`} />
          <DialogTitle className="font-heading text-xl text-navy-900">{credential.title}</DialogTitle>
          <DialogDescription>{style.label} issued by {credential.issuer}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">{credential.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Issue Date</p>
              <p className="text-sm font-medium text-navy-900">{new Date(credential.issueDate).toLocaleDateString()}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Expiry Date</p>
              <p className="text-sm font-medium text-navy-900">{credential.expiryDate ? new Date(credential.expiryDate).toLocaleDateString() : "No Expiry"}</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div>
              <p className="text-sm font-medium text-navy-900">Verification Score</p>
              <p className="text-xs text-gray-500">Calculated from blockchain proof checks</p>
            </div>
            <VScoreMeter score={credential.vScore} />
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Blockchain Hash</p>
            <code className="mt-2 block break-all font-mono text-xs text-navy-900">{credential.hashId}</code>
          </div>

          <Button className="w-full bg-teal-500 text-white hover:bg-teal-600" asChild>
            <a href={`/verify/result?hash=${encodeURIComponent(credential.hashId)}&status=valid`}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Verification View
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([])

  useEffect(() => {
    fetch("/api/student/credentials")
      .then((response) => response.json())
      .then((payload) => setCredentials(payload.credentials))
      .catch(() => setCredentials([]))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy-900">Credential Wallet</h1>
        <p className="text-gray-500">Blockchain-backed credentials issued by the UniChain academic workflow</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {credentials.map((credential) => (
          <CredentialCard key={credential.id} credential={credential} />
        ))}
      </div>
    </div>
  )
}
