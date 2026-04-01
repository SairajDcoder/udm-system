'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BookOpen,
  FileSpreadsheet,
  GraduationCap,
  FileCheck,
  Database,
  ScrollText,
  ArrowLeftRight,
  Server,
  Users,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const navItems = [
  { href: '/faculty-portal', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/faculty-portal/courses', label: 'Course Management', icon: BookOpen },
  { href: '/faculty-portal/grades', label: 'Grade Entry', icon: FileSpreadsheet },
  { href: '/faculty-portal/degrees', label: 'Degree Issuance', icon: GraduationCap },
  { href: '/faculty-portal/transcripts', label: 'Transcript Approval', icon: FileCheck },
  { href: '/faculty-portal/research', label: 'Research Data', icon: Database },
  { href: '/faculty-portal/audit', label: 'Audit Log', icon: ScrollText },
  { href: '/faculty-portal/transfers', label: 'Credit Transfer', icon: ArrowLeftRight },
  { href: '/faculty-portal/validators', label: 'Validator Nodes', icon: Server },
  { href: '/faculty-portal/users', label: 'User Management', icon: Users },
]

export function PortalSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-navy-900 text-white transition-all duration-300',
          collapsed ? 'w-16' : 'w-[260px]'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-navy-700 px-4">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold">
                <Shield className="h-5 w-5 text-navy-900" />
              </div>
              <div>
                <h1 className="font-heading text-sm font-semibold">UniChain</h1>
                <p className="text-xs text-navy-300">Faculty Portal</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-gold">
              <Shield className="h-5 w-5 text-navy-900" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/faculty-portal' && pathname.startsWith(item.href))
            
            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gold text-navy-900'
                    : 'text-navy-200 hover:bg-navy-800 hover:text-white',
                  collapsed && 'justify-center px-2'
                )}
              >
                <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-navy-900')} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-navy-800 text-white border-navy-700">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <div key={item.href}>{linkContent}</div>
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="absolute bottom-4 left-0 right-0 px-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'w-full justify-center text-navy-300 hover:bg-navy-800 hover:text-white',
              collapsed && 'px-2'
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
