import { createClient } from "@/utils/supabase/server"
import { TeamOverview } from "@/components/tournament/team-overview"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trophy, Users, ArrowLeft, TrendingUp, Activity, Dribbble } from "lucide-react"
import { QPCCHeader } from "@/components/qpcc-header"
import Link from "next/link"

export default async function TournamentPage() {
  const supabase = await createClient()

  // Get all teams with their players
  const { data: teams } = await supabase
    .from("teams")
    .select(`
      *,
      players(*)
    `)
    .order("name")

  // Get trade statistics
  const { count: totalTrades } = await supabase
    .from("trades")
    .select("*", { count: 'exact', head: true })

  const { count: pendingTrades } = await supabase
    .from("trades")
    .select("*", { count: 'exact', head: true })
    .eq("status", "pending")

  // Sort players within each team
  const teamsWithSortedPlayers = teams?.map(team => ({
    ...team,
    players: team.players.sort((a: any, b: any) => {
      const rankOrder = { 'A': 0, 'B': 1, 'C': 2 }
      const aRank = a.rank ? rankOrder[a.rank as keyof typeof rankOrder] : 999
      const bRank = b.rank ? rankOrder[b.rank as keyof typeof rankOrder] : 999
      if (aRank !== bRank) return aRank - bRank
      return a.name.localeCompare(b.name)
    })
  })) || []

  // Calculate tournament statistics
  const totalPlayers = teamsWithSortedPlayers.reduce((acc, team) => acc + team.players.length, 0)
  const totalRankedPlayers = teamsWithSortedPlayers.reduce((acc, team) => 
    acc + team.players.filter((p: any) => p.rank).length, 0)
  const rankStats = teamsWithSortedPlayers.reduce((acc, team) => {
    team.players.forEach((player: any) => {
      if (player.rank) {
        acc[player.rank] = (acc[player.rank] || 0) + 1
      }
    })
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <QPCCHeader />
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-3">
              <Dribbble className="h-6 w-6 text-green-600" />
              <h1 className="text-xl font-bold">Tournament Dashboard</h1>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Team Selection
            </Link>
          </Button>
        </div>
      </header>
      
      <main className="container py-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="text-lg px-4 py-1">
                QPCC 8-A-SIDE Football Tournament
              </Badge>
            </div>
            <h2 className="text-4xl font-bold">Tournament Overview</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track team rosters, player rankings, and trading activity across all participating teams
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamsWithSortedPlayers.length}</div>
                <p className="text-xs text-muted-foreground">Sponsor teams participating</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPlayers}</div>
                <p className="text-xs text-muted-foreground">
                  {totalRankedPlayers} ranked ({Math.round((totalRankedPlayers / totalPlayers) * 100)}%)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Trades</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingTrades || 0}</div>
                <p className="text-xs text-muted-foreground">{totalTrades || 0} total proposals</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Player Rankings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 text-sm">
                  <Badge variant="destructive">A: {rankStats.A || 0}</Badge>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">B: {rankStats.B || 0}</Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">C: {rankStats.C || 0}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Teams Grid */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Team Rosters</h3>
              <p className="text-muted-foreground">
                Click on any team card to manage their roster and trades
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {teamsWithSortedPlayers.map(team => (
                <TeamOverview key={team.id} team={team} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}