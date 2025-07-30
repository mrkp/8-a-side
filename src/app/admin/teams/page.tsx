"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"
import { Users, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface TeamStrength {
  id: string
  name: string
  active: boolean
  player_count: number
  strength_score: number
  roster: string
}

export default function TeamStrengthPage() {
  const [teams, setTeams] = useState<TeamStrength[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    fetchTeamStrength()
  }, [])

  const fetchTeamStrength = async () => {
    const { data, error } = await supabase
      .from("team_strength")
      .select("*")
      .order("strength_score", { ascending: true }) // Strongest teams first (lower score = stronger)

    if (data) {
      setTeams(data)
    }
    setLoading(false)
  }

  const getStrengthColor = (score: number) => {
    if (score <= 1.5) return "text-red-600 bg-red-50" // Very strong
    if (score <= 2.0) return "text-orange-600 bg-orange-50" // Strong
    if (score <= 2.5) return "text-yellow-600 bg-yellow-50" // Balanced
    if (score <= 3.0) return "text-blue-600 bg-blue-50" // Weak
    return "text-purple-600 bg-purple-50" // Very weak
  }

  const getStrengthLabel = (score: number) => {
    if (score <= 1.5) return "Very Strong"
    if (score <= 2.0) return "Strong"
    if (score <= 2.5) return "Balanced"
    if (score <= 3.0) return "Weak"
    return "Needs Support"
  }

  const averageStrength = teams.length > 0 
    ? teams.reduce((sum, t) => sum + t.strength_score, 0) / teams.length 
    : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading team data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <QPCCHeader />
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-xl font-bold">Team Strength Analysis</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/supplemental">Supplemental Draft</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin">Back to Admin</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* League Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>League Balance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{teams.filter(t => t.active).length}</p>
                <p className="text-sm text-muted-foreground">Active Teams</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{averageStrength.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Average Strength</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {teams.filter(t => t.player_count < 10).length}
                </p>
                <p className="text-sm text-muted-foreground">Teams Need Players</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {Math.max(...teams.map(t => t.strength_score)) - Math.min(...teams.map(t => t.strength_score))}
                </p>
                <p className="text-sm text-muted-foreground">Strength Gap</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teams Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((team, index) => (
            <Card 
              key={team.id}
              className={!team.active ? "opacity-60" : ""}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {team.name}
                      {!team.active && (
                        <Badge variant="destructive" className="text-xs">Dropped</Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {team.player_count} players
                      </span>
                      {team.player_count < 10 && (
                        <Badge variant="outline" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Needs {10 - team.player_count} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStrengthColor(team.strength_score)}`}>
                      {team.strength_score < averageStrength ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {team.strength_score.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getStrengthLabel(team.strength_score)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Roster:</p>
                  <p className="text-sm text-muted-foreground">
                    {team.roster || "No players assigned"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Legend */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Strength Score Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-20 px-2 py-1 rounded text-center text-red-600 bg-red-50">≤ 1.5</div>
                <span>Very Strong (mostly A-ranked players)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 px-2 py-1 rounded text-center text-orange-600 bg-orange-50">1.5 - 2.0</div>
                <span>Strong (mix of A and B players)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 px-2 py-1 rounded text-center text-yellow-600 bg-yellow-50">2.0 - 2.5</div>
                <span>Balanced (mostly B players)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 px-2 py-1 rounded text-center text-blue-600 bg-blue-50">2.5 - 3.0</div>
                <span>Weak (mix of B and C players)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 px-2 py-1 rounded text-center text-purple-600 bg-purple-50">&gt; 3.0</div>
                <span>Needs Support (mostly C players or incomplete)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}