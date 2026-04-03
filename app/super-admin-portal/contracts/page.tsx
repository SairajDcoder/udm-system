"use client"

import { useEffect, useMemo, useState } from "react"
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
import { FileCode2, Loader2 } from "lucide-react"

type ContractRecord = {
  name: string
  blockchain: "student" | "faculty" | "institutional"
  version: string
  proxy: boolean
  status: "healthy" | "degraded"
  address: string
}

export default function SmartContractsPage() {
  const [contracts, setContracts] = useState<ContractRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadContracts() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/system/contracts", { cache: "no-store" })
        const data = await response.json()
        setContracts(Array.isArray(data.contracts) ? data.contracts : [])
      } catch {
        setError("Failed to load smart contracts.")
      } finally {
        setLoading(false)
      }
    }
    void loadContracts()
  }, [])

  const healthyContracts = useMemo(
    () => contracts.filter((contract) => contract.status === "healthy").length,
    [contracts]
  )
  const proxyContracts = useMemo(
    () => contracts.filter((contract) => contract.proxy).length,
    [contracts]
  )

  const handleUpgrade = async (contractName: string) => {
    const response = await fetch("/api/system/contracts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractName }),
    })
    if (!response.ok) {
      return
    }
    const data = await response.json()
    setContracts((current) =>
      current.map((contract) => (contract.name === contractName ? data.contract : contract))
    )
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Smart Contract Registry" code="ADM-03" />
      <main className="space-y-6 p-6">
        {error ? (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <p className="text-xs uppercase text-muted-foreground">Total Contracts</p>
              <p className="font-mono text-3xl font-bold">{contracts.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <p className="text-xs uppercase text-muted-foreground">Healthy</p>
              <p className="font-mono text-3xl font-bold text-success">{healthyContracts}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <p className="text-xs uppercase text-muted-foreground">Proxy Contracts</p>
              <p className="font-mono text-3xl font-bold">{proxyContracts}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-base">
              <FileCode2 className="h-5 w-5 text-primary" />
              Deployed Contracts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading contracts...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Contract</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Blockchain</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Proxy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.address} className="border-border">
                      <TableCell className="font-medium">{contract.name}</TableCell>
                      <TableCell className="font-mono text-xs">{contract.address}</TableCell>
                      <TableCell className="capitalize">{contract.blockchain}</TableCell>
                      <TableCell className="font-mono">{contract.version}</TableCell>
                      <TableCell>
                        {contract.proxy ? (
                          <Badge className="bg-secondary/20 text-secondary border-secondary/30">Enabled</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            contract.status === "healthy"
                              ? "bg-success/20 text-success border-success/30"
                              : "bg-warning/20 text-warning border-warning/30"
                          }
                        >
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {contract.proxy ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-navy-200 text-navy-700"
                            onClick={() => void handleUpgrade(contract.name)}
                          >
                            Upgrade
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Immutable</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
