import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Trophy, CalendarIcon, Activity, RefreshCw, Edit3, 
  Clock, Settings, BarChart, AlertTriangle, ArrowLeft, LogOut
} from "lucide-react"
import { formatDateInTimezone } from "@/utils/date-helpers"
import { AdminHeader } from "@/components/admin-header"

export default async function AdminPage() {
  const supabase = await createClient()
  
  // Get upcoming and recent fixtures
  const { data: upcomingFixtures } = await supabase
    .from("fixtures")
    .select(`
      *,
      teamA:teams!fixtures_team_a_fkey(id, name, logo),
      teamB:teams!fixtures_team_b_fkey(id, name, logo)
    `)
    .in("status", ["upcoming", "live"])
    .order("date", { ascending: true })
    .limit(5)

  const { data: recentFixtures } = await supabase
    .from("fixtures")
    .select(`
      *,
      teamA:teams!fixtures_team_a_fkey(id, name, logo),
      teamB:teams!fixtures_team_b_fkey(id, name, logo)
    `)
    .eq("status", "completed")
    .order("date", { ascending: false })
    .limit(3)

  // Get match statistics
  const { count: totalMatches } = await supabase
    .from("fixtures")
    .select("*", { count: 'exact', head: true })

  const { count: completedMatches } = await supabase
    .from("fixtures")
    .select("*", { count: 'exact', head: true })
    .eq("status", "completed")

  const { count: upcomingMatches } = await supabase
    .from("fixtures")
    .select("*", { count: 'exact', head: true })
    .eq("status", "upcoming")

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <AdminHeader title="Match Administration" />

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMatches}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedMatches}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{upcomingMatches}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalMatches ? Math.round((completedMatches! / totalMatches) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Live Match Scoring
              </CardTitle>
              <CardDescription>
                Score live matches, track goals, and manage match events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/score">Start Scoring</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-primary" />
                Edit Fixtures
              </CardTitle>
              <CardDescription>
                Edit match details, times, venues, and team assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/fixtures">Manage Fixtures</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                Reset Matches
              </CardTitle>
              <CardDescription>
                Reset match scores and events for replays or corrections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/reset-matches">Reset Matches</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Fixture Generator
              </CardTitle>
              <CardDescription>
                Generate round-robin fixtures for group stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/fixture-generator">Generate Fixtures</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Knockout Stage
              </CardTitle>
              <CardDescription>
                Manage semifinals and final matches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/knockout">Manage Knockout</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                Match Statistics
              </CardTitle>
              <CardDescription>
                View and export match statistics and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/statistics">View Statistics</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Sections */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingFixtures?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming matches scheduled
                  </p>
                )}
                {upcomingFixtures?.map(fixture => (
                  <div key={fixture.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{fixture.teamA?.name}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="font-medium">{fixture.teamB?.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDateInTimezone(fixture.date)} • {fixture.venue}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {fixture.status === 'live' && (
                        <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
                      )}
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/score?fixture=${fixture.id}`}>
                          <Activity className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Recent Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentFixtures?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No completed matches yet
                  </p>
                )}
                {recentFixtures?.map(fixture => (
                  <div key={fixture.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{fixture.teamA?.name}</span>
                        <span className="font-bold text-lg mx-2">
                          {fixture.score?.teamA || 0} - {fixture.score?.teamB || 0}
                        </span>
                        <span className="font-medium">{fixture.teamB?.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDateInTimezone(fixture.date)} • {fixture.venue}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/fixtures?edit=${fixture.id}`}>
                        <Edit3 className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Options */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Advanced Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" asChild>
                <Link href="/admin/teams">
                  Manage Teams
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/setup">
                  Initial Setup
                </Link>
              </Button>
              <Button variant="outline" className="text-orange-600 hover:text-orange-700" asChild>
                <Link href="/admin/reset-tournament">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Reset Tournament
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}