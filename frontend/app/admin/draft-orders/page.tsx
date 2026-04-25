import { createAdminClient } from '@/lib/supabase/admin'
import DraftOrdersClient from './DraftOrdersClient'

export const dynamic = 'force-dynamic'

export default async function DraftOrdersPage() {
  const admin = createAdminClient()

  const { data: abandoned } = await admin
    .from('abandoned_checkouts')
    .select('*')
    .eq('is_recovered', false)
    .gt('cart_total', 0)           // only records with actual cart value
    .order('last_activity_at', { ascending: false })

  return <DraftOrdersClient records={abandoned ?? []} />
}
