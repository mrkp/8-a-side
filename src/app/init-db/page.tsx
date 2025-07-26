"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"

export default function InitDBPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const supabase = createClient()

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
      
      const teams = [
        { id: '11111111-1111-1111-1111-111111111111', name: 'Aioli', slug: 'aioli', email: 'aioli@8aside.com' },
        { id: '22222222-2222-2222-2222-222222222222', name: 'WAM', slug: 'wam', email: 'wam@8aside.com' },
        { id: '33333333-3333-3333-3333-333333333333', name: 'FoodDrop', slug: 'fooddrop', email: 'fooddrop@8aside.com' },
        { id: '44444444-4444-4444-4444-444444444444', name: 'Bliss', slug: 'bliss', email: 'bliss@8aside.com' },
        { id: '55555555-5555-5555-5555-555555555555', name: 'Karcher', slug: 'karcher', email: 'karcher@8aside.com' },
        { id: '66666666-6666-6666-6666-666666666666', name: 'Full Barrell', slug: 'full-barrell', email: 'fullbarrell@8aside.com' },
        { id: '77777777-7777-7777-7777-777777777777', name: 'Ready Freddie', slug: 'ready-freddie', email: 'readyfreddie@8aside.com' },
        { id: '88888888-8888-8888-8888-888888888888', name: 'Mini Bar', slug: 'mini-bar', email: 'minibar@8aside.com' }
      ]
      
      const { error: teamsError } = await supabase.from("teams").insert(teams)
      if (teamsError) throw teamsError
      
      setResults(prev => [...prev, `✓ Inserted ${teams.length} teams`])
      
      // Insert players
      setResults(prev => [...prev, "Inserting players..."])
      
      const players = [
        // Aioli (9 players)
        { name: 'Adrian Almandoz', team_id: '11111111-1111-1111-1111-111111111111', rank: null },
        { name: 'Graeme Jones', team_id: '11111111-1111-1111-1111-111111111111', rank: null },
        { name: 'John Aboud', team_id: '11111111-1111-1111-1111-111111111111', rank: null },
        { name: 'Jordan Weeks', team_id: '11111111-1111-1111-1111-111111111111', rank: null },
        { name: 'Matthew Camacho', team_id: '11111111-1111-1111-1111-111111111111', rank: null },
        { name: 'Matthew Clerk', team_id: '11111111-1111-1111-1111-111111111111', rank: null },
        { name: 'Myles Yorke', team_id: '11111111-1111-1111-1111-111111111111', rank: null },
        { name: 'Romario Gonzales', team_id: '11111111-1111-1111-1111-111111111111', rank: null },
        { name: 'Seve Day', team_id: '11111111-1111-1111-1111-111111111111', rank: null },
        
        // WAM (9 players)
        { name: 'Joel Ogeer', team_id: '22222222-2222-2222-2222-222222222222', rank: null },
        { name: 'Jonathan Low', team_id: '22222222-2222-2222-2222-222222222222', rank: null },
        { name: 'Joshua Joseph', team_id: '22222222-2222-2222-2222-222222222222', rank: null },
        { name: 'Keshav Bahadursingh', team_id: '22222222-2222-2222-2222-222222222222', rank: null },
        { name: 'Luke Darwent', team_id: '22222222-2222-2222-2222-222222222222', rank: null },
        { name: 'Mark Pereira', team_id: '22222222-2222-2222-2222-222222222222', rank: null },
        { name: 'Matthew Jardim', team_id: '22222222-2222-2222-2222-222222222222', rank: null },
        { name: 'Stokeley Smart', team_id: '22222222-2222-2222-2222-222222222222', rank: null },
        { name: 'Willie Medford', team_id: '22222222-2222-2222-2222-222222222222', rank: null },
        
        // FoodDrop (8 players)
        { name: 'Christian Landreth-Smith', team_id: '33333333-3333-3333-3333-333333333333', rank: null },
        { name: 'Brandon Brown', team_id: '33333333-3333-3333-3333-333333333333', rank: null },
        { name: 'Craig Beepath', team_id: '33333333-3333-3333-3333-333333333333', rank: null },
        { name: 'Jesu Rampersad', team_id: '33333333-3333-3333-3333-333333333333', rank: null },
        { name: 'Jordan Vieira', team_id: '33333333-3333-3333-3333-333333333333', rank: null },
        { name: 'Kwesi Callender', team_id: '33333333-3333-3333-3333-333333333333', rank: null },
        { name: 'Luke Ramdeen', team_id: '33333333-3333-3333-3333-333333333333', rank: null },
        { name: 'Ross Williams', team_id: '33333333-3333-3333-3333-333333333333', rank: null },
        
        // Bliss (9 players)
        { name: 'Benjamin Decle', team_id: '44444444-4444-4444-4444-444444444444', rank: null },
        { name: 'Gary Griffith III', team_id: '44444444-4444-4444-4444-444444444444', rank: null },
        { name: 'Kevin Ferreira', team_id: '44444444-4444-4444-4444-444444444444', rank: null },
        { name: 'Kristian Bocage', team_id: '44444444-4444-4444-4444-444444444444', rank: null },
        { name: 'Peter Sealy II', team_id: '44444444-4444-4444-4444-444444444444', rank: null },
        { name: 'Richard Scott', team_id: '44444444-4444-4444-4444-444444444444', rank: null },
        { name: 'Rosario Sookdeo', team_id: '44444444-4444-4444-4444-444444444444', rank: null },
        { name: 'Sean De Silva', team_id: '44444444-4444-4444-4444-444444444444', rank: null },
        { name: 'Richard Fifi', team_id: '44444444-4444-4444-4444-444444444444', rank: null },
        
        // Karcher (8 players)
        { name: 'Charles Hadden', team_id: '55555555-5555-5555-5555-555555555555', rank: null },
        { name: 'Jelani Bynoe', team_id: '55555555-5555-5555-5555-555555555555', rank: null },
        { name: 'Justin Brooks', team_id: '55555555-5555-5555-5555-555555555555', rank: null },
        { name: 'Ross Darlington', team_id: '55555555-5555-5555-5555-555555555555', rank: null },
        { name: 'Scott Fanovich', team_id: '55555555-5555-5555-5555-555555555555', rank: null },
        { name: 'Tyrese Williams', team_id: '55555555-5555-5555-5555-555555555555', rank: null },
        { name: 'Dillion Abraham', team_id: '55555555-5555-5555-5555-555555555555', rank: null },
        { name: 'John Paul Abraham', team_id: '55555555-5555-5555-5555-555555555555', rank: null },
        
        // Full Barrell (9 players)
        { name: 'Adian Young', team_id: '66666666-6666-6666-6666-666666666666', rank: null },
        { name: 'Jerell Alexander', team_id: '66666666-6666-6666-6666-666666666666', rank: null },
        { name: 'Kyle Mowser', team_id: '66666666-6666-6666-6666-666666666666', rank: null },
        { name: 'Kyron Rudd', team_id: '66666666-6666-6666-6666-666666666666', rank: null },
        { name: 'Randy Antoine', team_id: '66666666-6666-6666-6666-666666666666', rank: null },
        { name: 'Raul Rampersad', team_id: '66666666-6666-6666-6666-666666666666', rank: null },
        { name: 'Ryan Mowser', team_id: '66666666-6666-6666-6666-666666666666', rank: null },
        { name: 'Ryan Williams', team_id: '66666666-6666-6666-6666-666666666666', rank: null },
        { name: 'Shirvan Ramdhanie', team_id: '66666666-6666-6666-6666-666666666666', rank: null },
        
        // Ready Freddie (9 players)
        { name: 'Benn Fitzawilliams', team_id: '77777777-7777-7777-7777-777777777777', rank: null },
        { name: 'Craig Cockburn', team_id: '77777777-7777-7777-7777-777777777777', rank: null },
        { name: 'Dylan Galt', team_id: '77777777-7777-7777-7777-777777777777', rank: null },
        { name: 'John De Lima', team_id: '77777777-7777-7777-7777-777777777777', rank: null },
        { name: 'John Murray', team_id: '77777777-7777-7777-7777-777777777777', rank: null },
        { name: 'Jonathan Sealy', team_id: '77777777-7777-7777-7777-777777777777', rank: null },
        { name: 'Kristoff Headly', team_id: '77777777-7777-7777-7777-777777777777', rank: null },
        { name: 'Paul Fitzwilliams', team_id: '77777777-7777-7777-7777-777777777777', rank: null },
        { name: 'Sebastian Peterson', team_id: '77777777-7777-7777-7777-777777777777', rank: null },
        
        // Mini Bar (9 players)
        { name: 'Daniel West', team_id: '88888888-8888-8888-8888-888888888888', rank: null },
        { name: 'Kiel Lopez', team_id: '88888888-8888-8888-8888-888888888888', rank: null },
        { name: 'Matthew Sealy', team_id: '88888888-8888-8888-8888-888888888888', rank: null },
        { name: 'Ryan Daniel', team_id: '88888888-8888-8888-8888-888888888888', rank: null },
        { name: 'Shavak Ramberan', team_id: '88888888-8888-8888-8888-888888888888', rank: null },
        { name: 'Varindra Jagrup', team_id: '88888888-8888-8888-8888-888888888888', rank: null },
        { name: 'Xavier Jones', team_id: '88888888-8888-8888-8888-888888888888', rank: null },
        { name: 'Anim Hosein', team_id: '88888888-8888-8888-8888-888888888888', rank: null },
        { name: 'JC Patterson', team_id: '88888888-8888-8888-8888-888888888888', rank: null }
      ]
      
      const { error: playersError } = await supabase.from("players").insert(players)
      if (playersError) throw playersError
      
      setResults(prev => [...prev, `✓ Inserted ${players.length} players`])
      setResults(prev => [...prev, "✅ Database initialized successfully!"])
      
    } catch (error: any) {
      console.error("Error:", error)
      setResults(prev => [...prev, `❌ Error: ${error.message}`])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Initialize Database</h1>
          <p className="text-muted-foreground">
            This will add all teams and players to your Supabase database
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm">
            <strong>Warning:</strong> This will clear any existing data and replace it with the initial teams and players.
          </p>
        </div>

        <button
          onClick={initializeDatabase}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Initializing..." : "Initialize Database"}
        </button>

        {results.length > 0 && (
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            {results.map((result, i) => (
              <p key={i} className="text-sm font-mono">{result}</p>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}