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
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
})

async function createViews() {
  console.log('Creating statistics views...\n')

  const views = [
    {
      name: 'top_assists',
      sql: `
        CREATE OR REPLACE VIEW top_assists AS
        SELECT 
            p.id,
            p.name,
            p.image_url,
            p.rank,
            t.name as team_name,
            t.id as team_id,
            COUNT(e.id) as assists
        FROM players p
        JOIN teams t ON p.team_id = t.id
        JOIN events e ON e.assist_player_id = p.id
        WHERE e.type = 'goal'
        GROUP BY p.id, p.name, p.image_url, p.rank, t.name, t.id
        ORDER BY assists DESC, p.name ASC;
      `
    },
    {
      name: 'hat_tricks',
      sql: `
        CREATE OR REPLACE VIEW hat_tricks AS
        SELECT 
            p.id as player_id,
            p.name as player_name,
            p.image_url,
            p.rank,
            t.name as team_name,
            f.id as fixture_id,
            f.date as match_date,
            ta.name as team_a_name,
            tb.name as team_b_name,
            COUNT(e.id) as goals_in_match
        FROM events e
        JOIN players p ON e.player_id = p.id
        JOIN teams t ON p.team_id = t.id
        JOIN fixtures f ON e.fixture_id = f.id
        JOIN teams ta ON f.team_a = ta.id
        JOIN teams tb ON f.team_b = tb.id
        WHERE e.type = 'goal'
        GROUP BY p.id, p.name, p.image_url, p.rank, t.name, f.id, f.date, ta.name, tb.name
        HAVING COUNT(e.id) >= 3
        ORDER BY goals_in_match DESC, f.date DESC;
      `
    },
    {
      name: 'clean_sheets',
      sql: `
        CREATE OR REPLACE VIEW clean_sheets AS
        WITH team_clean_sheets AS (
            SELECT 
                t.id as team_id,
                t.name as team_name,
                t.logo as team_logo,
                COUNT(DISTINCT f.id) as clean_sheet_count
            FROM teams t
            JOIN fixtures f ON (f.team_a = t.id OR f.team_b = t.id)
            WHERE f.status = 'completed'
            AND (
                (f.team_a = t.id AND (f.score->>'teamB')::int = 0) OR
                (f.team_b = t.id AND (f.score->>'teamA')::int = 0)
            )
            GROUP BY t.id, t.name, t.logo
        )
        SELECT * FROM team_clean_sheets
        ORDER BY clean_sheet_count DESC, team_name ASC;
      `
    },
    {
      name: 'goals_assists_combined',
      sql: `
        CREATE OR REPLACE VIEW goals_assists_combined AS
        WITH player_goals AS (
            SELECT 
                p.id,
                COUNT(e.id) as goals
            FROM players p
            LEFT JOIN events e ON e.player_id = p.id AND e.type = 'goal'
            GROUP BY p.id
        ),
        player_assists AS (
            SELECT 
                p.id,
                COUNT(e.id) as assists
            FROM players p
            LEFT JOIN events e ON e.assist_player_id = p.id AND e.type = 'goal'
            GROUP BY p.id
        )
        SELECT 
            p.id,
            p.name,
            p.image_url,
            p.rank,
            t.name as team_name,
            t.id as team_id,
            COALESCE(pg.goals, 0) as goals,
            COALESCE(pa.assists, 0) as assists,
            COALESCE(pg.goals, 0) + COALESCE(pa.assists, 0) as total_contributions
        FROM players p
        JOIN teams t ON p.team_id = t.id
        LEFT JOIN player_goals pg ON p.id = pg.id
        LEFT JOIN player_assists pa ON p.id = pa.id
        WHERE COALESCE(pg.goals, 0) + COALESCE(pa.assists, 0) > 0
        ORDER BY total_contributions DESC, goals DESC, p.name ASC;
      `
    },
    {
      name: 'fastest_goals',
      sql: `
        CREATE OR REPLACE VIEW fastest_goals AS
        SELECT 
            e.id as event_id,
            p.name as player_name,
            p.image_url,
            p.rank,
            t.name as team_name,
            e.minute,
            f.date as match_date,
            ta.name as team_a_name,
            tb.name as team_b_name
        FROM events e
        JOIN players p ON e.player_id = p.id
        JOIN teams t ON p.team_id = t.id
        JOIN fixtures f ON e.fixture_id = f.id
        JOIN teams ta ON f.team_a = ta.id
        JOIN teams tb ON f.team_b = tb.id
        WHERE e.type = 'goal' AND e.minute <= 5
        ORDER BY e.minute ASC, f.date DESC;
      `
    },
    {
      name: 'highest_scoring_matches',
      sql: `
        CREATE OR REPLACE VIEW highest_scoring_matches AS
        SELECT 
            f.id as fixture_id,
            f.date,
            ta.name as team_a_name,
            tb.name as team_b_name,
            ta.logo as team_a_logo,
            tb.logo as team_b_logo,
            (f.score->>'teamA')::int as team_a_score,
            (f.score->>'teamB')::int as team_b_score,
            (f.score->>'teamA')::int + (f.score->>'teamB')::int as total_goals
        FROM fixtures f
        JOIN teams ta ON f.team_a = ta.id
        JOIN teams tb ON f.team_b = tb.id
        WHERE f.status = 'completed'
        AND (f.score->>'teamA')::int + (f.score->>'teamB')::int > 0
        ORDER BY total_goals DESC, f.date DESC
        LIMIT 10;
      `
    },
    {
      name: 'own_goals_leaderboard',
      sql: `
        CREATE OR REPLACE VIEW own_goals_leaderboard AS
        SELECT 
            p.id,
            p.name,
            p.image_url,
            p.rank,
            t.name as team_name,
            COUNT(e.id) as own_goals
        FROM players p
        JOIN teams t ON p.team_id = t.id
        JOIN events e ON e.player_id = p.id
        WHERE e.type = 'own_goal'
        GROUP BY p.id, p.name, p.image_url, p.rank, t.name
        ORDER BY own_goals DESC, p.name ASC;
      `
    }
  ]

  for (const view of views) {
    try {
      console.log(`Creating view: ${view.name}...`)
      
      // Try using RPC if available
      const { error: rpcError } = await supabase.rpc('exec_sql', { sql: view.sql })
      
      if (rpcError) {
        console.log(`Note: Could not create ${view.name} via RPC. You may need to run this SQL manually:`)
        console.log(view.sql)
        console.log('\n---\n')
      } else {
        console.log(`✅ Created ${view.name} view`)
      }
    } catch (error) {
      console.log(`Note: Could not create ${view.name}. You may need to run this SQL manually:`)
      console.log(view.sql)
      console.log('\n---\n')
    }
  }

  console.log('\n✨ View creation process completed!')
  console.log('\nNote: If any views failed to create, you can run the SQL manually via the Supabase dashboard.')
  console.log('The SQL file is located at: supabase/create-statistics-views.sql')
}

createViews()