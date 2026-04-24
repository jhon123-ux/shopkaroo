import { createAdminClient } from '@/lib/supabase/admin'
import DraftOrdersClient from './DraftOrdersClient'

export const dynamic = 'force-dynamic'

export default async function DraftOrdersPage() {
  const admin = createAdminClient()

  const { data: drafts } = await admin
    .from('draft_orders')
    .select('*')
    .eq('is_recovered', false)
    .order('last_activity_at', { ascending: false })

  return <DraftOrdersClient drafts={drafts ?? []} />
}
