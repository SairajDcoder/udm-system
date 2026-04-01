"use client"

import { useState } from "react"
import { Sidebar } from "@/components/student-portal/sidebar"
import { Topbar } from "@/components/student-portal/topbar"
import { cn } from "@/lib/utils"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="lg:pl-[260px]">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="p-6">
          <div className="mx-auto max-w-[1440px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
