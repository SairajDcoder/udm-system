"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  User,
  GraduationCap,
  FileText,
  Wallet,
  Shield,
  Bell,
  Eye,
  ArrowRightLeft,
  Download,
  LogOut,
  ChevronDown,
} from "lucide-react"
import { useStudentWorkspace } from "@/components/student-portal/use-student-workspace"

const navigation = [
  { name: "Dashboard", href: "/student-portal", icon: LayoutDashboard },
  { name: "Profile & Identity", href: "/student-portal/profile", icon: User },
  { name: "Academic Records", href: "/student-portal/academics", icon: GraduationCap },
  { name: "Transcript Request", href: "/student-portal/transcript-request", icon: FileText },
  { name: "Credential Wallet", href: "/student-portal/credentials", icon: Wallet },
  { name: "Access Control", href: "/student-portal/access-control", icon: Shield },
  { name: "Notifications", href: "/student-portal/notifications", icon: Bell },
  { name: "Transcript Viewer", href: "/student-portal/transcript-viewer", icon: Eye },
  { name: "Credit Transfer", href: "/student-portal/credit-transfer", icon: ArrowRightLeft },
  { name: "Data Export", href: "/student-portal/data-export", icon: Download },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data } = useStudentWorkspace()
  const student = data?.student
  const displayName = student?.fullName ?? "Loading..."
  const displayId = student?.enrollmentId ?? student?.id ?? "Student ID"
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[260px] bg-navy-900 flex flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-navy-700">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <div>
          <span className="font-heading text-lg font-bold text-white">UniChain</span>
          <span className="block text-xs text-gray-400">Student Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/student-portal" && pathname.startsWith(item.href))
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-teal-500/10 text-white border-l-4 border-teal-500 -ml-[4px] pl-[calc(0.75rem+4px)]"
                      : "text-gray-400 hover:bg-navy-700 hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive && "text-teal-400")} />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-navy-700 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-teal-500">
            <AvatarImage src="/avatars/student.jpg" alt="Student" />
            <AvatarFallback className="bg-teal-500 text-white font-medium">{initials || "ST"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">{displayId}</p>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-navy-700 text-gray-400 hover:text-white transition-colors">
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
