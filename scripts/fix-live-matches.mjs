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

async function fixLiveMatches() {
  console.log('Fixing live matches without current_half...\n')

  try {
    // Get all live matches
    const { data: liveMatches, error: fetchError } = await supabase
      .from('fixtures')
      .select('*')
      .eq('status', 'live')

    if (fetchError) {
      console.error('Error fetching live matches:', fetchError)
      return
    }

    if (!liveMatches || liveMatches.length === 0) {
      console.log('No live matches found')
      return
    }

    console.log(`Found ${liveMatches.length} live match(es)\n`)

    for (const match of liveMatches) {
      console.log(`Processing match: ${match.id}`)
      
      // If match doesn't have current_half set, set it to 1
      if (!match.current_half) {
        const { error: updateError } = await supabase
          .from('fixtures')
          .update({ current_half: 1 })
          .eq('id', match.id)

        if (updateError) {
          console.error(`Error updating match ${match.id}:`, updateError)
        } else {
          console.log(`✅ Set current_half to 1 for match ${match.id}`)
        }
      } else {
        console.log(`Match ${match.id} already has current_half: ${match.current_half}`)
      }
    }

    console.log('\n✨ Done!')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

fixLiveMatches()