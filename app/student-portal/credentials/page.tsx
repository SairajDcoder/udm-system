"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  GraduationCap,
  Award,
  FileCheck,
  Shield,
  ExternalLink,
  Share2,
  Download,
  Calendar,
  Building2,
  Link2,
  CheckCircle2,
} from "lucide-react"

// V-Score Circular Meter Component
function VScoreMeter({ score }: { score: number }) {
  const percentage = score
  const circumference = 2 * Math.PI * 28
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-teal-500"
    if (score >= 70) return "text-blue-500"
    if (score >= 50) return "text-amber-500"
    return "text-red-500"
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-16 h-16 transform -rotate-90">
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="5"
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          className={getScoreColor(score)}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
            transition: "stroke-dashoffset 0.5s ease-in-out",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-lg font-heading font-bold ${getScoreColor(score)}`}>{score}</span>
      </div>
    </div>
  )
}

// Sample Credentials Data
const credentials = [
  {
    id: 1,
    name: "Bachelor of Science in Computer Science",
    type: "Degree",
    icon: GraduationCap,
    color: "bg-teal-500",
    issuer: "State University",
    issueDate: "May 2026",
    expiryDate: null,
    status: "Active",
    vScore: 98,
    blockchainHash: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    description: "Bachelor of Science degree in Computer Science with a specialization in Artificial Intelligence.",
  },
  {
    id: 2,
    name: "Dean's List Recognition 2025",
    type: "Honor",
    icon: Award,
    color: "bg-amber-500",
    issuer: "State University",
    issueDate: "Dec 2025",
    expiryDate: null,
    status: "Active",
    vScore: 95,
    blockchainHash: "0x8f92c2768ff2fc64c93ed29259b2e76efd3e5c2gb4e788395beef311237e0170",
    description: "Recognition for achieving a GPA of 3.7 or higher during the Fall 2025 semester.",
  },
  {
    id: 3,
    name: "AWS Cloud Practitioner",
    type: "Certification",
    icon: FileCheck,
    color: "bg-orange-500",
    issuer: "Amazon Web Services",
    issueDate: "Aug 2025",
    expiryDate: "Aug 2028",
    status: "Active",
    vScore: 92,
    blockchainHash: "0x9g03d3879gg3gd75d04fe30360c3f87fge4f6d3hc5f899406cffg422348f1281",
    description: "Foundational understanding of AWS Cloud concepts, services, and terminology.",
  },
  {
    id: 4,
    name: "Microsoft Azure Fundamentals",
    type: "Certification",
    icon: FileCheck,
    color: "bg-blue-500",
    issuer: "Microsoft",
    issueDate: "Jun 2025",
    expiryDate: "Jun 2028",
    status: "Active",
    vScore: 88,
    blockchainHash: "0xa014e4980hh4he86e15gf41471d4g98hgf5g7e4id6g900517dgh533459g2392",
    description: "Demonstrates foundational knowledge of cloud services and how those services are provided with Microsoft Azure.",
  },
  {
    id: 5,
    name: "Google Data Analytics Certificate",
    type: "Certification",
    icon: FileCheck,
    color: "bg-green-500",
    issuer: "Google",
    issueDate: "Mar 2025",
    expiryDate: null,
    status: "Active",
    vScore: 91,
    blockchainHash: "0xb125f5a91ii5if97f26hg52582e5ha9ihg6h8f5je7h011628ehi644560h3403",
    description: "Professional certificate in data analytics covering data cleaning, analysis, and visualization.",
  },
  {
    id: 6,
    name: "Hackathon Winner 2024",
    type: "Achievement",
    icon: Award,
    color: "bg-purple-500",
    issuer: "TechCrunch Disrupt",
    issueDate: "Oct 2024",
    expiryDate: null,
    status: "Active",
    vScore: 85,
    blockchainHash: "0xc236g6ba2jj6jga8g37ih63693f6ib0jih7i9g6kf8i122739fij755671i4514",
    description: "First place winner at TechCrunch Disrupt Hackathon 2024 for developing an AI-powered accessibility tool.",
  },
]

// Credential Card Component
function CredentialCard({ credential }: { credential: typeof credentials[0] }) {
  const Icon = credential.icon

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden">
          {/* Top Color Strip */}
          <div className={`h-2 w-full ${credential.color}`} />
          
          <CardContent className="p-6">
            {/* Icon and Badge */}
            <div className="flex items-start justify-between mb-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${credential.color} bg-opacity-10`}>
                <Icon className={`h-7 w-7 ${credential.color.replace('bg-', 'text-')}`} />
              </div>
              <Badge className="bg-navy-900 text-white hover:bg-navy-800 rounded-full flex items-center gap-1">
                <Link2 className="h-3 w-3" />
                Blockchain
              </Badge>
            </div>

            {/* Title */}
            <h3 className="font-heading text-lg font-semibold text-navy-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
              {credential.name}
            </h3>

            {/* Type Badge */}
            <Badge variant="secondary" className="mb-4 bg-gray-100 text-gray-600 rounded-full">
              {credential.type}
            </Badge>

            {/* Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Building2 className="h-4 w-4" />
                <span>{credential.issuer}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Issued: {credential.issueDate}</span>
              </div>
            </div>

            {/* V-Score and Status */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">V-Score</span>
                <VScoreMeter score={credential.vScore} />
              </div>
              <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 rounded-full flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {credential.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      {/* Detail Modal */}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className={`h-2 w-full ${credential.color} -mx-6 -mt-6 mb-4 rounded-t-lg`} />
          <div className="flex items-start gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${credential.color} bg-opacity-10 shrink-0`}>
              <Icon className={`h-7 w-7 ${credential.color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <DialogTitle className="font-heading text-xl text-navy-900">{credential.name}</DialogTitle>
              <DialogDescription className="mt-1">{credential.type} from {credential.issuer}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Description */}
          <p className="text-sm text-gray-600">{credential.description}</p>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Issue Date</p>
              <p className="text-sm font-medium text-navy-900">{credential.issueDate}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Expiry Date</p>
              <p className="text-sm font-medium text-navy-900">{credential.expiryDate || "No Expiry"}</p>
            </div>
          </div>

          {/* V-Score */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-navy-900">Verification Score</p>
              <p className="text-xs text-gray-500">Based on blockchain consensus</p>
            </div>
            <VScoreMeter score={credential.vScore} />
          </div>

          {/* Blockchain Hash */}
          <div className="p-4 bg-navy-900 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">Blockchain Hash</p>
            <code className="font-mono text-xs text-teal-400 break-all">
              {credential.blockchainHash}
            </code>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button className="flex-1 bg-teal-500 hover:bg-teal-600 text-white">
              <Share2 className="h-4 w-4 mr-2" />
              Share Credential
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href={`https://etherscan.io/tx/${credential.blockchainHash}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function CredentialsPage() {
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50">
              <Shield className="h-6 w-6 text-teal-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Credentials</p>
              <p className="text-2xl font-heading font-bold text-navy-900">{credentials.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <FileCheck className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Certifications</p>
              <p className="text-2xl font-heading font-bold text-navy-900">
                {credentials.filter(c => c.type === "Certification").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <Award className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Honors & Awards</p>
              <p className="text-2xl font-heading font-bold text-navy-900">
                {credentials.filter(c => c.type === "Honor" || c.type === "Achievement").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. V-Score</p>
              <p className="text-2xl font-heading font-bold text-navy-900">
                {Math.round(credentials.reduce((sum, c) => sum + c.vScore, 0) / credentials.length)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {credentials.map((credential) => (
          <CredentialCard key={credential.id} credential={credential} />
        ))}
      </div>
    </div>
  )
}
