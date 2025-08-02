import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanupTestData() {
  console.log('Starting cleanup of test fixtures and stats...\n')

  try {
    // 1. Check July fixtures before deletion
    const { data: julyFixtures, error: fixturesError } = await supabase
      .from('fixtures')
      .select(`
        id,
        date,
        teamA:teams!fixtures_team_a_fkey(name),
        teamB:teams!fixtures_team_b_fkey(name),
        status,
        score
      `)
      .gte('date', '2024-07-01')
      .lt('date', '2024-08-01')

    if (fixturesError) throw fixturesError

    console.log(`Found ${julyFixtures?.length || 0} July fixtures to delete:`)
    julyFixtures?.forEach(f => {
      console.log(`  ${f.date}: ${f.teamA.name} vs ${f.teamB.name} (${f.status})`)
    })

    // 2. Check current team stats
    const { data: teamsWithStats, error: statsError } = await supabase
      .from('teams')
      .select('name, stats')
      .not('stats', 'is', null)
      .order('name')

    if (statsError) throw statsError

    console.log('\nCurrent team stats:')
    teamsWithStats?.forEach(t => {
      if (t.stats?.played > 0) {
        console.log(`  ${t.name}: ${t.stats.played} played, ${t.stats.points} pts, ${t.stats.gf} GF, ${t.stats.ga} GA`)
      }
    })

    // 3. Delete goal events from July fixtures
    if (julyFixtures && julyFixtures.length > 0) {
      const fixtureIds = julyFixtures.map(f => f.id)
      
      const { error: goalsDeleteError } = await supabase
        .from('goal_events')
        .delete()
        .in('fixture_id', fixtureIds)

      if (goalsDeleteError) throw goalsDeleteError
      console.log('\n✓ Deleted goal events from July fixtures')
    }

    // 4. Delete July fixtures
    const { error: fixturesDeleteError } = await supabase
      .from('fixtures')
      .delete()
      .gte('date', '2024-07-01')
      .lt('date', '2024-08-01')

    if (fixturesDeleteError) throw fixturesDeleteError
    console.log('✓ Deleted July fixtures')

    // 5. Reset team stats
    const { error: statsResetError } = await supabase
      .from('teams')
      .update({
        stats: {
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          gf: 0,
          ga: 0,
          gd: 0,
          points: 0
        }
      })
      .not('stats', 'is', null)

    if (statsResetError) throw statsResetError
    console.log('✓ Reset all team stats to zero')

    // 6. Reset player goals and assists
    const { error: playerResetError } = await supabase
      .from('players')
      .update({ goals: 0, assists: 0 })
      .or('goals.gt.0,assists.gt.0')

    if (playerResetError) throw playerResetError
    console.log('✓ Reset all player goals and assists')

    // 7. Verify cleanup
    const { data: remainingFixtures } = await supabase
      .from('fixtures')
      .select('id')
      .gte('date', '2024-07-01')
      .lt('date', '2024-08-01')

    const { data: teamsWithNonZeroStats } = await supabase
      .from('teams')
      .select('name, stats')
      .not('stats', 'is', null)

    const nonZeroCount = teamsWithNonZeroStats?.filter(t => t.stats?.played > 0).length || 0

    console.log('\nCleanup verification:')
    console.log(`  July fixtures remaining: ${remainingFixtures?.length || 0}`)
    console.log(`  Teams with non-zero stats: ${nonZeroCount}`)

    console.log('\n✅ Cleanup completed successfully!')

  } catch (error) {
    console.error('Error during cleanup:', error)
    process.exit(1)
  }
}

cleanupTestData()