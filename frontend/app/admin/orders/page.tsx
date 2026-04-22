import { getRecurringCustomers } from '@/lib/recurring-customers'
import AdminOrdersPage from './OrdersClient'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const recurringMap = await getRecurringCustomers()
  const recurringCount = recurringMap.size
  
  // Convert Map to plain object to pass as prop to Client Component
  const recurringCustomers = Object.fromEntries(recurringMap)

  return (
    <AdminOrdersPage 
      recurringCount={recurringCount} 
      recurringCustomers={recurringCustomers} 
    />
  )
}
