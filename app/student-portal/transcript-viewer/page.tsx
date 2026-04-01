"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileText,
  Shield,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react"

// V-Score Circular Meter Component
function VScoreMeter({ score }: { score: number }) {
  const percentage = score
  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx="48"
          cy="48"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          className="text-teal-500"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
            transition: "stroke-dashoffset 0.5s ease-in-out",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-heading font-bold text-teal-600">{score}</span>
        <span className="text-xs text-gray-500">V-Score</span>
      </div>
    </div>
  )
}

function HashDisplay({ label, hash }: { label: string; hash: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">{label}</p>
      <div className="flex items-center gap-2 p-2 bg-navy-900 rounded-lg">
        <code className="font-mono text-xs text-teal-400 flex-1 truncate">
          {hash}
        </code>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-400 hover:text-white hover:bg-navy-700 shrink-0"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
    </div>
  )
}

// Sample Transcripts
const transcripts = [
  { id: "TR-2026-0042", name: "Official Transcript - Graduate Application", date: "Mar 28, 2026" },
  { id: "TR-2026-0025", name: "Official Transcript - Internship", date: "Mar 1, 2026" },
  { id: "TR-2025-0089", name: "Mid-Semester Transcript", date: "Nov 15, 2025" },
]

export default function TranscriptViewerPage() {
  const [selectedTranscript, setSelectedTranscript] = useState(transcripts[0].id)
  const [zoom, setZoom] = useState(100)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-180px)] min-h-[600px]">
      {/* PDF Preview - 60% */}
      <Card className="lg:col-span-3 border-gray-200 shadow-sm flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-teal-500" />
            <Select value={selectedTranscript} onValueChange={setSelectedTranscript}>
              <SelectTrigger className="w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transcripts.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setZoom(Math.max(50, zoom - 10))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 w-12 text-center">{zoom}%</span>
            <Button variant="outline" size="icon" onClick={() => setZoom(Math.min(150, zoom + 10))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-auto bg-gray-100">
          {/* PDF Preview Placeholder */}
          <div 
            className="m-6 bg-white rounded-lg shadow-lg mx-auto"
            style={{ 
              width: `${(595 * zoom) / 100}px`, 
              minHeight: `${(842 * zoom) / 100}px`,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
          >
            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="text-center border-b border-gray-200 pb-6">
                <h2 className="font-heading text-2xl font-bold text-navy-900">STATE UNIVERSITY</h2>
                <p className="text-sm text-gray-500 mt-1">Office of the Registrar</p>
                <p className="text-lg font-semibold text-navy-900 mt-4">OFFICIAL ACADEMIC TRANSCRIPT</p>
              </div>

              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Student Name</p>
                  <p className="font-medium text-navy-900">Alex Kumar</p>
                </div>
                <div>
                  <p className="text-gray-500">Student ID</p>
                  <p className="font-mono font-medium text-navy-900">CS-2024-0892</p>
                </div>
                <div>
                  <p className="text-gray-500">Program</p>
                  <p className="font-medium text-navy-900">B.Sc. Computer Science</p>
                </div>
                <div>
                  <p className="text-gray-500">Issue Date</p>
                  <p className="font-medium text-navy-900">March 28, 2026</p>
                </div>
              </div>

              {/* Academic Summary */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-navy-900 mb-3">Academic Summary</h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-gray-500">CGPA</p>
                    <p className="text-xl font-bold text-teal-600">3.72</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-gray-500">Credits</p>
                    <p className="text-xl font-bold text-navy-900">124</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-gray-500">Semesters</p>
                    <p className="text-xl font-bold text-navy-900">7</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-gray-500">Standing</p>
                    <p className="text-xl font-bold text-navy-900">Good</p>
                  </div>
                </div>
              </div>

              {/* Sample Course List */}
              <div>
                <h3 className="font-semibold text-navy-900 mb-3">Fall 2025 Semester</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-500">Course</th>
                      <th className="text-center py-2 text-gray-500">Credits</th>
                      <th className="text-center py-2 text-gray-500">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2">CS401 - Machine Learning</td>
                      <td className="text-center">4</td>
                      <td className="text-center font-medium">A</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2">CS402 - Distributed Systems</td>
                      <td className="text-center">3</td>
                      <td className="text-center font-medium">A-</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2">CS403 - Computer Networks</td>
                      <td className="text-center">3</td>
                      <td className="text-center font-medium">B+</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer with Blockchain Badge */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-teal-500" />
                  <span className="text-xs text-gray-500">Blockchain Verified Document</span>
                </div>
                <Badge className="bg-teal-100 text-teal-700">Verified</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Panel - 40% */}
      <Card className="lg:col-span-2 border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="font-heading text-lg text-navy-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-teal-500" />
            Verification Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Verification Status */}
          <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg border border-teal-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-teal-600" />
              <div>
                <p className="font-medium text-teal-900">Document Verified</p>
                <p className="text-xs text-teal-700">Blockchain authenticated</p>
              </div>
            </div>
            <Badge className="bg-teal-600 text-white hover:bg-teal-600">Valid</Badge>
          </div>

          {/* V-Score */}
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <VScoreMeter score={98} />
            <p className="text-sm text-gray-600 mt-3">
              Verification confidence based on blockchain consensus and issuer reputation.
            </p>
          </div>

          {/* Blockchain Details */}
          <div className="space-y-4">
            <HashDisplay 
              label="Document Hash (SHA-256)"
              hash="0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
            />
            <HashDisplay 
              label="Transaction Hash"
              hash="0x8a92c2768ff2fc64c93ed29259b2e76efd3e5c2gb4e788395beef311237e0170"
            />
            <HashDisplay 
              label="IPFS CID"
              hash="QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
            />
          </div>

          {/* BLS Signature Status */}
          <div className="p-4 bg-navy-900 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white">BLS Signature</p>
              <Badge className="bg-teal-500 text-white hover:bg-teal-500">Valid</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Issuer</span>
                <span className="text-white">State University Registrar</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Signed At</span>
                <span className="text-white">Mar 28, 2026 14:32 UTC</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Block Number</span>
                <span className="font-mono text-teal-400">#18,234,567</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button className="bg-teal-500 hover:bg-teal-600 text-white">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          <Button variant="outline" className="w-full" asChild>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Block Explorer
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
