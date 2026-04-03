import { AdminHeader } from "@/components/super-admin-portal/header"
import { MetricsBar } from "@/components/super-admin-portal/metrics-bar"
import { TPSChart, KafkaLagChart, ErrorRateChart } from "@/components/super-admin-portal/dashboard-charts"
import { ServiceHealthGrid } from "@/components/super-admin-portal/service-health"
import { getSystemOverview } from "@/lib/unichain/service"

export default async function SystemOverviewPage() {
  const overview = await getSystemOverview()

  return (
    <div className="min-h-screen">
      <AdminHeader title="System Overview Dashboard" code="ADM-01" />
      <main className="p-6 space-y-6">
        {/* Live Metrics Bar */}
        <MetricsBar metrics={overview} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <TPSChart data={overview.tpsSeries} />
          <KafkaLagChart data={overview.kafkaLagSeries} />
          <ErrorRateChart data={overview.errorRateSeries} />
        </div>

        {/* Service Health Grid */}
        <ServiceHealthGrid services={overview.serviceHealth} />
      </main>
    </div>
  )
}
