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

async function deleteSpecificFixtures() {
  console.log('Deleting specific knockout fixtures...\n')

  // The fixture IDs from the check
  const fixtureIds = [
    '734a10ad-dc3d-47fc-80bf-1a71823a7c9d',
    '39a5f4fd-4b27-4017-9eab-78c1b9fb264d',
    '55fa7284-1ef1-4cf3-8238-a22691f554f5',
    '82608922-75c8-4acd-9c56-24749afd300d',
    'cbe4a664-8079-4461-94fd-b2664bc28c07',
    '5f7d3d2c-8964-423f-ac6f-b943bef0a76f'
  ]

  try {
    // Delete events first
    for (const fixtureId of fixtureIds) {
      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('fixture_id', fixtureId)
      
      if (eventError) {
        console.log(`Note: No events to delete for fixture ${fixtureId}`)
      }
    }

    // Delete fixtures one by one
    for (const fixtureId of fixtureIds) {
      const { error, data } = await supabase
        .from('fixtures')
        .delete()
        .eq('id', fixtureId)
        .select()

      if (error) {
        console.error(`Error deleting fixture ${fixtureId}:`, error.message)
      } else {
        console.log(`✅ Deleted fixture ${fixtureId}`)
      }
    }

    console.log('\n✨ Deletion process completed!')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

deleteSpecificFixtures()