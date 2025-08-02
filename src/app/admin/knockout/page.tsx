"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trophy, AlertCircle, ChevronRight } from "lucide-react"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { toast } from "sonner"

interface Team {
  id: string
  name: string
  logo?: string
  stats?: {
    points: number
    gd: number
    gf: number
  }
}

interface Fixture {
  id: string
  team_a: string
  team_b: string
  date: string
  venue: string
  stage: string
  status: string
  score: { teamA: number; teamB: number }
  teamA?: Team
  teamB?: Team
}

export default function KnockoutManagementPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [knockoutFixtures, setKnockoutFixtures] = useState<Fixture[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // Fetch teams with stats
    const { data: teamsData } = await supabase
      .from("teams")
      .select("*")
      .eq("active", true)

    if (teamsData) {
      const sortedTeams = teamsData.sort((a, b) => {
        const statsA = a.stats || { points: 0, gd: 0, gf: 0 }
        const statsB = b.stats || { points: 0, gd: 0, gf: 0 }
        
        if (statsB.points !== statsA.points) return statsB.points - statsA.points
        if (statsB.gd !== statsA.gd) return statsB.gd - statsA.gd
        return statsB.gf - statsA.gf
      })
      setTeams(sortedTeams)
    }

    // Fetch knockout fixtures
    const { data: fixturesData } = await supabase
      .from("fixtures")
      .select(`
        *,
        teamA:teams!fixtures_team_a_fkey(*),
        teamB:teams!fixtures_team_b_fkey(*)
      `)
      .in("stage", ["semifinal", "final"])
      .order("date", { ascending: true })

    if (fixturesData) {
      setKnockoutFixtures(fixturesData)
    }

    setLoading(false)
  }

  const generateKnockoutStage = async () => {
    if (knockoutFixtures.length > 0) {
      if (!confirm("Knockout fixtures already exist. Delete them first to regenerate.")) {
        return
      }
    }

    setGenerating(true)

    try {
      const top4 = teams.slice(0, 4)
      
      if (top4.length < 4) {
        toast.error("Need at least 4 teams to create knockout stage")
        setGenerating(false)
        return
      }

      const knockoutData = [
        // Semifinals
        {
          team_a: top4[0].id,
          team_b: top4[3].id,
          date: '2025-10-03T18:20:00-04:00',
          venue: 'South Field',
          stage: 'semifinal',
          status: 'upcoming',
          score: { teamA: 0, teamB: 0 }
        },
        {
          team_a: top4[1].id,
          team_b: top4[2].id,
          date: '2025-10-03T18:20:00-04:00',
          venue: 'Trinre Field (West)',
          stage: 'semifinal',
          status: 'upcoming',
          score: { teamA: 0, teamB: 0 }
        },
        // Final
        {
          team_a: null,
          team_b: null,
          date: '2025-10-03T20:20:00-04:00',
          venue: 'East Field',
          stage: 'final',
          status: 'upcoming',
          score: { teamA: 0, teamB: 0 }
        }
      ]

      const { error } = await supabase
        .from("fixtures")
        .insert(knockoutData)

      if (error) {
        toast.error("Failed to generate knockout fixtures")
        console.error(error)
      } else {
        toast.success("Knockout stage generated successfully!")
        await fetchData()
      }
    } catch (error) {
      toast.error("Error generating knockout stage")
      console.error(error)
    }

    setGenerating(false)
  }

  const deleteKnockoutStage = async () => {
    if (!confirm("Are you sure you want to delete all knockout fixtures?")) {
      return
    }

    // Delete events first
    const fixtureIds = knockoutFixtures.map(f => f.id)
    await supabase
      .from("events")
      .delete()
      .in("fixture_id", fixtureIds)

    // Delete fixtures
    const { error } = await supabase
      .from("fixtures")
      .delete()
      .in("stage", ["semifinal", "final"])

    if (!error) {
      toast.success("Knockout fixtures deleted")
      setKnockoutFixtures([])
    }
  }

  const updateFinalTeams = async () => {
    const semis = knockoutFixtures.filter(f => f.stage === 'semifinal' && f.status === 'completed')
    const final = knockoutFixtures.find(f => f.stage === 'final')

    if (semis.length !== 2 || !final) {
      toast.error("Both semifinals must be completed first")
      return
    }

    // Determine winners
    const winner1 = semis[0].score.teamA > semis[0].score.teamB ? semis[0].team_a : semis[0].team_b
    const winner2 = semis[1].score.teamA > semis[1].score.teamB ? semis[1].team_a : semis[1].team_b

    const { error } = await supabase
      .from("fixtures")
      .update({
        team_a: winner1,
        team_b: winner2
      })
      .eq("id", final.id)

    if (!error) {
      toast.success("Final match updated with semifinal winners!")
      await fetchData()
    }
  }

  const top4 = teams.slice(0, 4)
  const semifinals = knockoutFixtures.filter(f => f.stage === 'semifinal')
  const final = knockoutFixtures.find(f => f.stage === 'final')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
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
              <h1 className="text-xl font-bold">Knockout Stage Management</h1>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">Back to Admin</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Current Standings */}
          <Card>
            <CardHeader>
              <CardTitle>Current Top 4 Teams</CardTitle>
              <CardDescription>
                These teams will qualify for the knockout stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {top4.map((team, index) => {
                  const stats = team.stats || { points: 0, gd: 0, gf: 0, ga: 0 }
                  return (
                    <div key={team.id} className="flex items-center gap-3 p-4 rounded-lg border">
                      <Badge variant={index === 0 ? "default" : "secondary"} className="text-lg">
                        {index + 1}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          {team.logo && (
                            <img src={team.logo} alt="" className="h-5 w-5 object-contain" />
                          )}
                          {team.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {stats.points} pts • GD: {stats.gd > 0 ? '+' : ''}{stats.gd}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Knockout Stage Status */}
          {knockoutFixtures.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Knockout Fixtures</h3>
                <p className="text-muted-foreground mb-6">
                  Generate the knockout stage based on current standings
                </p>
                <Button onClick={generateKnockoutStage} disabled={generating} size="lg">
                  {generating ? "Generating..." : "Generate Knockout Stage"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Semifinals */}
              <Card>
                <CardHeader>
                  <CardTitle>Semifinals - October 3rd, 6:20 PM AST</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {semifinals.map((match, idx) => (
                      <div key={match.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">Semifinal {idx + 1}</Badge>
                          <Badge variant={
                            match.status === 'completed' ? 'secondary' :
                            match.status === 'live' ? 'destructive' : 'default'
                          }>
                            {match.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{match.teamA?.name || 'TBD'}</span>
                            {match.status !== 'upcoming' && (
                              <span className="text-2xl font-bold">{match.score.teamA}</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{match.teamB?.name || 'TBD'}</span>
                            {match.status !== 'upcoming' && (
                              <span className="text-2xl font-bold">{match.score.teamB}</span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground pt-2">
                            {match.venue}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Final */}
              {final && (
                <Card>
                  <CardHeader>
                    <CardTitle>Final - October 3rd, 8:20 PM AST</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="destructive" className="text-lg">FINAL</Badge>
                        <Badge variant={
                          final.status === 'completed' ? 'secondary' :
                          final.status === 'live' ? 'destructive' : 'default'
                        }>
                          {final.status}
                        </Badge>
                      </div>
                      {final.team_a && final.team_b ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-semibold">{final.teamA?.name}</span>
                            {final.status !== 'upcoming' && (
                              <span className="text-3xl font-bold">{final.score.teamA}</span>
                            )}
                          </div>
                          <div className="text-center text-muted-foreground">vs</div>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-semibold">{final.teamB?.name}</span>
                            {final.status !== 'upcoming' && (
                              <span className="text-3xl font-bold">{final.score.teamB}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">
                            Winners of semifinals will face each other
                          </p>
                          {semifinals.filter(s => s.status === 'completed').length === 2 && (
                            <Button onClick={updateFinalTeams}>
                              Update Final Teams
                            </Button>
                          )}
                        </div>
                      )}
                      <div className="text-center text-muted-foreground pt-4">
                        {final.venue}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Deleting knockout fixtures will remove all semifinal and final matches. 
                      This action cannot be undone.
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-4 mt-4">
                    <Button 
                      variant="destructive" 
                      onClick={deleteKnockoutStage}
                    >
                      Delete Knockout Stage
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/knockout">View Bracket</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}