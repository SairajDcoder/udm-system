"use client"

import { AdminHeader } from "@/components/super-admin-portal/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Blocks, HardDrive, MessageSquare, Shield, Mail, FileCheck, Save } from "lucide-react"

export default function ConfigurationPage() {
  return (
    <div className="min-h-screen">
      <AdminHeader title="System Configuration" code="ADM-07" />
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Blockchain Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-serif text-base flex items-center gap-2">
                <Blocks className="h-5 w-5 text-primary" />
                Blockchain Settings
              </CardTitle>
              <CardDescription>Configure blockchain network parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="consensus">Consensus Algorithm</Label>
                <Select defaultValue="poa">
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poa">Proof of Authority (PoA)</SelectItem>
                    <SelectItem value="pos">Proof of Stake (PoS)</SelectItem>
                    <SelectItem value="pbft">PBFT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="block-time">Block Time (seconds)</Label>
                <Input id="block-time" type="number" defaultValue="12" className="bg-muted border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gas-limit">Gas Limit</Label>
                <Input id="gas-limit" type="number" defaultValue="8000000" className="bg-muted border-border font-mono" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-mining</Label>
                  <p className="text-xs text-muted-foreground">Automatically mine blocks when transactions are pending</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator className="bg-border" />
              <div className="space-y-2">
                <Label htmlFor="min-validators">Minimum Validators</Label>
                <Input id="min-validators" type="number" defaultValue="3" className="bg-muted border-border" />
              </div>
            </CardContent>
          </Card>

          {/* IPFS Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-serif text-base flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-secondary" />
                IPFS Settings
              </CardTitle>
              <CardDescription>Configure distributed storage parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ipfs-gateway">Gateway URL</Label>
                <Input id="ipfs-gateway" defaultValue="https://ipfs.university.edu" className="bg-muted border-border font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ipfs-api">API Endpoint</Label>
                <Input id="ipfs-api" defaultValue="https://api.ipfs.university.edu:5001" className="bg-muted border-border font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="replication">Replication Factor</Label>
                <Select defaultValue="3">
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 (No replication)</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3 (Recommended)</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Pin Content</Label>
                  <p className="text-xs text-muted-foreground">Automatically pin uploaded content</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                <Input id="max-file-size" type="number" defaultValue="100" className="bg-muted border-border" />
              </div>
            </CardContent>
          </Card>

          {/* Kafka Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-serif text-base flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-info" />
                Kafka Settings
              </CardTitle>
              <CardDescription>Configure message broker parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kafka-brokers">Broker URLs</Label>
                <Input id="kafka-brokers" defaultValue="kafka-01:9092,kafka-02:9092,kafka-03:9092" className="bg-muted border-border font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-partitions">Default Partitions</Label>
                <Select defaultValue="6">
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="retention-hours">Default Retention (hours)</Label>
                <Input id="retention-hours" type="number" defaultValue="168" className="bg-muted border-border" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Compression</Label>
                  <p className="text-xs text-muted-foreground">Compress messages using LZ4</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Auth Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-serif text-base flex items-center gap-2">
                <Shield className="h-5 w-5 text-success" />
                Authentication Settings
              </CardTitle>
              <CardDescription>Configure security and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input id="session-timeout" type="number" defaultValue="30" className="bg-muted border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-attempts">Max Login Attempts</Label>
                <Input id="max-attempts" type="number" defaultValue="5" className="bg-muted border-border" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require MFA</Label>
                  <p className="text-xs text-muted-foreground">Force MFA for all admin users</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Password Expiry</Label>
                  <p className="text-xs text-muted-foreground">Require password change every 90 days</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jwt-expiry">JWT Token Expiry (hours)</Label>
                <Input id="jwt-expiry" type="number" defaultValue="24" className="bg-muted border-border" />
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-serif text-base flex items-center gap-2">
                <Mail className="h-5 w-5 text-warning" />
                Email Settings
              </CardTitle>
              <CardDescription>Configure email and notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input id="smtp-host" defaultValue="smtp.university.edu" className="bg-muted border-border font-mono text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input id="smtp-port" type="number" defaultValue="587" className="bg-muted border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-security">Security</Label>
                  <Select defaultValue="tls">
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                      <SelectItem value="tls">TLS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="from-email">From Email</Label>
                <Input id="from-email" defaultValue="noreply@university.edu" className="bg-muted border-border font-mono text-sm" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Send system alerts via email</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Compliance Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-serif text-base flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                Compliance Settings
              </CardTitle>
              <CardDescription>Configure regulatory compliance parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>FERPA Compliance</Label>
                  <p className="text-xs text-muted-foreground">Enable FERPA data protection features</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>GDPR Compliance</Label>
                  <p className="text-xs text-muted-foreground">Enable GDPR data handling requirements</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data-retention">Data Retention Period (years)</Label>
                <Input id="data-retention" type="number" defaultValue="7" className="bg-muted border-border" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Audit Logging</Label>
                  <p className="text-xs text-muted-foreground">Log all data access and modifications</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Encryption at Rest</Label>
                  <p className="text-xs text-muted-foreground">Encrypt all stored sensitive data</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Save className="h-4 w-4" />
            Save All Changes
          </Button>
        </div>
      </main>
    </div>
  )
}
