import { PortalSidebar } from '@/components/faculty-portal/sidebar'
import { PortalTopbar } from '@/components/faculty-portal/topbar'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <PortalSidebar />
      <PortalTopbar />
      <main className="ml-[260px] pt-16 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
