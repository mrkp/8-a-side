import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { PlayerCard } from "@/components/team/player-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, Star, Medal, Award, TrendingUp } from "lucide-react"

export default async function TeamPage({
  params
}: {
  params: Promise<{ teamId: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Get team
  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("id", resolvedParams.teamId)
    .single()

  if (!team) redirect("/")

  // Get team players
  const { data: players } = await supabase
    .from("players")
    .select("*")
    .eq("team_id", resolvedParams.teamId)
    .order("rank", { ascending: true })
    .order("name", { ascending: true })

  const rankOrder = { 'A': 0, 'B': 1, 'C': 2 }
  const sortedPlayers = players?.sort((a, b) => {
    const aRank = a.rank ? rankOrder[a.rank as keyof typeof rankOrder] : 999
    const bRank = b.rank ? rankOrder[b.rank as keyof typeof rankOrder] : 999
    if (aRank !== bRank) return aRank - bRank
    return a.name.localeCompare(b.name)
  }) || []

  // Calculate team statistics
  const rankStats = sortedPlayers.reduce((acc, player) => {
    if (player.rank) {
      acc[player.rank] = (acc[player.rank] || 0) + 1
    } else {
      acc.unranked = (acc.unranked || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const rankedPlayerCount = sortedPlayers.filter(p => p.rank).length
  const rankingPercentage = sortedPlayers.length > 0 ? Math.round((rankedPlayerCount / sortedPlayers.length) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            My Team Roster
          </h2>
          <p className="text-muted-foreground text-lg">
            Manage your players and set their performance rankings
          </p>
        </div>

        {/* Team Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Players</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sortedPlayers.length}</div>
              <p className="text-xs text-muted-foreground">
                {rankedPlayerCount} ranked ({rankingPercentage}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">A-Grade</CardTitle>
              <Star className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rankStats.A || 0}</div>
              <p className="text-xs text-muted-foreground">Elite performers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">B-Grade</CardTitle>
              <Medal className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rankStats.B || 0}</div>
              <p className="text-xs text-muted-foreground">Strong players</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">C-Grade</CardTitle>
              <Award className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rankStats.C || 0}</div>
              <p className="text-xs text-muted-foreground">Solid contributors</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Players Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Player Rankings</h3>
          <div className="flex gap-2">
            {rankStats.A && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                A: {rankStats.A}
              </Badge>
            )}
            {rankStats.B && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                <Medal className="h-3 w-3" />
                B: {rankStats.B}
              </Badge>
            )}
            {rankStats.C && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center gap-1">
                <Award className="h-3 w-3" />
                C: {rankStats.C}
              </Badge>
            )}
            {rankStats.unranked && (
              <Badge variant="outline" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Unranked: {rankStats.unranked}
              </Badge>
            )}
          </div>
        </div>

        {sortedPlayers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                teamId={resolvedParams.teamId}
                editable
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Players Assigned</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Your team doesn't have any players yet. Players will be assigned during the draft or through trades.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}