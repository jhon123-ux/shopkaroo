import { createClient } from '@supabase/supabase-js'

/**
 * Administrative Supabase Client
 * -----------------------------------------
 * Uses the Service Role Key to bypass RLS.
 * Use ONLY on the server side (actions, API routes, Server Components).
 */
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('❌ Missing Supabase Service Role Key. Admin operations disabled.')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
