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

async function testGoalAnimation() {
  console.log('Testing goal animation trigger...\n')

  try {
    // Find a live fixture
    const { data: fixtures, error: fixtureError } = await supabase
      .from('fixtures')
      .select('*')
      .eq('status', 'live')
      .limit(1)

    if (fixtureError || !fixtures || fixtures.length === 0) {
      console.error('No live fixtures found. Please start a match first.')
      process.exit(1)
    }

    const fixture = fixtures[0]
    console.log('Found live fixture:', fixture.id)

    // Get a player from team A
    const { data: players, error: playerError } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', fixture.team_a)
      .limit(1)

    if (playerError || !players || players.length === 0) {
      console.error('No players found for team A')
      process.exit(1)
    }

    const player = players[0]
    console.log('Using player:', player.name)

    // Insert a test goal event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        fixture_id: fixture.id,
        team_id: fixture.team_a,
        player_id: player.id,
        minute: Math.floor(Math.random() * 45) + 1,
        type: 'goal'
      })
      .select()
      .single()

    if (eventError) {
      console.error('Error inserting goal:', eventError)
      process.exit(1)
    }

    console.log('\n✅ Goal event created successfully!')
    console.log('Event ID:', event.id)
    console.log('\nCheck the scoreboard to see if the animation triggered.')
    console.log(`Scoreboard URL: http://localhost:3000/scoreboard/${fixture.id}`)
    
    // Update fixture score
    const newScore = {
      teamA: (fixture.score?.teamA || 0) + 1,
      teamB: fixture.score?.teamB || 0
    }
    
    await supabase
      .from('fixtures')
      .update({ score: newScore })
      .eq('id', fixture.id)
    
    console.log('Score updated to:', newScore)

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

testGoalAnimation()