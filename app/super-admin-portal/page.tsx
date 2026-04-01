import { AdminHeader } from "@/components/super-admin-portal/header"
import { MetricsBar } from "@/components/super-admin-portal/metrics-bar"
import { TPSChart, KafkaLagChart, ErrorRateChart } from "@/components/super-admin-portal/dashboard-charts"
import { ServiceHealthGrid } from "@/components/super-admin-portal/service-health"

export default function SystemOverviewPage() {
  return (
    <div className="min-h-screen">
      <AdminHeader title="System Overview Dashboard" code="ADM-01" />
      <main className="p-6 space-y-6">
        {/* Live Metrics Bar */}
        <MetricsBar />

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <TPSChart />
          <KafkaLagChart />
          <ErrorRateChart />
        </div>

        {/* Service Health Grid */}
        <ServiceHealthGrid />
      </main>
    </div>
  )
}
