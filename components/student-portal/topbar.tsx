"use client"

import { usePathname } from "next/navigation"
import { Bell, Search, ChevronDown, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const pageNames: Record<string, string> = {
  "/student-portal": "Dashboard",
  "/student-portal/profile": "Profile & Identity",
  "/student-portal/academics": "Academic Records",
  "/student-portal/transcript-request": "Transcript Request",
  "/student-portal/credentials": "Credential Wallet",
  "/student-portal/access-control": "Access Control Centre",
  "/student-portal/notifications": "Notifications",
  "/student-portal/transcript-viewer": "Transcript Viewer",
  "/student-portal/credit-transfer": "Credit Transfer Request",
  "/student-portal/data-export": "Data Export",
}

interface TopbarProps {
  onMenuClick?: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname()
  const currentPage = pageNames[pathname] || "Dashboard"

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left Section - Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="hidden sm:block">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/student-portal" className="text-gray-500 hover:text-teal-500">
                  Student Portal
                </BreadcrumbLink>
              </BreadcrumbItem>
              {pathname !== "/student-portal" && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-foreground font-medium">
                      {currentPage}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="font-heading text-xl font-semibold text-navy-900 mt-0.5">
            {currentPage}
          </h1>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="hidden md:flex flex-1 max-w-[320px] mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search records, credentials..."
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-teal-500 text-white border-2 border-white">
            3
          </Badge>
        </Button>

        {/* Portal Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 border-gray-200">
              <span className="hidden sm:inline text-sm">Student Portal</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="text-teal-600 font-medium">
              Student Portal
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="text-gray-400">
              Faculty Portal
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="text-gray-400">
              Admin Portal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
