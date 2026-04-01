'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Search,
  Filter,
  Upload,
  Plus,
  FileText,
  Lock,
  Unlock,
  Globe,
  ExternalLink,
  Database,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Sample research papers
const researchPapers = [
  {
    id: 'RP001',
    title: 'Blockchain-Based Credential Verification in Higher Education',
    authors: ['Dr. Sarah Johnson', 'Prof. Michael Chen'],
    doi: '10.1234/uni.2026.001',
    uploadDate: '2026-03-15',
    accessLevel: 'public',
    ipfsHash: 'QmX7b9f3k2a8c1d4e5g6h7j8k9l0m1n2o3p4q5r6s7t8u9v0w',
    txHash: '0x7f9e8d7c6b5a4e3f2d1c0b9a8e7f6d5c4b3a2e1f',
    citations: 12,
    downloads: 156,
  },
  {
    id: 'RP002',
    title: 'Machine Learning Applications in Academic Performance Prediction',
    authors: ['Dr. Emily White', 'Dr. Sarah Johnson'],
    doi: '10.1234/uni.2026.002',
    uploadDate: '2026-02-28',
    accessLevel: 'restricted',
    ipfsHash: 'QmY8c0g4l3b9d2e6f7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2',
    txHash: '0x2a8b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    citations: 8,
    downloads: 89,
  },
  {
    id: 'RP003',
    title: 'Decentralized Identity Management for Educational Institutions',
    authors: ['Prof. David Lee', 'Dr. Carol Davis'],
    doi: '10.1234/uni.2026.003',
    uploadDate: '2026-02-10',
    accessLevel: 'public',
    ipfsHash: 'QmZ9d1h5m4c0e3f7g8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3',
    txHash: '0x5c3d7a2b9e8f1c4d5a6b7c8d9e0f1a2b3c4d5e6f',
    citations: 15,
    downloads: 234,
  },
  {
    id: 'RP004',
    title: 'Smart Contracts for Academic Credit Transfer',
    authors: ['Dr. Frank Miller'],
    doi: '10.1234/uni.2026.004',
    uploadDate: '2026-01-20',
    accessLevel: 'private',
    ipfsHash: 'QmA0e2i6n5d1f4g8h9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4',
    txHash: '0x8e1f4d5c6b7a8e9f0a1b2c3d4e5f6a7b8c9d0e1f',
    citations: 3,
    downloads: 45,
  },
]

function getAccessLevelBadge(level: string) {
  switch (level) {
    case 'public':
      return (
        <Badge className="bg-success text-white border-0">
          <Globe className="mr-1 h-3 w-3" />
          Public
        </Badge>
      )
    case 'restricted':
      return (
        <Badge className="bg-gold text-navy-900 border-0">
          <Users className="mr-1 h-3 w-3" />
          Restricted
        </Badge>
      )
    case 'private':
      return (
        <Badge className="bg-navy-600 text-white border-0">
          <Lock className="mr-1 h-3 w-3" />
          Private
        </Badge>
      )
    default:
      return <Badge variant="outline">{level}</Badge>
  }
}

