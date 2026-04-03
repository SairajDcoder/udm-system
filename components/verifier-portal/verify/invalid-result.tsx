"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Shield,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowLeft,
  HelpCircle,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { VScoreGauge } from "@/components/verifier-portal/v-score-gauge"

interface InvalidResultProps {
  hash: string
}

const failureReasons = [
  {
    code: "ERR_HASH_MISMATCH",
    title: "Hash Mismatch Detected",
    description: "The credential hash does not match any registered credentials in the blockchain.",
    severity: "critical",
  },
  {
    code: "ERR_SIGNATURE_INVALID",
    title: "Digital Signature Invalid",
    description: "The cryptographic signature on this credential could not be verified.",
    severity: "critical",
  },
  {
    code: "ERR_ISSUER_UNVERIFIED",
    title: "Issuer Not Verified",
    description: "The issuing institution is not registered in the verification network.",
    severity: "warning",
  },
]

const explanations = [
  {
    question: "What does this mean?",
    answer: "This credential could not be verified against our blockchain records. This may indicate that the credential was not issued through our system, has been tampered with, or the hash was entered incorrectly.",
  },
  {
    question: "What should I do?",
    answer: "First, double-check that you entered the hash correctly. If the problem persists, contact the credential holder or issuing institution to verify the authenticity of the credential through alternative means.",
  },
  {
    question: "Is this credential definitely fake?",
    answer: "Not necessarily. A failed verification may also occur if the credential was issued before the blockchain system was implemented, or if there are technical issues. We recommend contacting the issuing institution directly.",
  },
]

export function InvalidResult({ hash }: InvalidResultProps) {
  const [isExplanationOpen, setIsExplanationOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Error Banner */}
      <div className="bg-destructive text-destructive-foreground py-4">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-center gap-3">
          <XCircle className="h-6 w-6" />
          <span className="font-serif font-semibold text-lg">Verification Failed</span>
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
          <VScoreGauge score={0} size="lg" />
          <p className="text-muted-foreground mt-4 text-center max-w-md">
            This credential could not be verified. Please review the failure details below.
          </p>
        </div>

        {/* Hash Display */}
        <Card className="mb-8 border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">Submitted Hash</h3>
                <code className="font-mono text-sm bg-muted px-3 py-2 rounded block break-all">
                  {hash || "No hash provided"}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Failure Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Failure Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {failureReasons.map((reason, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 py-4 px-4 bg-destructive/5 rounded-lg border border-destructive/20"
                >
                  <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <XCircle className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{reason.title}</span>
                      <span className="text-xs font-mono px-2 py-0.5 bg-destructive/10 text-destructive rounded">
                        {reason.code}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plain Language Explanation */}
        <Collapsible open={isExplanationOpen} onOpenChange={setIsExplanationOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="font-serif text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Understanding This Result
                  </span>
                  {isExplanationOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-6">
                  {explanations.map((item, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-foreground mb-2">{item.question}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Another Verification
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="mailto:support@verifychain.edu">
              Contact Support
            </a>
          </Button>
        </div>
      </main>
    </div>
  )
}
