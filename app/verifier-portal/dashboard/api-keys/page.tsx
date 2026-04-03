"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, Check, Clock, Copy, Key, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type ApiKey = {
  id: string
  label: string
  keyPreview: string
  scopes: string[]
  createdAt: string
  lastUsedAt?: string
  status: "active" | "revoked"
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [newKeyLabel, setNewKeyLabel] = useState("")
  const [newKeyScopes, setNewKeyScopes] = useState("verify:read,history:read")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const loadApiKeys = async () => {
    const response = await fetch("/api/verifier/api-keys")
    const payload = await response.json()
    setApiKeys(payload.apiKeys)
  }

  useEffect(() => {
    loadApiKeys().catch(() => setApiKeys([]))
  }, [])

  const activeKeys = apiKeys.filter((key) => key.status === "active").length
  const totalRequests = apiKeys.filter((key) => key.lastUsedAt).length

  const scopesList = useMemo(
    () => newKeyScopes.split(",").map((scope) => scope.trim()).filter(Boolean),
    [newKeyScopes]
  )

  const handleCreate = async () => {
    const response = await fetch("/api/verifier/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: newKeyLabel || "Verifier Integration Key",
        scopes: scopesList,
      }),
    })
    const payload = await response.json()
    setGeneratedKey(payload.rawKey)
    await loadApiKeys()
  }

  const handleRevoke = async (id: string) => {
    await fetch("/api/verifier/api-keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    await loadApiKeys()
  }

  const copyToClipboard = (value: string, id: string) => {
    navigator.clipboard.writeText(value)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1200)
  }

  const closeDialog = () => {
    setGeneratedKey(null)
    setNewKeyLabel("")
    setNewKeyScopes("verify:read,history:read")
    setIsCreateDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold">API Key Management</h2>
          <p className="text-muted-foreground">Create and revoke verifier API keys for programmatic credential verification</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Generate New Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            {generatedKey ? (
              <>
                <DialogHeader>
                  <DialogTitle className="font-serif">API Key Generated</DialogTitle>
                  <DialogDescription>Copy this key now. It will not be shown again.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
                    <p className="text-sm text-muted-foreground">Store this key securely in your deployment environment.</p>
                  </div>
                  <div className="relative">
                    <code className="block break-all rounded-lg bg-muted p-4 pr-12 font-mono text-sm">{generatedKey}</code>
                    <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={() => copyToClipboard(generatedKey, "new-key")}>
                      {copiedId === "new-key" ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={closeDialog}>I&apos;ve Saved My Key</Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="font-serif">Generate New API Key</DialogTitle>
                  <DialogDescription>Define label and scopes for this key.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-label">Key Label</Label>
                    <Input id="key-label" value={newKeyLabel} onChange={(event) => setNewKeyLabel(event.target.value)} placeholder="e.g., Production Integration" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="key-scopes">Scopes (comma-separated)</Label>
                    <Input id="key-scopes" value={newKeyScopes} onChange={(event) => setNewKeyScopes(event.target.value)} placeholder="verify:read,history:read" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                  <Button onClick={handleCreate}>Generate Key</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Keys</p>
                <p className="font-serif text-2xl font-bold">{activeKeys}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                <Clock className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recently Used</p>
                <p className="font-serif text-2xl font-bold">{totalRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <Check className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Keys</p>
                <p className="font-serif text-2xl font-bold">{apiKeys.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Your API Keys</CardTitle>
          <CardDescription>Each key has scoped permissions and auditable lifecycle events</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Key Preview</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">{apiKey.label}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-2 py-1 font-mono text-xs">{apiKey.keyPreview}</code>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(apiKey.keyPreview, apiKey.id)}>
                        {copiedId === apiKey.id ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{apiKey.scopes.join(", ")}</TableCell>
                  <TableCell>{new Date(apiKey.createdAt).toLocaleDateString("en-US")}</TableCell>
                  <TableCell>
                    <Badge variant={apiKey.status === "active" ? "default" : "destructive"}>{apiKey.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {apiKey.status === "active" ? (
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRevoke(apiKey.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Revoked</span>
                    )}
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
