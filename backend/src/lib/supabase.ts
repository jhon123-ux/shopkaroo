import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

console.log('Supabase URL exists:', !!supabaseUrl)
console.log('Anon key exists:', !!supabaseAnonKey)
console.log('Service role key exists:', !!supabaseServiceKey)
console.log('Service key starts with:', supabaseServiceKey.substring(0, 20))

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
