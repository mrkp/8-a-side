import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function StandingsPage() {
  const supabase = await createClient()

  // Get all teams with their stats
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("name")

  // Group teams by division/group
  const groupA = teams?.filter(t => t.group === 'A') || []
  const groupB = teams?.filter(t => t.group === 'B') || []
  const allTeams = teams || []

  // Sort teams by points, then goal difference, then goals for
  const sortTeams = (teams: any[]) => {
    return teams.sort((a, b) => {
      const statsA = a.stats || { points: 0, gd: 0, gf: 0 }
      const statsB = b.stats || { points: 0, gd: 0, gf: 0 }
      
      // First by points
      if (statsB.points !== statsA.points) {
        return statsB.points - statsA.points
      }
      // Then by goal difference
      if (statsB.gd !== statsA.gd) {
        return statsB.gd - statsA.gd
      }
      // Then by goals for
      return statsB.gf - statsA.gf
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <QPCCHeader />
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-xl font-bold">Tournament Standings</h1>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="https://wam.now" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border border-border/50 hover:bg-muted/70 transition-colors"
              >
                <span className="text-xs text-muted-foreground">Powered by</span>
                <img src="/wam-logo.svg" alt="WAM!" className="h-4 w-auto" />
              </a>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Points Table
            </h2>
            <p className="text-muted-foreground">
              Win = 3 points • Draw = 1 point • Loss = 0 points
            </p>
          </div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="all">All Teams</TabsTrigger>
              <TabsTrigger value="groupA">Group A</TabsTrigger>
              <TabsTrigger value="groupB">Group B</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <StandingsTable teams={sortTeams(allTeams)} showGroup />
            </TabsContent>

            <TabsContent value="groupA">
              <StandingsTable teams={sortTeams(groupA)} />
            </TabsContent>

            <TabsContent value="groupB">
              <StandingsTable teams={sortTeams(groupB)} />
            </TabsContent>
          </Tabs>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="font-medium">P</span> - Played</div>
                <div><span className="font-medium">W</span> - Won</div>
                <div><span className="font-medium">D</span> - Drawn</div>
                <div><span className="font-medium">L</span> - Lost</div>
                <div><span className="font-medium">GF</span> - Goals For</div>
                <div><span className="font-medium">GA</span> - Goals Against</div>
                <div><span className="font-medium">GD</span> - Goal Difference</div>
                <div><span className="font-medium">Pts</span> - Points</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function StandingsTable({ teams, showGroup = false }: { teams: any[], showGroup?: boolean }) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Team</TableHead>
            {showGroup && <TableHead className="text-center">Group</TableHead>}
            <TableHead className="text-center">P</TableHead>
            <TableHead className="text-center">W</TableHead>
            <TableHead className="text-center">D</TableHead>
            <TableHead className="text-center">L</TableHead>
            <TableHead className="text-center">GF</TableHead>
            <TableHead className="text-center">GA</TableHead>
            <TableHead className="text-center">GD</TableHead>
            <TableHead className="text-center font-bold">Pts</TableHead>
            <TableHead className="w-16">Form</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, index) => {
            const stats = team.stats || {
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              gf: 0,
              ga: 0,
              gd: 0,
              points: 0
            }

            // Determine position badge color
            const positionVariant = index === 0 ? 'default' : 
                                  index < 4 ? 'secondary' : 
                                  'outline'

            return (
              <TableRow key={team.id}>
                <TableCell>
                  <Badge variant={positionVariant} className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  <Link href={`/team/${team.id}`} className="flex items-center gap-2 hover:underline">
                    {team.logo && (
                      <img src={team.logo} alt={team.name} className="h-6 w-6 object-contain" />
                    )}
                    {team.name}
                  </Link>
                </TableCell>
                {showGroup && (
                  <TableCell className="text-center">
                    <Badge variant="outline">{team.group || '-'}</Badge>
                  </TableCell>
                )}
                <TableCell className="text-center">{stats.played}</TableCell>
                <TableCell className="text-center text-green-600 font-medium">{stats.won}</TableCell>
                <TableCell className="text-center text-yellow-600 font-medium">{stats.drawn}</TableCell>
                <TableCell className="text-center text-red-600 font-medium">{stats.lost}</TableCell>
                <TableCell className="text-center">{stats.gf}</TableCell>
                <TableCell className="text-center">{stats.ga}</TableCell>
                <TableCell className="text-center font-medium">
                  <span className={stats.gd > 0 ? 'text-green-600' : stats.gd < 0 ? 'text-red-600' : ''}>
                    {stats.gd > 0 ? '+' : ''}{stats.gd}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className="font-bold">{stats.points}</Badge>
                </TableCell>
                <TableCell>
                  {stats.played > 0 && (
                    <div className="flex items-center gap-0.5">
                      {stats.gd > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : stats.gd < 0 ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : (
                        <Minus className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}