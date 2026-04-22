import { createClient } from '@supabase/supabase-js'

export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('⚠️ Server-side Supabase keys missing. Recurring customer features will be disabled.')
    return null
  }
  
  try {
    return createClient(supabaseUrl, supabaseServiceKey)
  } catch (error) {
    console.error('❌ Failed to initialize server-side Supabase client:', error)
    return null
  }
}
