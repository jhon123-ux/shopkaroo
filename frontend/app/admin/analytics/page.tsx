import { getAnalyticsData } from '@/lib/analytics'
import AnalyticsDashboard from './AnalyticsDashboard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()
  return <AnalyticsDashboard data={data} />
}
