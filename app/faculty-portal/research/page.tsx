'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Upload, Plus, Globe, Lock, Users, Loader2, Copy } from 'lucide-react'

type ResearchDocument = {
  id: string
  facultyId: string
  facultyName: string
  title: string
  department: string
  cid: string
  sha256: string
  visibility: 'private' | 'shared' | 'public'
  uploadedAt: string
}

function visibilityBadge(visibility: ResearchDocument['visibility']) {
  if (visibility === 'public') {
    return (
      <Badge className="bg-success text-white border-0">
        <Globe className="mr-1 h-3 w-3" />
        Public
      </Badge>
    )
  }
  if (visibility === 'private') {
    return (
      <Badge className="bg-navy-700 text-white border-0">
        <Lock className="mr-1 h-3 w-3" />
        Private
      </Badge>
    )
  }
  return (
    <Badge className="bg-gold text-navy-900 border-0">
      <Users className="mr-1 h-3 w-3" />
      Shared
    </Badge>
  )
}

export default function ResearchDataPage() {
  const [documents, setDocuments] = useState<ResearchDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('CSE')
  const [visibility, setVisibility] = useState<ResearchDocument['visibility']>('shared')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return documents.filter((document) => {
      const matchesQuery =
        document.title.toLowerCase().includes(query) ||
        document.department.toLowerCase().includes(query) ||
        document.cid.toLowerCase().includes(query)
      const matchesVisibility = visibilityFilter === 'all' || document.visibility === visibilityFilter
      return matchesQuery && matchesVisibility
    })
  }, [documents, searchQuery, visibilityFilter])

  async function loadDocuments() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/faculty/research', { cache: 'no-store' })
      const data = await response.json()
      setDocuments(Array.isArray(data.documents) ? data.documents : [])
    } catch {
      setError('Unable to load research documents.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDocuments()
  }, [])

  const handleUpload = async () => {
    if (!title.trim() || !content.trim()) return
    setUploading(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch('/api/faculty/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          department: department.trim(),
          visibility,
          body: content.trim(),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload research document.')
      }
      setMessage(`Research document uploaded with CID ${data.document?.cid ?? 'generated'}.`)
      setUploadDialogOpen(false)
      setTitle('')
      setContent('')
      await loadDocuments()
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload research document.')
    } finally {
      setUploading(false)
    }
  }

  const publicCount = documents.filter((document) => document.visibility === 'public').length
  const sharedCount = documents.filter((document) => document.visibility === 'shared').length
  const privateCount = documents.filter((document) => document.visibility === 'private').length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-900">Research Data Management</h1>
          <p className="text-navy-500">Upload and govern research artifacts via IPFS + blockchain</p>
        </div>

        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-navy-700 hover:bg-navy-800">
              <Plus className="mr-2 h-4 w-4" />
              Upload Research
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">Upload Research Document</DialogTitle>
              <DialogDescription>Create a research registry entry and anchor it on-chain.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="research-title">Title</Label>
                <Input
                  id="research-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="border-navy-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="research-department">Department</Label>
                  <Input
                    id="research-department"
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    className="border-navy-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select value={visibility} onValueChange={(value) => setVisibility(value as ResearchDocument['visibility'])}>
                    <SelectTrigger className="border-navy-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="shared">Shared</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="research-content">Content / Abstract</Label>
                <Textarea
                  id="research-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={6}
                  className="border-navy-200"
                  placeholder="Paste abstract, metadata, or a serialized representation of your paper..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => void handleUpload()}
                disabled={uploading || !title.trim() || !content.trim()}
                className="bg-navy-700 hover:bg-navy-800"
              >
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <p className="text-sm text-navy-500">Public</p>
            <p className="text-2xl font-bold text-navy-900">{publicCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <p className="text-sm text-navy-500">Shared</p>
            <p className="text-2xl font-bold text-navy-900">{sharedCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[12px] border-navy-100">
          <CardContent className="p-4">
            <p className="text-sm text-navy-500">Private</p>
            <p className="text-2xl font-bold text-navy-900">{privateCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by title, department, CID..."
                className="border-navy-200 bg-white pl-10"
              />
            </div>
            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger className="w-[180px] border-navy-200">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Visibility</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="shared">Shared</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[12px] border-navy-100">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-8 text-sm text-navy-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading research documents...
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-8 text-center text-sm text-navy-500">No research documents found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-navy-50 hover:bg-navy-50">
                  <TableHead className="font-semibold text-navy-700">Title</TableHead>
                  <TableHead className="font-semibold text-navy-700">Department</TableHead>
                  <TableHead className="font-semibold text-navy-700">CID</TableHead>
                  <TableHead className="font-semibold text-navy-700">Visibility</TableHead>
                  <TableHead className="font-semibold text-navy-700">Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow key={document.id} className="hover:bg-navy-50">
                    <TableCell>
                      <p className="font-medium text-navy-900">{document.title}</p>
                      <p className="text-xs text-navy-500">{document.facultyName}</p>
                    </TableCell>
                    <TableCell className="text-navy-700">{document.department}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="max-w-[220px] truncate text-xs text-navy-600">{document.cid}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => navigator.clipboard.writeText(document.cid)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{visibilityBadge(document.visibility)}</TableCell>
                    <TableCell className="text-navy-700">{new Date(document.uploadedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
