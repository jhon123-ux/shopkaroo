import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Standard client with Anon Key (RLS active)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client with Service Role Key (Bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
