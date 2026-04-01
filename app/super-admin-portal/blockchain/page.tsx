"use client"

import { useState } from "react"
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
import { Blocks, ArrowRightLeft, Clock, Hash, Database, Cpu, HardDrive } from "lucide-react"

interface Block {
  number: number
  hash: string
  txCount: number
  gasUsed: string
  timestamp: string
  validator: string
}

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  status: "confirmed" | "pending" | "failed"
  timestamp: string
}

const studentBlocks: Block[] = [
  { number: 1234567, hash: "0x8f4e...3a2b", txCount: 24, gasUsed: "45%", timestamp: "2 sec ago", validator: "Node-03" },
  { number: 1234566, hash: "0x7d3c...9f1e", txCount: 18, gasUsed: "38%", timestamp: "15 sec ago", validator: "Node-01" },
  { number: 1234565, hash: "0x2a1b...5c4d", txCount: 31, gasUsed: "62%", timestamp: "28 sec ago", validator: "Node-05" },
  { number: 1234564, hash: "0x9e8f...1a2b", txCount: 12, gasUsed: "28%", timestamp: "41 sec ago", validator: "Node-02" },
  { number: 1234563, hash: "0x4b5c...7d8e", txCount: 27, gasUsed: "51%", timestamp: "54 sec ago", validator: "Node-04" },
]

const studentTransactions: Transaction[] = [
  { hash: "0xabc1...ef23", from: "0x1234...5678", to: "StudentReg", value: "0 ETH", status: "confirmed", timestamp: "5 sec ago" },
  { hash: "0xdef4...gh56", from: "0x8765...4321", to: "GradeStore", value: "0 ETH", status: "confirmed", timestamp: "12 sec ago" },
  { hash: "0xijk7...lm89", from: "0x2468...1357", to: "StudentReg", value: "0 ETH", status: "pending", timestamp: "18 sec ago" },
  { hash: "0xnop0...qr12", from: "0x1357...2468", to: "Enrollment", value: "0 ETH", status: "confirmed", timestamp: "25 sec ago" },
  { hash: "0xstu3...vw45", from: "0x9876...5432", to: "GradeStore", value: "0 ETH", status: "failed", timestamp: "32 sec ago" },
]

const chainStats = {
  student: { totalBlocks: 1234567, totalTx: 8945231, avgBlockTime: "12.5s", hashRate: "145 MH/s" },
  faculty: { totalBlocks: 987654, totalTx: 3421567, avgBlockTime: "15.2s", hashRate: "98 MH/s" },
  institutional: { totalBlocks: 654321, totalTx: 1234567, avgBlockTime: "18.8s", hashRate: "67 MH/s" },
}

function NetworkDiagram() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-base">Network Topology</CardTitle>
      </CardHeader>
      <CardContent>
        <svg viewBox="0 0 400 200" className="w-full h-[200px]">
          {/* Connection lines */}
          <line x1="200" y1="100" x2="80" y2="50" stroke="#334155" strokeWidth="2" />
          <line x1="200" y1="100" x2="320" y2="50" stroke="#334155" strokeWidth="2" />
          <line x1="200" y1="100" x2="80" y2="150" stroke="#334155" strokeWidth="2" />
          <line x1="200" y1="100" x2="320" y2="150" stroke="#334155" strokeWidth="2" />
          <line x1="200" y1="100" x2="200" y2="30" stroke="#334155" strokeWidth="2" />
          
          {/* Central node */}
          <circle cx="200" cy="100" r="25" fill="#D64045" />
          <text x="200" y="105" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace">MAIN</text>
          
          {/* Validator nodes */}
          <circle cx="80" cy="50" r="18" fill="#10B981" className="animate-pulse" />
          <text x="80" y="54" textAnchor="middle" fill="white" fontSize="8" fontFamily="monospace">V-01</text>
          
          <circle cx="320" cy="50" r="18" fill="#10B981" className="animate-pulse" />
          <text x="320" y="54" textAnchor="middle" fill="white" fontSize="8" fontFamily="monospace">V-02</text>
          
          <circle cx="80" cy="150" r="18" fill="#10B981" className="animate-pulse" />
          <text x="80" y="154" textAnchor="middle" fill="white" fontSize="8" fontFamily="monospace">V-03</text>
          
          <circle cx="320" cy="150" r="18" fill="#E8A838" />
          <text x="320" y="154" textAnchor="middle" fill="white" fontSize="8" fontFamily="monospace">V-04</text>
          
          <circle cx="200" cy="30" r="18" fill="#10B981" className="animate-pulse" />
          <text x="200" y="34" textAnchor="middle" fill="white" fontSize="8" fontFamily="monospace">V-05</text>
          
          {/* Legend */}
          <circle cx="30" cy="180" r="6" fill="#10B981" />
          <text x="42" y="183" fill="#9CA3AF" fontSize="9">Active</text>
          <circle cx="100" cy="180" r="6" fill="#E8A838" />
          <text x="112" y="183" fill="#9CA3AF" fontSize="9">Syncing</text>
          <circle cx="170" cy="180" r="6" fill="#D64045" />
          <text x="182" y="183" fill="#9CA3AF" fontSize="9">Primary</text>
        </svg>
      </CardContent>
    </Card>
  )
}