export default function ResearchDataPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const filteredPapers = researchPapers.filter(
    (paper) =>
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      paper.doi.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      console.log('File dropped:', files[0].name)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">Research Data Management</h1>
          <p className="text-navy-500">Manage research papers and IPFS storage</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-navy-700 hover:bg-navy-800">
              <Plus className="mr-2 h-4 w-4" />
              Upload Paper
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">Upload Research Paper</DialogTitle>
              <DialogDescription>
                Upload your research paper to IPFS and record it on the blockchain
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Paper Title</Label>
                <Input
                  id="title"
                  placeholder="Enter the paper title"
                  className="border-navy-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="authors">Authors (comma separated)</Label>
                <Input
                  id="authors"
                  placeholder="Dr. John Doe, Prof. Jane Smith"
                  className="border-navy-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doi">DOI (Optional)</Label>
                <Input
                  id="doi"
                  placeholder="10.1234/example.2026.001"
                  className="border-navy-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="access">Access Level</Label>
                <Select defaultValue="public">
                  <SelectTrigger className="border-navy-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Public
                      </div>
                    </SelectItem>
                    <SelectItem value="restricted">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Restricted (Institution Only)
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Private
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Paper File (PDF)</Label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    'rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
                    isDragging
                      ? 'border-gold bg-gold/10'
                      : 'border-navy-200 hover:border-navy-400'
                  )}
                >
                  <Upload className={cn('mx-auto h-8 w-8', isDragging ? 'text-gold' : 'text-navy-400')} />
                  <p className="mt-2 text-sm font-medium text-navy-900">
                    Drag and drop your PDF here
                  </p>
                  <p className="text-xs text-navy-500">
                    or <span className="text-navy-700 underline">click to browse</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="abstract">Abstract (Optional)</Label>
                <Textarea
                  id="abstract"
                  placeholder="Enter the paper abstract..."
                  className="border-navy-200 min-h-[100px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-navy-700 hover:bg-navy-800">
                <Upload className="mr-2 h-4 w-4" />
                Upload to IPFS
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-navy-100 p-2">
                <FileText className="h-5 w-5 text-navy-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">{researchPapers.length}</p>
                <p className="text-xs text-navy-500">Total Papers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <Globe className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">
                  {researchPapers.filter(p => p.accessLevel === 'public').length}
                </p>
                <p className="text-xs text-navy-500">Public Papers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gold/10 p-2">
                <Database className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">
                  {researchPapers.reduce((acc, p) => acc + p.citations, 0)}
                </p>
                <p className="text-xs text-navy-500">Total Citations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-navy-600/10 p-2">
                <Upload className="h-5 w-5 text-navy-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy-900">
                  {researchPapers.reduce((acc, p) => acc + p.downloads, 0)}
                </p>
                <p className="text-xs text-navy-500">Total Downloads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <Input
                placeholder="Search by title, author, or DOI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-navy-200"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px] border-navy-200">
                <SelectValue placeholder="Access Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Access</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-navy-200 text-navy-600">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Repository Table */}
      <Card className="rounded-[12px] border-navy-100">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg">Research Repository</CardTitle>
          <CardDescription>All uploaded research papers with IPFS storage</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-navy-50 hover:bg-navy-50">
                <TableHead className="font-semibold text-navy-700">Title</TableHead>
                <TableHead className="font-semibold text-navy-700">Authors</TableHead>
                <TableHead className="font-semibold text-navy-700">DOI</TableHead>
                <TableHead className="font-semibold text-navy-700">Access</TableHead>
                <TableHead className="font-semibold text-navy-700">IPFS Hash</TableHead>
                <TableHead className="font-semibold text-navy-700">Tx Hash</TableHead>
                <TableHead className="font-semibold text-navy-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPapers.map((paper) => (
                <TableRow key={paper.id} className="hover:bg-navy-50">
                  <TableCell className="max-w-[250px]">
                    <p className="font-medium text-navy-900 truncate">{paper.title}</p>
                    <p className="text-xs text-navy-500">{paper.uploadDate}</p>
                  </TableCell>
                  <TableCell className="text-navy-600">
                    {paper.authors.join(', ')}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`https://doi.org/${paper.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-navy-600 hover:text-navy-900 hover:underline"
                    >
                      {paper.doi}
                    </a>
                  </TableCell>
                  <TableCell>{getAccessLevelBadge(paper.accessLevel)}</TableCell>
                  <TableCell>
                    <span className="font-blockchain text-navy-500">
                      {paper.ipfsHash.slice(0, 8)}...{paper.ipfsHash.slice(-4)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-blockchain text-navy-500">
                      {paper.txHash.slice(0, 8)}...{paper.txHash.slice(-4)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-navy-500">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
