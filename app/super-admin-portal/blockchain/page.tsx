"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminHeader } from "@/components/super-admin-portal/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Blocks, ArrowRightLeft, Activity, Loader2 } from "lucide-react"

type ChainKey = "student" | "faculty" | "institutional"

type BlockRecord = {
  blockchain: ChainKey
  blockNumber: number
  blockHash: string
  previousHash: string
  validatorId: string
  createdAt: string
}

type TransactionRecord = {
  id: string
  blockchain: ChainKey
  type: string
  actorId: string
  contractName: string
  transactionHash: string
  gasUsed: number
  blockNumber: number
  createdAt: string
}

type ValidatorRecord = {
  id: string
  blockchain: ChainKey
  name: string
  status: "active" | "syncing" | "degraded"
  stake: number
  uptime: number
}

export default function BlockchainMonitorPage() {
  const [activeChain, setActiveChain] = useState<ChainKey>("student")
  const [blocks, setBlocks] = useState<BlockRecord[]>([])
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [validators, setValidators] = useState<ValidatorRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/system/blockchain", { cache: "no-store" })
        const data = await response.json()
        setBlocks(Array.isArray(data.blocks) ? data.blocks : [])
        setTransactions(Array.isArray(data.transactions) ? data.transactions : [])
        setValidators(Array.isArray(data.validators) ? data.validators : [])
      } catch {
        setError("Failed to load blockchain telemetry.")
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [])

  const chainBlocks = useMemo(
    () => blocks.filter((block) => block.blockchain === activeChain).slice(-10).reverse(),
    [activeChain, blocks]
  )
  const chainTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.blockchain === activeChain).slice(0, 15),
    [activeChain, transactions]
  )
  const chainValidators = useMemo(
    () => validators.filter((validator) => validator.blockchain === activeChain),
    [activeChain, validators]
  )
  const activeValidators = chainValidators.filter((validator) => validator.status === "active").length

  return (
    <div className="min-h-screen">
      <AdminHeader title="Blockchain Network Monitor" code="ADM-02" />
      <main className="space-y-6 p-6">
        {error ? (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        ) : null}

        <Tabs value={activeChain} onValueChange={(value) => setActiveChain(value as ChainKey)}>
          <TabsList className="border border-border bg-muted">
            <TabsTrigger value="student">Student BC</TabsTrigger>
            <TabsTrigger value="faculty">Faculty BC</TabsTrigger>
            <TabsTrigger value="institutional">Institutional BC</TabsTrigger>
          </TabsList>

          <TabsContent value={activeChain} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <p className="text-xs uppercase text-muted-foreground">Latest Block</p>
                  <p className="font-mono text-2xl font-bold">
                    #{chainBlocks[0]?.blockNumber ?? 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <p className="text-xs uppercase text-muted-foreground">Transactions</p>
                  <p className="font-mono text-2xl font-bold">{chainTransactions.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <p className="text-xs uppercase text-muted-foreground">Active Validators</p>
                  <p className="font-mono text-2xl font-bold">
                    {activeValidators}/{chainValidators.length}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif text-base">
                    <Blocks className="h-5 w-5 text-primary" />
                    Latest Blocks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading blocks...
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead>Block</TableHead>
                          <TableHead>Validator</TableHead>
                          <TableHead>Hash</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chainBlocks.map((block) => (
                          <TableRow key={`${block.blockchain}-${block.blockNumber}`} className="border-border">
                            <TableCell className="font-mono">#{block.blockNumber}</TableCell>
                            <TableCell>{block.validatorId}</TableCell>
                            <TableCell className="font-mono text-xs">{block.blockHash}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(block.createdAt).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif text-base">
                    <ArrowRightLeft className="h-5 w-5 text-secondary" />
                    Latest Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading transactions...
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead>Type</TableHead>
                          <TableHead>Actor</TableHead>
                          <TableHead>Contract</TableHead>
                          <TableHead>Hash</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chainTransactions.map((transaction) => (
                          <TableRow key={transaction.id} className="border-border">
                            <TableCell>{transaction.type}</TableCell>
                            <TableCell>{transaction.actorId}</TableCell>
                            <TableCell>{transaction.contractName}</TableCell>
                            <TableCell className="font-mono text-xs">{transaction.transactionHash}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-base">
                  <Activity className="h-5 w-5 text-primary" />
                  Validator Set
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead>Validator</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stake</TableHead>
                      <TableHead>Uptime</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chainValidators.map((validator) => (
                      <TableRow key={validator.id} className="border-border">
                        <TableCell>{validator.name}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              validator.status === "active"
                                ? "bg-success/20 text-success border-success/30"
                                : validator.status === "syncing"
                                ? "bg-warning/20 text-warning border-warning/30"
                                : "bg-error/20 text-error border-error/30"
                            }
                          >
                            {validator.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">{validator.stake}</TableCell>
                        <TableCell className="font-mono">{validator.uptime}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