function ChainStatsSidebar({ chain }: { chain: "student" | "faculty" | "institutional" }) {
  const stats = chainStats[chain]
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-base">Chain Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Blocks className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Blocks</p>
            <p className="font-mono text-lg font-bold">{stats.totalBlocks.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
            <ArrowRightLeft className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Transactions</p>
            <p className="font-mono text-lg font-bold">{stats.totalTx.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
            <Clock className="h-5 w-5 text-info" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Block Time</p>
            <p className="font-mono text-lg font-bold">{stats.avgBlockTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
            <Cpu className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Hash Rate</p>
            <p className="font-mono text-lg font-bold">{stats.hashRate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BlocksTable({ blocks }: { blocks: Block[] }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-base flex items-center gap-2">
          <Blocks className="h-4 w-4 text-primary" />
          Latest Blocks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Block</TableHead>
              <TableHead className="text-muted-foreground">Hash</TableHead>
              <TableHead className="text-muted-foreground">Txns</TableHead>
              <TableHead className="text-muted-foreground">Gas</TableHead>
              <TableHead className="text-muted-foreground">Validator</TableHead>
              <TableHead className="text-muted-foreground">Age</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blocks.map((block) => (
              <TableRow key={block.number} className="border-border">
                <TableCell className="font-mono text-primary">#{block.number}</TableCell>
                <TableCell className="font-mono text-xs">{block.hash}</TableCell>
                <TableCell className="font-mono">{block.txCount}</TableCell>
                <TableCell className="font-mono">{block.gasUsed}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {block.validator}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{block.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="font-serif text-base flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-secondary" />
          Latest Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Hash</TableHead>
              <TableHead className="text-muted-foreground">From</TableHead>
              <TableHead className="text-muted-foreground">To</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Age</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.hash} className="border-border">
                <TableCell className="font-mono text-xs text-primary">{tx.hash}</TableCell>
                <TableCell className="font-mono text-xs">{tx.from}</TableCell>
                <TableCell className="font-mono text-xs">{tx.to}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      tx.status === "confirmed"
                        ? "bg-success/20 text-success border-success/30"
                        : tx.status === "pending"
                        ? "bg-warning/20 text-warning border-warning/30"
                        : "bg-error/20 text-error border-error/30"
                    }
                  >
                    {tx.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{tx.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default function BlockchainMonitorPage() {
  const [activeChain, setActiveChain] = useState<"student" | "faculty" | "institutional">("student")

  return (
    <div className="min-h-screen">
      <AdminHeader title="Blockchain Network Monitor" code="ADM-02" />
      <main className="p-6 space-y-6">
        <Tabs value={activeChain} onValueChange={(v) => setActiveChain(v as typeof activeChain)}>
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="student" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Database className="h-4 w-4 mr-2" />
              Student BC
            </TabsTrigger>
            <TabsTrigger value="faculty" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Database className="h-4 w-4 mr-2" />
              Faculty BC
            </TabsTrigger>
            <TabsTrigger value="institutional" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <HardDrive className="h-4 w-4 mr-2" />
              Institutional BC
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeChain} className="mt-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              <div className="lg:col-span-3 space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <BlocksTable blocks={studentBlocks} />
                  <TransactionsTable transactions={studentTransactions} />
                </div>
                <NetworkDiagram />
              </div>
              <div className="lg:col-span-1">
                <ChainStatsSidebar chain={activeChain} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
