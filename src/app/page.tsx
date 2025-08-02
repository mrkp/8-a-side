import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trophy, Users, Dribbble, Star, Medal, Award, Shield, CalendarIcon, BarChart3, Target, Clock, MapPin } from "lucide-react"
import { QPCCHeader } from "@/components/qpcc-header"
import { TeamLogo } from "@/components/team-logo"
import { PartnersSection } from "@/components/partners-section"
import { HomePageClient } from "@/components/home-page-client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { formatTimeInTimezone, formatDateInTimezone } from "@/utils/date-helpers"

export default async function Home() {
  const supabase = await createClient()
  
  // Get all active teams with their players and rankings
  const { data: teams } = await supabase
    .from("teams")
    .select(`
      *,
      players(*)
    `)
    .eq("active", true)
    .order("name")

  // Get upcoming fixtures
  const { data: fixtures } = await supabase
    .from("fixtures")
    .select(`
      *,
      teamA:teams!fixtures_team_a_fkey(id, name, logo),
      teamB:teams!fixtures_team_b_fkey(id, name, logo)
    `)
    .eq("status", "upcoming")
    .order("date", { ascending: true })
    .limit(6)

  // Calculate statistics
  const totalPlayers = teams?.reduce((acc, team) => acc + team.players.length, 0) || 0

  // Sort teams alphabetically and organize player data
  const teamsWithPlayers = teams?.map(team => {
    const sortedPlayers = [...team.players].sort((a: any, b: any) => 
      a.name.localeCompare(b.name)
    )
    
    return { ...team, players: sortedPlayers }
  }).sort((a, b) => a.name.localeCompare(b.name)) || []

  return (
    <HomePageClient>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="border-b bg-background/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          {/* Header with logo */}
          <div className="flex items-center justify-between mb-12">
            <img 
              src="/qpcc-logo.png" 
              alt="QPCC"
              className="h-16 w-auto"
            />
            <a 
              href="https://wam.now" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border border-border/50 hover:bg-muted/70 transition-colors"
            >
              <span className="text-xs text-muted-foreground">Powered by</span>
              <img src="/wam-logo.svg" alt="WAM!" className="h-4 w-auto" />
            </a>
          </div>
          
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center mb-8">
              <img 
                src="/8-a-side-logo.png" 
                alt="QPCC 8-A-SIDE Football Tournament"
                className="h-48 w-auto object-contain"
              />
            </div>
            
            
            <a 
              href="https://wam.now" 
              target="_blank" 
              rel="noopener noreferrer"
              className="md:hidden inline-flex items-center gap-2 mt-4 px-4 py-2 bg-muted/50 rounded-full border border-border/50 hover:bg-muted/70 transition-colors"
            >
              <span className="text-sm text-muted-foreground">Powered by</span>
              <img 
                src="/wam-logo.svg" 
                alt="WAM!" 
                className="h-5 w-auto"
              />
            </a>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Follow the official QPCC 8-A-SIDE Football Tournament. Track team standings, 
              player rankings, and trading activity as sponsor teams compete for glory.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <Button asChild variant="outline" size="lg">
                <Link href="/fixtures">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Fixtures
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/standings">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Standings
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/rosters">
                  <Users className="mr-2 h-5 w-5" />
                  Team Rosters
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/leaderboard">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Statistics
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Standings Table Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">League Standings</h2>
              <p className="text-muted-foreground">
                Current tournament standings and points
              </p>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center">P</TableHead>
                    <TableHead className="text-center">W</TableHead>
                    <TableHead className="text-center">D</TableHead>
                    <TableHead className="text-center">L</TableHead>
                    <TableHead className="text-center">GF</TableHead>
                    <TableHead className="text-center">GA</TableHead>
                    <TableHead className="text-center">GD</TableHead>
                    <TableHead className="text-center font-bold">Pts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams?.sort((a, b) => {
                    const statsA = a.stats || { points: 0, gd: 0, gf: 0 }
                    const statsB = b.stats || { points: 0, gd: 0, gf: 0 }
                    
                    if (statsB.points !== statsA.points) return statsB.points - statsA.points
                    if (statsB.gd !== statsA.gd) return statsB.gd - statsA.gd
                    return statsB.gf - statsA.gf
                  }).map((team, index) => {
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

                    return (
                      <TableRow key={team.id}>
                        <TableCell>
                          <Badge 
                            variant={index === 0 ? 'default' : index < 4 ? 'secondary' : 'outline'} 
                            className="w-6 h-6 rounded-full p-0 flex items-center justify-center"
                          >
                            {index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {team.logo && (
                              <img src={team.logo} alt="" className="h-5 w-5 object-contain" />
                            )}
                            <span>{team.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{stats.played}</TableCell>
                        <TableCell className="text-center text-green-600">{stats.won}</TableCell>
                        <TableCell className="text-center text-yellow-600">{stats.drawn}</TableCell>
                        <TableCell className="text-center text-red-600">{stats.lost}</TableCell>
                        <TableCell className="text-center">{stats.gf}</TableCell>
                        <TableCell className="text-center">{stats.ga}</TableCell>
                        <TableCell className="text-center">
                          <span className={stats.gd > 0 ? 'text-green-600' : stats.gd < 0 ? 'text-red-600' : ''}>
                            {stats.gd > 0 ? '+' : ''}{stats.gd}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge>{stats.points}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Matches Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Upcoming Matches</h2>
              <p className="text-muted-foreground">
                Next scheduled fixtures
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {fixtures?.map(fixture => (
                <Link key={fixture.id} href={`/live/${fixture.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="default" className="text-xs">
                          {fixture.stage === 'group' ? 'Group Stage' : fixture.stage}
                        </Badge>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{format(new Date(fixture.date), 'MMM d')}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {fixture.teamA?.logo && (
                            <img src={fixture.teamA.logo} alt="" className="h-6 w-6 object-contain" />
                          )}
                          <span className="text-sm font-medium">{fixture.teamA?.name}</span>
                        </div>
                        <div className="text-center text-xs text-muted-foreground">vs</div>
                        <div className="flex items-center gap-2">
                          {fixture.teamB?.logo && (
                            <img src={fixture.teamB.logo} alt="" className="h-6 w-6 object-contain" />
                          )}
                          <span className="text-sm font-medium">{fixture.teamB?.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeInTimezone(fixture.date)}</span>
                        </div>
                        {fixture.venue && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{fixture.venue}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )) || (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No upcoming matches scheduled
                </div>
              )}
            </div>

            <div className="text-center">
              <Button asChild variant="outline">
                <Link href="/fixtures">
                  View All Fixtures
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Teams Overview */}
      <section id="teams" className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Tournament Teams</h2>
              <p className="text-muted-foreground">
                All participating teams and their current rosters
              </p>
            </div>

            {/* Tournament Stats */}
            <div className="grid gap-6 md:grid-cols-2 max-w-md mx-auto">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{teams?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Competing sponsors</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                  <Dribbble className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalPlayers}</div>
                  <p className="text-xs text-muted-foreground">Active participants</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {teamsWithPlayers.map(team => (
                <Card key={team.id} className="overflow-hidden">
                  <CardHeader className="pb-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TeamLogo 
                          src={team.logo} 
                          alt={team.name} 
                          size="sm"
                        />
                        <CardTitle className="text-base">{team.name}</CardTitle>
                      </div>
                      <Badge variant="outline">{team.players.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {team.players.length > 0 ? (
                        team.players.map((player: any) => (
                          <div key={player.id} className="flex items-center py-1">
                            <span className="text-sm font-medium flex items-center gap-1 w-full">
                              {player.jersey_number && (
                                <span className="text-xs text-muted-foreground font-mono w-6">
                                  #{player.jersey_number}
                                </span>
                              )}
                              {player.name}
                              {player.is_captain && (
                                <span 
                                  title="Team Captain" 
                                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold ml-1"
                                >
                                  C
                                </span>
                              )}
                              {player.is_professional && (
                                <span title="Professional Player">
                                  <Trophy className="w-3 h-3 text-yellow-500" />
                                </span>
                              )}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No players assigned yet
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <PartnersSection />

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground space-y-4">
            <p>© 2024 QPCC 8-A-SIDE Football Tournament. All rights reserved.</p>
            <a 
              href="https://wam.now" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 pt-4 hover:opacity-80 transition-opacity"
            >
              <span>Powered by</span>
              <img 
                src="/wam-logo.svg" 
                alt="WAM!" 
                className="h-6 w-auto"
              />
            </a>
          </div>
        </div>
      </footer>
      </div>
    </HomePageClient>
  )
}