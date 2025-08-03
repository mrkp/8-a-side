"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  RefreshCw, AlertTriangle, ArrowLeft, Check, X
} from "lucide-react"
import { toast } from "sonner"
import { AdminHeader } from "@/components/admin-header"
import { formatDateInTimezone } from "@/utils/date-helpers"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Fixture {
  id: string
  date: string
  venue: string
  status: string
  score: { teamA: number; teamB: number }
  teamA: { id: string; name: string; logo?: string }
  teamB: { id: string; name: string; logo?: string }
  stage: string
}

export default function ResetMatchesPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "completed" | "live">("completed")
  const supabase = createClient()

  useEffect(() => {
    fetchFixtures()
  }, [filter])

  const fetchFixtures = async () => {
    setLoading(true)
    let query = supabase
      .from("fixtures")
      .select(`
        *,
        teamA:teams!fixtures_team_a_fkey(*),
        teamB:teams!fixtures_team_b_fkey(*)
      `)
      .order("date", { ascending: false })

    if (filter === "completed") {
      query = query.eq("status", "completed")
    } else if (filter === "live") {
      query = query.eq("status", "live")
    } else {
      query = query.in("status", ["completed", "live"])
    }

    const { data } = await query
    setFixtures(data || [])
    setLoading(false)
  }

  const resetMatch = async (fixtureId: string) => {
    if (!confirm("Are you sure you want to reset this match? This will delete all goals and events.")) {
      return
    }

    setResetting(fixtureId)

    try {
      // Delete all events for this fixture
      const { error: eventsError } = await supabase
        .from("events")
        .delete()
        .eq("fixture_id", fixtureId)

      if (eventsError) throw eventsError

      // Reset the fixture
      const { error: fixtureError } = await supabase
        .from("fixtures")
        .update({
          status: "upcoming",
          score: { teamA: 0, teamB: 0 },
          started_at: null,
          half_time_at: null,
          second_half_started_at: null,
          ended_at: null,
          current_half: null
        })
        .eq("id", fixtureId)

      if (fixtureError) throw fixtureError

      // Update team stats
      const fixture = fixtures.find(f => f.id === fixtureId)
      if (fixture) {
        await updateTeamStats(fixture.teamA.id)
        await updateTeamStats(fixture.teamB.id)
      }

      toast.success("Match reset successfully")
      await fetchFixtures()
    } catch (error) {
      toast.error("Failed to reset match")
      console.error(error)
    } finally {
      setResetting(null)
    }
  }

  const updateTeamStats = async (teamId: string) => {
    // Recalculate team stats based on completed fixtures
    const { data: fixtures } = await supabase
      .from("fixtures")
      .select("*, events(*)")
      .or(`team_a.eq.${teamId},team_b.eq.${teamId}`)
      .eq("status", "completed")

    if (!fixtures) return

    let played = 0
    let won = 0
    let drawn = 0
    let lost = 0
    let gf = 0
    let ga = 0

    fixtures.forEach(fixture => {
      const isTeamA = fixture.team_a === teamId
      const teamGoals = isTeamA ? fixture.score.teamA : fixture.score.teamB
      const opponentGoals = isTeamA ? fixture.score.teamB : fixture.score.teamA

      played++
      gf += teamGoals
      ga += opponentGoals

      if (teamGoals > opponentGoals) won++
      else if (teamGoals < opponentGoals) lost++
      else drawn++
    })

    const points = won * 3 + drawn
    const gd = gf - ga

    await supabase
      .from("teams")
      .update({
        stats: { played, won, drawn, lost, gf, ga, gd, points }
      })
      .eq("id", teamId)
  }

  const bulkReset = async () => {
    const completedFixtures = fixtures.filter(f => f.status === "completed")
    if (completedFixtures.length === 0) {
      toast.error("No completed matches to reset")
      return
    }

    if (!confirm(`Are you sure you want to reset ALL ${completedFixtures.length} completed matches? This cannot be undone.`)) {
      return
    }

    setResetting("bulk")

    try {
      // Reset all completed fixtures
      for (const fixture of completedFixtures) {
        await resetMatch(fixture.id)
      }
      
      toast.success(`Reset ${completedFixtures.length} matches successfully`)
    } catch (error) {
      toast.error("Failed to reset some matches")
      console.error(error)
    } finally {
      setResetting(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <AdminHeader title="Reset Matches" backTo="/admin" backLabel="Back to Admin" />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Resetting a match will delete all goals, assists, and events. The match will return to "upcoming" status.
              Team statistics will be automatically recalculated.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Match Reset Options</CardTitle>
                  <CardDescription>
                    Select matches to reset or use bulk operations
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed Only</SelectItem>
                      <SelectItem value="live">Live Only</SelectItem>
                      <SelectItem value="all">All Matches</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="destructive" 
                    onClick={bulkReset}
                    disabled={resetting === "bulk" || fixtures.filter(f => f.status === "completed").length === 0}
                  >
                    {resetting === "bulk" ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Reset All Completed
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading matches...
                </div>
              ) : fixtures.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No matches found to reset
                </div>
              ) : (
                <div className="space-y-3">
                  {fixtures.map(fixture => (
                    <div key={fixture.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {fixture.teamA.logo && (
                              <img src={fixture.teamA.logo} alt="" className="h-6 w-6 object-contain" />
                            )}
                            <span className="font-medium">{fixture.teamA.name}</span>
                          </div>
                          <div className="flex items-center gap-2 font-bold text-lg">
                            <span>{fixture.score.teamA}</span>
                            <span className="text-muted-foreground">-</span>
                            <span>{fixture.score.teamB}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{fixture.teamB.name}</span>
                            {fixture.teamB.logo && (
                              <img src={fixture.teamB.logo} alt="" className="h-6 w-6 object-contain" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{formatDateInTimezone(fixture.date)}</span>
                          <span>•</span>
                          <span>{fixture.venue}</span>
                          <span>•</span>
                          <Badge variant={fixture.status === "live" ? "destructive" : "secondary"}>
                            {fixture.status}
                          </Badge>
                          {fixture.stage !== "group" && (
                            <>
                              <span>•</span>
                              <Badge variant="outline">{fixture.stage}</Badge>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resetMatch(fixture.id)}
                        disabled={resetting === fixture.id}
                        className="ml-4"
                      >
                        {resetting === fixture.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        Reset
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}