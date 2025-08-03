import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  BarChart, ArrowLeft, Trophy, Target, Users, Clock,
  TrendingUp, Award, AlertCircle
} from "lucide-react"
import { AdminHeader } from "@/components/admin-header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function StatisticsPage() {
  const supabase = await createClient()
  
  // Get overall statistics
  const { data: fixtures } = await supabase
    .from("fixtures")
    .select(`
      *,
      teamA:teams!fixtures_team_a_fkey(id, name),
      teamB:teams!fixtures_team_b_fkey(id, name),
      events(*)
    `)
    .eq("status", "completed")

  const { data: topScorers } = await supabase
    .from("top_scorers")
    .select("*")
    .limit(10)

  const { data: topAssists } = await supabase
    .from("top_assists")
    .select("*")
    .limit(5)

  const { data: cleanSheets } = await supabase
    .from("clean_sheets")
    .select("*")
    .limit(5)

  // Calculate statistics
  const totalGoals = fixtures?.reduce((sum, f) => sum + (f.score?.teamA || 0) + (f.score?.teamB || 0), 0) || 0
  const totalMatches = fixtures?.length || 0
  const avgGoalsPerMatch = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : "0"
  
  // Highest scoring match
  const highestScoringMatch = fixtures?.reduce((max, f) => {
    const total = (f.score?.teamA || 0) + (f.score?.teamB || 0)
    const maxTotal = (max?.score?.teamA || 0) + (max?.score?.teamB || 0)
    return total > maxTotal ? f : max
  }, fixtures?.[0])

  // Team with most goals
  const teamGoals: Record<string, { name: string; goals: number }> = {}
  fixtures?.forEach(f => {
    if (f.teamA) {
      teamGoals[f.teamA.id] = teamGoals[f.teamA.id] || { name: f.teamA.name, goals: 0 }
      teamGoals[f.teamA.id].goals += f.score?.teamA || 0
    }
    if (f.teamB) {
      teamGoals[f.teamB.id] = teamGoals[f.teamB.id] || { name: f.teamB.name, goals: 0 }
      teamGoals[f.teamB.id].goals += f.score?.teamB || 0
    }
  })
  const topScoringTeam = Object.values(teamGoals).sort((a, b) => b.goals - a.goals)[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <AdminHeader title="Match Statistics" backTo="/admin" backLabel="Back to Admin" />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Total Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalGoals}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {totalMatches} matches
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Goals per Match
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{avgGoalsPerMatch}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Highest Scoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                {highestScoringMatch ? (
                  <>
                    <div className="text-3xl font-bold">
                      {(highestScoringMatch.score?.teamA || 0) + (highestScoringMatch.score?.teamB || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {highestScoringMatch.teamA?.name} vs {highestScoringMatch.teamB?.name}
                    </p>
                  </>
                ) : (
                  <div className="text-muted-foreground">No data</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Top Scoring Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topScoringTeam ? (
                  <>
                    <div className="text-3xl font-bold">{topScoringTeam.goals}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {topScoringTeam.name}
                    </p>
                  </>
                ) : (
                  <div className="text-muted-foreground">No data</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Scorers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top Scorers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center">Goals</TableHead>
                    <TableHead className="text-center">Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topScorers?.map((player, index) => (
                    <TableRow key={player.player_id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{player.player_name}</TableCell>
                      <TableCell>{player.team_name}</TableCell>
                      <TableCell className="text-center font-bold">{player.goals}</TableCell>
                      <TableCell className="text-center">
                        {player.player_rank && (
                          <Badge variant="outline">Rank {player.player_rank}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!topScorers || topScorers.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No goals scored yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Assists */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Assists
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-center">Assists</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topAssists?.map((player, index) => (
                      <TableRow key={player.player_id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{player.player_name}</TableCell>
                        <TableCell>{player.team_name}</TableCell>
                        <TableCell className="text-center font-bold">{player.assists}</TableCell>
                      </TableRow>
                    ))}
                    {(!topAssists || topAssists.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No assists recorded yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Clean Sheets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Clean Sheets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-center">Clean Sheets</TableHead>
                      <TableHead className="text-center">Matches</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cleanSheets?.map((team, index) => (
                      <TableRow key={team.team_id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{team.team_name}</TableCell>
                        <TableCell className="text-center font-bold">{team.clean_sheets}</TableCell>
                        <TableCell className="text-center">{team.matches_played}</TableCell>
                      </TableRow>
                    ))}
                    {(!cleanSheets || cleanSheets.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No clean sheets yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}