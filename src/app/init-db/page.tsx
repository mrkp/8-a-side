"use client"

import { useState } from "react"
import * as React from "react"
import { createClient } from "@/utils/supabase/client"

// Define all teams data
const TEAMS_DATA = [
  { name: 'Aioli', slug: 'aioli', email: 'aioli@8aside.com' },
  { name: 'WAM', slug: 'wam', email: 'wam@8aside.com' },
  { name: 'FoodDrop', slug: 'fooddrop', email: 'fooddrop@8aside.com' },
  { name: 'Bliss', slug: 'bliss', email: 'bliss@8aside.com' },
  { name: 'Full Barrell', slug: 'full-barrell', email: 'fullbarrell@8aside.com' },
  { name: 'Mini Bar', slug: 'mini-bar', email: 'minibar@8aside.com' }
]

// Define all players data by team
const PLAYERS_BY_TEAM = {
  'aioli': [
    'Adrian Almandoz',
    'Graeme Jones',
    'John Aboud',
    'Jordan Weeks',
    'Matthew Camacho',
    'Matthew Clerk',
    'Myles Yorke',
    'Romario Gonzales',
    'Seve Day'
  ],
  'wam': [
    'Joel Ogeer',
    'Jonathan Low',
    'Joshua Joseph',
    'Keshav Bahadursingh',
    'Luke Darwent',
    'Mark Pereira',
    'Matthew Jardim',
    'Stokeley Smart',
    'Willie Medford'
  ],
  'fooddrop': [
    'Christian Landreth-Smith',
    'Brandon Brown',
    'Craig Beepath',
    'Jesu Rampersad',
    'Jordan Vieira',
    'Kwesi Callender',
    'Luke Ramdeen',
    'Ross Williams'
  ],
  'bliss': [
    'Benjamin Decle',
    'Gary Griffith III',
    'Kevin Ferreira',
    'Kristian Bocage',
    'Peter Sealy II',
    'Richard Scott',
    'Rosario Sookdeo',
    'Sean De Silva',
    'Richard Fifi'
  ],
  'full-barrell': [
    'Adian Young',
    'Jerell Alexander',
    'Kyle Mowser',
    'Kyron Rudd',
    'Randy Antoine',
    'Raul Rampersad',
    'Ryan Mowser',
    'Ryan Williams',
    'Shirvan Ramdhanie'
  ],
  'mini-bar': [
    'Daniel West',
    'Kiel Lopez',
    'Matthew Sealy',
    'Ryan Daniel',
    'Shavak Ramberan',
    'Varindra Jagrup',
    'Xavier Jones',
    'Anim Hosein',
    'JC Patterson'
  ]
}

