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

async function fixLiveFixtures() {
  console.log('Fixing live fixtures without start times...\n')

  try {
    // Find live fixtures without started_at
    const { data: liveFixtures, error } = await supabase
      .from('fixtures')
      .select('*')
      .eq('status', 'live')
      .is('started_at', null)

    if (error) throw error

    if (!liveFixtures || liveFixtures.length === 0) {
      console.log('No live fixtures need fixing.')
      return
    }

    console.log(`Found ${liveFixtures.length} live fixtures without start times.`)
    
    // Set started_at to 5 minutes ago for each live fixture
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    
    for (const fixture of liveFixtures) {
      const { error: updateError } = await supabase
        .from('fixtures')
        .update({ 
          started_at: fiveMinutesAgo,
          total_paused_time: 0
        })
        .eq('id', fixture.id)

      if (updateError) {
        console.error(`Error updating fixture ${fixture.id}:`, updateError)
      } else {
        console.log(`✓ Fixed fixture ${fixture.id} - set started_at to ${fiveMinutesAgo}`)
      }
    }

    // Also fix any goals that have minute 0
    const { data: zeroMinuteGoals, error: goalsError } = await supabase
      .from('events')
      .select('*')
      .eq('minute', 0)

    if (!goalsError && zeroMinuteGoals && zeroMinuteGoals.length > 0) {
      console.log(`\nFound ${zeroMinuteGoals.length} goals at minute 0. Updating to minute 1...`)
      
      for (const goal of zeroMinuteGoals) {
        const { error: updateError } = await supabase
          .from('events')
          .update({ minute: 1 })
          .eq('id', goal.id)

        if (!updateError) {
          console.log(`✓ Updated goal ${goal.id} to minute 1`)
        }
      }
    }

    console.log('\n✅ All fixes completed!')

  } catch (error) {
    console.error('Error:', error)
  }
}

fixLiveFixtures()