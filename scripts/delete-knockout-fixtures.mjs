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

async function deleteKnockoutFixtures() {
  console.log('Deleting all knockout stage fixtures...\n')

  try {
    // First, delete any events associated with these fixtures
    const { data: fixtures } = await supabase
      .from('fixtures')
      .select('id')
      .in('stage', ['semi', 'semifinal', 'final'])

    if (fixtures && fixtures.length > 0) {
      const fixtureIds = fixtures.map(f => f.id)
      
      // Delete events first
      const { error: eventsError, count: eventsCount } = await supabase
        .from('events')
        .delete()
        .in('fixture_id', fixtureIds)

      if (eventsError) {
        console.error('Error deleting events:', eventsError)
      } else {
        console.log(`✅ Deleted ${eventsCount || 0} events from knockout fixtures`)
      }
    }

    // Now delete the fixtures
    const { error, count } = await supabase
      .from('fixtures')
      .delete()
      .in('stage', ['semi', 'semifinal', 'final'])

    if (error) {
      console.error('Error deleting fixtures:', error)
      return
    }

    console.log(`✅ Successfully deleted ${count || 0} knockout stage fixtures`)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Ask for confirmation
console.log('This will delete ALL semifinal and final fixtures.')
console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...')

setTimeout(() => {
  deleteKnockoutFixtures()
}, 5000)