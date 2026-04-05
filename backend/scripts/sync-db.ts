import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  const migrationPath = path.join(__dirname, '../supabase/migrations/007_update_reviews_status.sql')
  const sql = fs.readFileSync(migrationPath, 'utf8')

  console.log('Applying migration to production...')

  // Since supabase-js doesn't have raw SQL, we use the postgres connection string 
  // OR we use the REST API to run the SQL if we have a custom function.
  // BUT wait, many users have a 'exec_sql' RPC function for this. 
  // Let's check if there is one.
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

  if (error) {
    if (error.message.includes('function "exec_sql" does not exist')) {
      console.warn('RPC "exec_sql" not found. Falling back to manual SQL execution method...')
      // If we can't run SQL via RPC, we have to ask the user to run it in the dashboard.
      console.log('\n--- PLEASE RUN THIS SQL IN SUPABASE DASHBOARD ---')
      console.log(sql)
      console.log('--------------------------------------------------\n')
    } else {
      console.error('Migration failed:', error.message)
    }
  } else {
    console.log('Migration applied successfully!')
  }
}

runMigration()
