import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read .env.local file
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('Running match timing migration...\n')

  try {
    // Read the SQL file
    const sqlPath = join(__dirname, '..', 'supabase', 'add-match-timing.sql')
    const sql = readFileSync(sqlPath, 'utf-8')

    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`)
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: statement + ';'
      }).single()

      if (error) {
        // Try direct query if exec_sql doesn't exist
        console.log('exec_sql failed, trying alternative approach...')
        // For now, we'll just log the SQL that needs to be run
        console.log('\nPlease run the following SQL in your Supabase dashboard:')
        console.log(statement + ';\n')
      }
    }

    console.log('\n✅ Migration script generated. Please run the SQL in your Supabase dashboard.')
    console.log('SQL file location: supabase/add-match-timing.sql')

  } catch (error) {
    console.error('Error during migration:', error)
    process.exit(1)
  }
}

runMigration()