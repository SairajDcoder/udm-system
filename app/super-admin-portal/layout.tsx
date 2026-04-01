import { AdminSidebar } from "@/components/super-admin-portal/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="pl-64 transition-all duration-300">
        {children}
      </div>
    </div>
  )
}