export default function InitDBPage() {
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [dbStats, setDbStats] = useState<{teams: number, players: number, trades: number} | null>(null)
  const supabase = createClient()

  // Helper function to generate players data
  const generatePlayersData = (teamIdMap: Record<string, string>) => {
    const players: Array<{name: string, team_id: string, rank: null, is_professional: boolean, is_captain: boolean}> = []
    
    Object.entries(PLAYERS_BY_TEAM).forEach(([teamSlug, playerNames]) => {
      const teamId = teamIdMap[teamSlug]
      if (teamId) {
        playerNames.forEach(name => {
          players.push({ name, team_id: teamId, rank: null, is_professional: false, is_captain: false })
        })
      }
    })
    
    return players
  }

  // Check current database state
  const checkDatabase = async () => {
    setChecking(true)
    try {
      const [teamsCount, playersCount, tradesCount] = await Promise.all([
        supabase.from("teams").select("*", { count: 'exact', head: true }),
        supabase.from("players").select("*", { count: 'exact', head: true }),
        supabase.from("trades").select("*", { count: 'exact', head: true })
      ])

      setDbStats({
        teams: teamsCount.count || 0,
        players: playersCount.count || 0,
        trades: tradesCount.count || 0
      })
    } catch (error) {
      console.error("Error checking database:", error)
    } finally {
      setChecking(false)
    }
  }

  const initializeDatabase = async () => {
    setLoading(true)
    setResults([])
    
    try {
      // First, clear existing data
      setResults(prev => [...prev, "Clearing existing data..."])
      
      await supabase.from("trade_players").delete().neq("trade_id", "00000000-0000-0000-0000-000000000000")
      await supabase.from("trades").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      await supabase.from("players").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      await supabase.from("teams").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      
      setResults(prev => [...prev, "✓ Cleared existing data"])
      
      // Insert teams
      setResults(prev => [...prev, "Inserting teams..."])
      
      const { data: insertedTeams, error: teamsError } = await supabase
        .from("teams")
        .upsert(TEAMS_DATA, { onConflict: 'slug' })
        .select()
      
      if (teamsError) throw teamsError
      
      setResults(prev => [...prev, `✓ Inserted ${TEAMS_DATA.length} teams`])
      
      // Create a map of team slugs to IDs
      const teamIdMap = insertedTeams.reduce((acc: any, team: any) => {
        acc[team.slug] = team.id
        return acc
      }, {})
      
      // Insert players
      setResults(prev => [...prev, "Inserting players..."])
      
      const players = generatePlayersData(teamIdMap)
      
      const { error: playersError } = await supabase
        .from("players")
        .upsert(players, { onConflict: 'name,team_id' })
      if (playersError) throw playersError
      
      setResults(prev => [...prev, `✓ Inserted ${players.length} players`])
      setResults(prev => [...prev, "✅ Database initialized successfully!"])
      
    } catch (error: any) {
      console.error("Error:", error)
      setResults(prev => [...prev, `❌ Error: ${error.message}`])
    } finally {
      setLoading(false)
      checkDatabase() // Refresh stats after initialization
    }
  }

  const updateDatabase = async () => {
    setLoading(true)
    setResults([])
    
    try {
      // Get existing teams to preserve their IDs
      setResults(prev => [...prev, "Fetching existing teams..."])
      const { data: existingTeams } = await supabase
        .from("teams")
        .select("*")
      
      const existingTeamMap = (existingTeams || []).reduce((acc: any, team: any) => {
        acc[team.slug] = team
        return acc
      }, {})
      
      setResults(prev => [...prev, `✓ Found ${existingTeams?.length || 0} existing teams`])
      
      // Insert only missing teams
      const teamsToInsert = TEAMS_DATA.filter(team => !existingTeamMap[team.slug])
      
      if (teamsToInsert.length > 0) {
        setResults(prev => [...prev, `Inserting ${teamsToInsert.length} new teams...`])
        const { error: teamsError } = await supabase
          .from("teams")
          .upsert(teamsToInsert, { onConflict: 'slug' })
        
        if (teamsError) throw teamsError
        setResults(prev => [...prev, `✓ Inserted ${teamsToInsert.length} new teams`])
      } else {
        setResults(prev => [...prev, "✓ All teams already exist"])
      }
      
      // Get all teams (including newly inserted ones)
      const { data: allTeams } = await supabase
        .from("teams")
        .select("*")
      
      const teamIdMap = allTeams?.reduce((acc: any, team: any) => {
        acc[team.slug] = team.id
        return acc
      }, {}) || {}
      
      // Get existing players
      setResults(prev => [...prev, "Fetching existing players..."])
      const { data: existingPlayers } = await supabase
        .from("players")
        .select("*")
      
      const existingPlayerMap = (existingPlayers || []).reduce((acc: any, player: any) => {
        const key = `${player.name}-${player.team_id}`
        acc[key] = player
        return acc
      }, {})
      
      setResults(prev => [...prev, `✓ Found ${existingPlayers?.length || 0} existing players`])
      
      // Generate all players that should exist
      const allPlayersData = generatePlayersData(teamIdMap)
      
      // Filter out players that already exist (preserve their ranks and other data)
      const playersToInsert = allPlayersData.filter(player => {
        const key = `${player.name}-${player.team_id}`
        return !existingPlayerMap[key]
      })
      
      if (playersToInsert.length > 0) {
        setResults(prev => [...prev, `Inserting ${playersToInsert.length} new players...`])
        const { error: playersError } = await supabase
          .from("players")
          .upsert(playersToInsert, { onConflict: 'name,team_id' })
        
        if (playersError) throw playersError
        setResults(prev => [...prev, `✓ Inserted ${playersToInsert.length} new players`])
      } else {
        setResults(prev => [...prev, "✓ All players already exist"])
      }
      
      setResults(prev => [...prev, "✅ Database update completed successfully!"])
      
    } catch (error: any) {
      console.error("Error:", error)
      setResults(prev => [...prev, `❌ Error: ${error.message}`])
    } finally {
      setLoading(false)
      checkDatabase() // Refresh stats after update
    }
  }

  // Check database on mount
  React.useEffect(() => {
    checkDatabase()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Database Management</h1>
          <p className="text-muted-foreground">
            Initialize or update your Supabase database
          </p>
        </div>

        {/* Current Database Status */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Current Database Status</h3>
          {checking ? (
            <p className="text-sm text-gray-600">Checking database...</p>
          ) : dbStats ? (
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Teams:</span> {dbStats.teams}
              </div>
              <div>
                <span className="font-medium">Players:</span> {dbStats.players}
              </div>
              <div>
                <span className="font-medium">Trades:</span> {dbStats.trades}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Unable to fetch database status</p>
          )}
        </div>

        <div className="space-y-4">
          {/* Initialize Button */}
          <div className="space-y-2">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm">
                <strong>Initialize:</strong> This will clear ALL existing data and replace it with the initial teams and players.
              </p>
            </div>
            <button
              onClick={initializeDatabase}
              disabled={loading || checking}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Initialize Database (Clear All Data)"}
            </button>
          </div>

          {/* Update Button */}
          <div className="space-y-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Update:</strong> This will add any missing teams or players without affecting existing data. Player ranks and trades are preserved.
              </p>
            </div>
            <button
              onClick={updateDatabase}
              disabled={loading || checking}
              className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Update Database (Preserve Existing Data)"}
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="space-y-2 p-4 bg-muted rounded-lg max-h-96 overflow-y-auto">
            {results.map((result, i) => (
              <p key={i} className="text-sm font-mono">{result}</p>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}