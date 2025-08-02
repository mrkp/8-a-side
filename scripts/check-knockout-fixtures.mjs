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

async function checkKnockoutFixtures() {
  console.log('Checking for knockout stage fixtures...\n')

  try {
    // Get all semi-final and final fixtures
    const { data: knockoutFixtures, error } = await supabase
      .from('fixtures')
      .select(`
        *,
        teamA:teams!fixtures_team_a_fkey(name),
        teamB:teams!fixtures_team_b_fkey(name)
      `)
      .in('stage', ['semi', 'semifinal', 'final'])
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching fixtures:', error)
      return
    }

    if (!knockoutFixtures || knockoutFixtures.length === 0) {
      console.log('No knockout stage fixtures found.')
      return
    }

    console.log(`Found ${knockoutFixtures.length} knockout fixtures:\n`)

    knockoutFixtures.forEach((fixture, index) => {
      console.log(`${index + 1}. ${fixture.stage.toUpperCase()} - ID: ${fixture.id}`)
      console.log(`   ${fixture.teamA?.name || 'TBD'} vs ${fixture.teamB?.name || 'TBD'}`)
      console.log(`   Date: ${new Date(fixture.date).toLocaleString()}`)
      console.log(`   Status: ${fixture.status}`)
      console.log(`   Venue: ${fixture.venue || 'Not set'}`)
      console.log('---')
    })

    console.log('\nTo delete specific fixtures, use their IDs with the delete script.')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkKnockoutFixtures()