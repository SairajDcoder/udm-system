"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/super-admin-portal/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileCode2, Eye, ArrowUpCircle, Copy, Check, ExternalLink } from "lucide-react"

interface Contract {
  name: string
  address: string
  chain: "Student BC" | "Faculty BC" | "Institutional BC"
  version: string
  deployedOn: string
  status: "active" | "deprecated" | "paused"
  txCount: number
}

const contracts: Contract[] = [
  {
    name: "StudentRegistry",
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f3D1E2",
    chain: "Student BC",
    version: "v2.1.0",
    deployedOn: "2024-01-15",
    status: "active",
    txCount: 1245678,
  },
  {
    name: "GradeStore",
    address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    chain: "Student BC",
    version: "v1.8.2",
    deployedOn: "2024-02-20",
    status: "active",
    txCount: 892341,
  },
  {
    name: "EnrollmentManager",
    address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    chain: "Student BC",
    version: "v1.5.0",
    deployedOn: "2023-11-08",
    status: "deprecated",
    txCount: 456123,
  },
  {
    name: "FacultyRegistry",
    address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    chain: "Faculty BC",
    version: "v2.0.1",
    deployedOn: "2024-03-01",
    status: "active",
    txCount: 234567,
  },
  {
    name: "CourseAssignment",
    address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    chain: "Faculty BC",
    version: "v1.2.0",
    deployedOn: "2024-01-22",
    status: "active",
    txCount: 178923,
  },
  {
    name: "CredentialVault",
    address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    chain: "Institutional BC",
    version: "v3.0.0",
    deployedOn: "2024-03-10",
    status: "active",
    txCount: 567890,
  },
  {
    name: "AccessControl",
    address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    chain: "Institutional BC",
    version: "v2.2.1",
    deployedOn: "2024-02-05",
    status: "paused",
    txCount: 345678,
  },
  {
    name: "AuditTrail",
    address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    chain: "Institutional BC",
    version: "v1.0.5",
    deployedOn: "2023-12-18",
    status: "active",
    txCount: 789012,
  },
]

const sampleABI = `[
  {
    "inputs": [
      { "name": "studentId", "type": "bytes32" },
      { "name": "data", "type": "string" }
    ],
    "name": "registerStudent",
    "outputs": [{ "name": "success", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "studentId", "type": "bytes32" }],
    "name": "getStudent",
    "outputs": [
      { "name": "id", "type": "bytes32" },
      { "name": "data", "type": "string" },
      { "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "studentId", "type": "bytes32" },
      { "indexed": false, "name": "timestamp", "type": "uint256" }
    ],
    "name": "StudentRegistered",
    "type": "event"
  }
]`

function ABIViewerModal({ contract }: { contract: Contract }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleABI)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1">
          <Eye className="h-4 w-4" />
          View ABI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <FileCode2 className="h-5 w-5 text-primary" />
            {contract.name} ABI
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {contract.address}
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-8"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <pre className="max-h-[400px] overflow-auto rounded-lg bg-muted p-4 font-mono text-xs">
            {sampleABI}
          </pre>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <ExternalLink className="h-4 w-4" />
            View on Explorer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function UpgradeModal({ contract }: { contract: Contract }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 gap-1 text-secondary hover:text-secondary"
          disabled={contract.status === "deprecated"}
        >
          <ArrowUpCircle className="h-4 w-4" />
          Upgrade
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif">Upgrade Contract</DialogTitle>
          <DialogDescription>
            Upgrade {contract.name} to a new implementation
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Version</span>
              <span className="font-mono">{contract.version}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Target Version</span>
              <span className="font-mono text-success">v{parseInt(contract.version.slice(1)) + 1}.0.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Chain</span>
              <span className="font-mono">{contract.chain}</span>
            </div>
          </div>
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
            <p className="text-sm text-warning">
              Warning: Contract upgrades require multi-sig approval and will trigger a brief service pause.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button className="bg-primary hover:bg-primary/90">
            Initiate Upgrade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function SmartContractsPage() {
  return (
    <div className="min-h-screen">
      <AdminHeader title="Smart Contract Registry" code="ADM-03" />
      <main className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Contracts</p>
                <p className="font-mono text-3xl font-bold text-foreground">{contracts.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Active</p>
                <p className="font-mono text-3xl font-bold text-success">
                  {contracts.filter(c => c.status === "active").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Paused</p>
                <p className="font-mono text-3xl font-bold text-warning">
                  {contracts.filter(c => c.status === "paused").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Transactions</p>
                <p className="font-mono text-3xl font-bold text-foreground">
                  {(contracts.reduce((acc, c) => acc + c.txCount, 0) / 1000000).toFixed(1)}M
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contracts Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <FileCode2 className="h-5 w-5 text-primary" />
              Deployed Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Contract Name</TableHead>
                  <TableHead className="text-muted-foreground">Address</TableHead>
                  <TableHead className="text-muted-foreground">Chain</TableHead>
                  <TableHead className="text-muted-foreground">Version</TableHead>
                  <TableHead className="text-muted-foreground">Deployed</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Transactions</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.address} className="border-border">
                    <TableCell className="font-medium">{contract.name}</TableCell>
                    <TableCell className="font-mono text-xs text-primary">
                      {contract.address.slice(0, 10)}...{contract.address.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {contract.chain}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{contract.version}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{contract.deployedOn}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          contract.status === "active"
                            ? "bg-success/20 text-success border-success/30"
                            : contract.status === "paused"
                            ? "bg-warning/20 text-warning border-warning/30"
                            : "bg-muted text-muted-foreground border-muted"
                        }
                      >
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {contract.txCount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <ABIViewerModal contract={contract} />
                        <UpgradeModal contract={contract} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
