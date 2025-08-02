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

async function generateKnockoutStage() {
  console.log('Generating knockout stage fixtures...\n')

  try {
    // First, check if knockout fixtures already exist
    const { data: existingKnockout } = await supabase
      .from('fixtures')
      .select('id')
      .in('stage', ['semifinal', 'final'])
      .limit(1)

    if (existingKnockout && existingKnockout.length > 0) {
      console.log('❌ Knockout fixtures already exist. Delete them first if you want to regenerate.')
      return
    }

    // Get all teams with their stats
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .eq('active', true)

    if (teamsError || !teams) {
      console.error('Error fetching teams:', teamsError)
      return
    }

    // Sort teams by points, goal difference, and goals for
    const sortedTeams = teams.sort((a, b) => {
      const statsA = a.stats || { points: 0, gd: 0, gf: 0 }
      const statsB = b.stats || { points: 0, gd: 0, gf: 0 }
      
      if (statsB.points !== statsA.points) return statsB.points - statsA.points
      if (statsB.gd !== statsA.gd) return statsB.gd - statsA.gd
      return statsB.gf - statsA.gf
    })

    // Get top 4 teams
    const top4 = sortedTeams.slice(0, 4)
    
    if (top4.length < 4) {
      console.log('❌ Not enough teams to create knockout stage. Need at least 4 teams.')
      return
    }

    console.log('Top 4 teams:')
    top4.forEach((team, index) => {
      const stats = team.stats || { points: 0, gd: 0 }
      console.log(`${index + 1}. ${team.name} - ${stats.points} pts (GD: ${stats.gd})`)
    })
    console.log()

    // Knockout fixtures for October 3rd, 2025
    // All times in AST (UTC-4)
    const knockoutFixtures = [
      // Semifinals - 6:20 PM AST
      {
        team_a: top4[0].id, // 1st place
        team_b: top4[3].id, // 4th place
        date: '2025-10-03T18:20:00-04:00',
        venue: 'South Field',
        stage: 'semifinal',
        status: 'upcoming',
        score: { teamA: 0, teamB: 0 }
      },
      {
        team_a: top4[1].id, // 2nd place
        team_b: top4[2].id, // 3rd place
        date: '2025-10-03T18:20:00-04:00',
        venue: 'Trinre Field (West)',
        stage: 'semifinal',
        status: 'upcoming',
        score: { teamA: 0, teamB: 0 }
      },
      // Final - 8:20 PM AST (2 hours after semifinals)
      {
        team_a: null, // Will be winner of SF1
        team_b: null, // Will be winner of SF2
        date: '2025-10-03T20:20:00-04:00',
        venue: 'East Field',
        stage: 'final',
        status: 'upcoming',
        score: { teamA: 0, teamB: 0 }
      }
    ]

    // Insert the fixtures
    const { data: insertedFixtures, error: insertError } = await supabase
      .from('fixtures')
      .insert(knockoutFixtures)
      .select()

    if (insertError) {
      console.error('Error inserting fixtures:', insertError)
      return
    }

    console.log('✅ Successfully created knockout stage fixtures!\n')
    console.log('Semifinals (October 3rd, 6:20 PM AST):')
    console.log(`  • ${top4[0].name} (1st) vs ${top4[3].name} (4th) - South Field`)
    console.log(`  • ${top4[1].name} (2nd) vs ${top4[2].name} (3rd) - Trinre Field (West)`)
    console.log('\nFinal (October 3rd, 8:20 PM AST):')
    console.log('  • Winner SF1 vs Winner SF2 - East Field')
    console.log('\n🏆 Knockout stage is ready!')
    
  } catch (error) {
    console.error('Error generating knockout stage:', error)
  }
}

generateKnockoutStage()