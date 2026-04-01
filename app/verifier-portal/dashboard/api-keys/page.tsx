"use client"

import { useState } from "react"
import {
  Key,
  Plus,
  Copy,
  Trash2,
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed: string | null
  rateLimit: number
  requestsToday: number
  status: "active" | "revoked"
}

// Mock data for demonstration
const initialApiKeys: ApiKey[] = [
  {
    id: "1",
    name: "Production API Key",
    key: "vk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    createdAt: "2024-01-15T10:00:00Z",
    lastUsed: "2024-03-15T14:32:00Z",
    rateLimit: 1000,
    requestsToday: 847,
    status: "active",
  },
  {
    id: "2",
    name: "Development Key",
    key: "vk_test_q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
    createdAt: "2024-02-20T09:15:00Z",
    lastUsed: "2024-03-14T11:20:00Z",
    rateLimit: 500,
    requestsToday: 123,
    status: "active",
  },
  {
    id: "3",
    name: "Legacy Integration",
    key: "vk_live_g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8",
    createdAt: "2023-11-10T15:45:00Z",
    lastUsed: "2024-02-28T08:00:00Z",
    rateLimit: 250,
    requestsToday: 0,
    status: "revoked",
  },
]

function maskApiKey(key: string): string {
  return key.slice(0, 8) + "••••••••••••••••••••" + key.slice(-4)
}

function generateApiKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let result = "vk_live_"
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyRateLimit, setNewKeyRateLimit] = useState("1000")
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [showKeyId, setShowKeyId] = useState<string | null>(null)
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null)

  const handleCreateKey = () => {
    const newKey = generateApiKey()
    const newApiKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName || "Unnamed Key",
      key: newKey,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      rateLimit: parseInt(newKeyRateLimit) || 1000,
      requestsToday: 0,
      status: "active",
    }
    setApiKeys([newApiKey, ...apiKeys])
    setGeneratedKey(newKey)
  }

  const handleRevokeKey = (id: string) => {
    setApiKeys(
      apiKeys.map((key) =>
        key.id === id ? { ...key, status: "revoked" as const } : key
      )
    )
  }

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id))
  }

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKeyId(keyId)
    setTimeout(() => setCopiedKeyId(null), 2000)
  }

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false)
    setGeneratedKey(null)
    setNewKeyName("")
    setNewKeyRateLimit("1000")
  }

  const activeKeys = apiKeys.filter((k) => k.status === "active").length
  const totalRequests = apiKeys.reduce((sum, k) => sum + k.requestsToday, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold">API Key Management</h2>
          <p className="text-muted-foreground">
            Manage your API keys for programmatic verification access
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Generate New Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            {generatedKey ? (
              <>
                <DialogHeader>
                  <DialogTitle className="font-serif">API Key Generated</DialogTitle>
                  <DialogDescription>
                    Your new API key has been created. Make sure to copy it now.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-warning-foreground">Important</p>
                      <p className="text-sm text-muted-foreground">
                        This is the only time you will see this key. Copy it and store it
                        securely. It cannot be retrieved later.
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Your API Key</Label>
                    <div className="mt-1.5 relative">
                      <code className="block w-full font-mono text-sm bg-muted p-4 rounded-lg break-all pr-12">
                        {generatedKey}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => copyToClipboard(generatedKey, "new")}
                      >
                        {copiedKeyId === "new" ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleDialogClose}>I&apos;ve Saved My Key</Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="font-serif">Generate New API Key</DialogTitle>
                  <DialogDescription>
                    Create a new API key for accessing the verification API.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-name">Key Name</Label>
                    <Input
                      id="key-name"
                      placeholder="e.g., Production API Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      A descriptive name to identify this key
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate-limit">Rate Limit (requests/day)</Label>
                    <Input
                      id="rate-limit"
                      type="number"
                      placeholder="1000"
                      value={newKeyRateLimit}
                      onChange={(e) => setNewKeyRateLimit(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum API requests allowed per day
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateKey}>Generate Key</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Keys</p>
                <p className="text-2xl font-serif font-bold">{activeKeys}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Requests Today</p>
                <p className="text-2xl font-serif font-bold">{totalRequests.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <Check className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Keys</p>
                <p className="text-2xl font-serif font-bold">{apiKeys.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Your API Keys</CardTitle>
          <CardDescription>
            Manage access credentials for the verification API
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Rate Limit</TableHead>
                <TableHead>Usage Today</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No API keys created yet
                  </TableCell>
                </TableRow>
              ) : (
                apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          {showKeyId === apiKey.id ? apiKey.key : maskApiKey(apiKey.key)}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            setShowKeyId(showKeyId === apiKey.id ? null : apiKey.id)
                          }
                        >
                          {showKeyId === apiKey.id ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                        >
                          {copiedKeyId === apiKey.id ? (
                            <Check className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{apiKey.rateLimit.toLocaleString()}/day</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              apiKey.requestsToday / apiKey.rateLimit > 0.9
                                ? "bg-destructive"
                                : apiKey.requestsToday / apiKey.rateLimit > 0.7
                                ? "bg-warning"
                                : "bg-success"
                            )}
                            style={{
                              width: `${Math.min(
                                (apiKey.requestsToday / apiKey.rateLimit) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {apiKey.requestsToday.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {apiKey.lastUsed
                        ? new Date(apiKey.lastUsed).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={apiKey.status === "active" ? "default" : "secondary"}
                        className={cn(
                          apiKey.status === "active"
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {apiKey.status === "active" ? "Active" : "Revoked"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {apiKey.status === "active" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-warning hover:text-warning"
                              >
                                Revoke
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to revoke &quot;{apiKey.name}&quot;? This
                                  key will immediately stop working and any applications using
                                  it will lose access.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRevokeKey(apiKey.id)}
                                  className="bg-warning text-warning-foreground hover:bg-warning/90"
                                >
                                  Revoke Key
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to permanently delete &quot;{apiKey.name}
                                &quot;? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteKey(apiKey.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Documentation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">API Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Base URL</h4>
              <code className="block font-mono text-sm bg-muted p-3 rounded-lg">
                https://api.verifychain.edu/v1
              </code>
            </div>
            <div>
              <h4 className="font-medium mb-2">Authentication</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Include your API key in the Authorization header:
              </p>
              <code className="block font-mono text-sm bg-muted p-3 rounded-lg">
                Authorization: Bearer vk_live_your_api_key_here
              </code>
            </div>
            <div>
              <h4 className="font-medium mb-2">Example Request</h4>
              <pre className="font-mono text-sm bg-muted p-3 rounded-lg overflow-x-auto">
{`curl -X POST https://api.verifychain.edu/v1/verify \\
  -H "Authorization: Bearer vk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"hash": "0x7f83b..."}'`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
