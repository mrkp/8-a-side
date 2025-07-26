"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"

const teams = [
  { email: "aioli@8aside.com", name: "Aioli" },
  { email: "wam@8aside.com", name: "Wam!" },
  { email: "fooddrop@8aside.com", name: "FoodDrop" },
  { email: "bliss@8aside.com", name: "Bliss" },
  { email: "karcher@8aside.com", name: "Karcher" },
  { email: "fullbarrel@8aside.com", name: "Full Barrel" },
  { email: "readyfreddie@8aside.com", name: "Ready Freddie" },
  { email: "minibar@8aside.com", name: "Mini Bar" },
]

export default function SetupPage() {
  const [password, setPassword] = useState("password123")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const supabase = createClient()

  const createTeamUsers = async () => {
    setLoading(true)
    setResults([])
    
    for (const team of teams) {
      try {
        const { error } = await supabase.auth.signUp({
          email: team.email,
          password: password,
        })
        
        if (error) {
          setResults(prev => [...prev, `❌ ${team.name}: ${error.message}`])
        } else {
          setResults(prev => [...prev, `✅ ${team.name}: User created`])
        }
      } catch (error: any) {
        setResults(prev => [...prev, `❌ ${team.name}: ${error.message}`])
      }
    }
    
    setLoading(false)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Setup Team Accounts</h1>
          <p className="text-muted-foreground">
            Create user accounts for all 8 teams
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Password for all teams
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md"
              placeholder="Enter password"
            />
          </div>

          <button
            onClick={createTeamUsers}
            disabled={loading || !password}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Creating users..." : "Create All Team Users"}
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <h3 className="font-medium">Results:</h3>
            {results.map((result, i) => (
              <p key={i} className="text-sm">{result}</p>
            ))}
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-1">
          <p>This will create users with these emails:</p>
          <ul className="list-disc list-inside">
            {teams.map(team => (
              <li key={team.email}>{team.email}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}