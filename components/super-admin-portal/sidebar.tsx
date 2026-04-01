"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Blocks,
  FileCode2,
  MessageSquare,
  Container,
  Users,
  Settings,
  FileText,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    title: "System Overview",
    href: "/super-admin-portal",
    icon: LayoutDashboard,
    code: "ADM-01",
  },
  {
    title: "Blockchain Monitor",
    href: "/super-admin-portal/blockchain",
    icon: Blocks,
    code: "ADM-02",
  },
  {
    title: "Smart Contracts",
    href: "/super-admin-portal/contracts",
    icon: FileCode2,
    code: "ADM-03",
  },
  {
    title: "Kafka Management",
    href: "/super-admin-portal/kafka",
    icon: MessageSquare,
    code: "ADM-04",
  },
  {
    title: "Kubernetes Cluster",
    href: "/super-admin-portal/kubernetes",
    icon: Container,
    code: "ADM-05",
  },
  {
    title: "User & Roles",
    href: "/super-admin-portal/users",
    icon: Users,
    code: "ADM-06",
  },
  {
    title: "Configuration",
    href: "/super-admin-portal/configuration",
    icon: Settings,
    code: "ADM-07",
  },
  {
    title: "Compliance & Audit",
    href: "/super-admin-portal/compliance",
    icon: FileText,
    code: "ADM-08",
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <div className="flex flex-col">
                <span className="font-serif text-sm font-bold text-sidebar-foreground">
                  Super-Admin
                </span>
                <span className="text-[10px] text-muted-foreground">
                  UDMS Portal
                </span>
              </div>
            </div>
          )}
          {collapsed && <Shield className="h-8 w-8 text-primary mx-auto" />}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/super-admin-portal" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.title}</span>
                    <span
                      className={cn(
                        "font-mono text-[10px]",
                        isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      {item.code}
                    </span>
                  </>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  )
}
