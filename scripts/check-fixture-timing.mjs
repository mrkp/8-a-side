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

async function checkFixtureTiming() {
  console.log('Checking fixture timing fields...\n')

  try {
    // Check if columns exist by trying to select them
    const { data: fixtures, error } = await supabase
      .from('fixtures')
      .select('id, team_a, team_b, status, started_at, ended_at')
      .limit(5)

    if (error) {
      console.error('Error fetching fixtures:', error)
      console.log('\nThe timing columns might not exist. Please run this SQL in your Supabase dashboard:')
      console.log(`
ALTER TABLE fixtures 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS total_paused_time INTEGER DEFAULT 0;
`)
      return
    }

    console.log('Fixtures with timing info:')
    fixtures?.forEach(f => {
      console.log(`- ${f.id}: status=${f.status}, started_at=${f.started_at || 'NULL'}, ended_at=${f.ended_at || 'NULL'}`)
    })

    // Check for any live fixtures without started_at
    const { data: liveFixtures } = await supabase
      .from('fixtures')
      .select('*')
      .eq('status', 'live')
      .is('started_at', null)

    if (liveFixtures && liveFixtures.length > 0) {
      console.log('\n⚠️  Found live fixtures without started_at:')
      liveFixtures.forEach(f => {
        console.log(`  - ${f.id}`)
      })
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

checkFixtureTiming()