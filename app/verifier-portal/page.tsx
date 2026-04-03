"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Search, QrCode, ArrowRight, CheckCircle, Lock, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function VerifierLanding() {
  const router = useRouter()
  const [hashId, setHashId] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleVerify = async () => {
    if (!hashId.trim()) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/credential/verify/${encodeURIComponent(hashId)}?method=hash`, {
        cache: "no-store",
      })
      const result = await response.json()
      const status = response.ok ? result.status ?? "invalid" : "invalid"
      router.push(
        `/verifier-portal/verify/result?hash=${encodeURIComponent(hashId)}&status=${encodeURIComponent(status)}`
      )
    } catch {
      router.push(`/verifier-portal/verify/result?hash=${encodeURIComponent(hashId)}&status=invalid`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Band */}
      <header className="bg-navy h-[25vh] min-h-[200px] flex flex-col">
        <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary-foreground" />
            <span className="font-serif text-xl font-semibold text-navy-foreground">
              VerifyChain
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-navy-foreground hover:text-navy-foreground/80 hover:bg-navy-foreground/10">
              About
            </Button>
            <Button variant="outline" className="border-navy-foreground/30 text-navy-foreground hover:bg-navy-foreground/10">
              Sign In
            </Button>
          </div>
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy-foreground mb-2 text-balance">
            Verify Academic Credentials
          </h1>
          <p className="text-navy-foreground/80 text-lg max-w-xl">
            Instant blockchain-powered verification for university credentials
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center px-4 -mt-16">
        {/* Verification Card */}
        <Card className="w-full max-w-[640px] shadow-xl border-0">
          <CardContent className="p-6 md:p-8">
            <Tabs defaultValue="hash" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="hash" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Enter Hash ID
                </TabsTrigger>
                <TabsTrigger value="qr" className="flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  Scan QR Code
                </TabsTrigger>
              </TabsList>

              <TabsContent value="hash" className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="hash-input" className="text-sm font-medium text-muted-foreground">
                    Credential Hash ID
                  </label>
                  <Input
                    id="hash-input"
                    type="text"
                    placeholder="0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
                    value={hashId}
                    onChange={(e) => setHashId(e.target.value)}
                    className="font-mono text-sm h-14 px-4 bg-muted/50 border-input"
                    onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the unique hash ID found on the credential certificate
                  </p>
                </div>
                <Button
                  onClick={handleVerify}
                  disabled={!hashId.trim() || isLoading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Verify Credential
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="qr" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Camera Viewfinder
                  </label>
                  <div className="aspect-square max-h-[300px] bg-muted/50 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                        {/* Corner markers */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br" />
                        {/* Scan line animation */}
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/50 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Position the QR code within the frame
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  disabled
                >
                  <span className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    Enable Camera Access
                  </span>
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Camera access is required for QR code scanning
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features Section */}
        <section className="w-full max-w-4xl mt-16 mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif font-semibold mb-2">Instant Verification</h3>
              <p className="text-sm text-muted-foreground">
                Get verification results in seconds with our optimized blockchain queries
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-serif font-semibold mb-2">Tamper-Proof</h3>
              <p className="text-sm text-muted-foreground">
                Credentials are immutably stored on the blockchain, ensuring authenticity
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-serif font-semibold mb-2">Trusted Results</h3>
              <p className="text-sm text-muted-foreground">
                V-Score provides a comprehensive trust assessment for each credential
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              VerifyChain University Data Management System
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">API Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
