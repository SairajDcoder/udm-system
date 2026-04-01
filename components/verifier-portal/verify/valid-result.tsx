"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Shield,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  User,
  GraduationCap,
  Calendar,
  Building,
  FileText,
  Hash,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { VScoreGauge } from "@/components/verifier-portal/v-score-gauge"
import { cn } from "@/lib/utils"

interface ValidResultProps {
  hash: string
}

// Mock data for demonstration
const mockCredential = {
  holderName: "Sarah Mitchell",
  credentialType: "Bachelor of Science in Computer Science",
  institution: "Stanford University",
  issueDate: "2024-05-15",
  expiryDate: null,
  credentialId: "CRED-2024-CS-00847",
  vScore: 98,
}

const mockBlockchainProof = {
  transactionHash: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
  blockNumber: 18456789,
  timestamp: "2024-05-15T14:32:00Z",
  network: "Ethereum Mainnet",
  contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
  gasUsed: 45231,
}

const verificationChecklist = [
  { label: "Digital Signature Valid", status: "verified" },
  { label: "Institution Verified", status: "verified" },
  { label: "Credential Not Revoked", status: "verified" },
]

const signatories = [
  { name: "Dr. James Parker", role: "Dean of Engineering", verified: true },
  { name: "Prof. Linda Chen", role: "Department Chair", verified: true },
  { name: "University Registrar", role: "Official Certifier", verified: true },
]

export function ValidResult({ hash }: ValidResultProps) {
  const [isBlockchainOpen, setIsBlockchainOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Success Banner */}
      <div className="bg-success text-success-foreground py-4">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-center gap-3">
          <CheckCircle className="h-6 w-6" />
          <span className="font-serif font-semibold text-lg">Credential Verified Successfully</span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-navy py-4">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-navy-foreground" />
            <span className="font-serif text-lg font-semibold text-navy-foreground">VerifyChain</span>
          </Link>
          <Button variant="outline" size="sm" asChild className="border-navy-foreground/30 text-navy-foreground hover:bg-navy-foreground/10">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              New Verification
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* V-Score Section */}
        <div className="flex flex-col items-center mb-8">
          <VScoreGauge score={mockCredential.vScore} size="lg" />
          <p className="text-muted-foreground mt-4 text-center max-w-md">
            This credential has passed all verification checks and is confirmed authentic.
          </p>
        </div>

        {/* Credential Details Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Holder Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">Full Name</span>
                <p className="font-medium">{mockCredential.holderName}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Credential ID</span>
                <p className="font-mono text-sm">{mockCredential.credentialId}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Credential Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">Credential Type</span>
                <p className="font-medium">{mockCredential.credentialType}</p>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{mockCredential.institution}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">Issue Date</span>
                <p className="font-medium">{new Date(mockCredential.issueDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Expiry Date</span>
                <p className="font-medium">{mockCredential.expiryDate || "No Expiration"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                Hash Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <span className="text-sm text-muted-foreground">Credential Hash</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="font-mono text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                    {hash || mockBlockchainProof.transactionHash}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(hash || mockBlockchainProof.transactionHash)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copied && <span className="text-xs text-success mt-1 block">Copied!</span>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Checklist */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Verification Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {verificationChecklist.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 px-4 bg-success/5 rounded-lg border border-success/20"
                >
                  <span className="font-medium">{item.label}</span>
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Blockchain Proof Collapsible */}
        <Collapsible open={isBlockchainOpen} onOpenChange={setIsBlockchainOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="font-serif text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Blockchain Proof
                  </span>
                  {isBlockchainOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </CardTitle>
              </CollapsibleTrigger>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="grid md:grid-cols-2 gap-4 bg-muted/30 rounded-lg p-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Transaction Hash</span>
                    <p className="font-mono text-xs break-all">{mockBlockchainProof.transactionHash}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Block Number</span>
                    <p className="font-mono">{mockBlockchainProof.blockNumber.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Network</span>
                    <p className="font-medium">{mockBlockchainProof.network}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Timestamp</span>
                    <p className="font-medium">
                      {new Date(mockBlockchainProof.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-sm text-muted-foreground">Contract Address</span>
                    <p className="font-mono text-xs break-all">{mockBlockchainProof.contractAddress}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <a
                    href={`https://etherscan.io/tx/${mockBlockchainProof.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Etherscan
                  </a>
                </Button>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Signature Cards */}
        <section className="mt-8">
          <h2 className="font-serif text-xl font-semibold mb-4">Digital Signatures</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {signatories.map((signatory, index) => (
              <Card key={index} className="min-w-[250px] flex-shrink-0">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{signatory.name}</p>
                      <p className="text-sm text-muted-foreground">{signatory.role}</p>
                    </div>
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      signatory.verified ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    )}>
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground">Signature Status</span>
                    <p className="text-sm font-medium text-success">Verified</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
