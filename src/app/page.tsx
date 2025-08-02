import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trophy, Users, Dribbble, Star, Medal, Award, Shield, CalendarIcon, BarChart3, Target } from "lucide-react"
import { QPCCHeader } from "@/components/qpcc-header"
import { TeamLogo } from "@/components/team-logo"

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

  // Get recent trades
  const { data: recentTrades } = await supabase
    .from("trades")
    .select(`
      *,
      from_team:teams!trades_from_team_id_fkey(name),
      to_team:teams!trades_to_team_id_fkey(name)
    `)
    .eq("status", "accepted")
    .order("updated_at", { ascending: false })
    .limit(5)

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="border-b bg-background/50 backdrop-blur">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center mb-8">
              <img 
                src="/8-a-side-logo.png" 
                alt="QPCC 8-A-SIDE Football Tournament"
                className="h-48 w-auto object-contain"
              />
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="block text-2xl text-muted-foreground">"Proud to be a Parkite"</span>
            </h1>
            
            <a 
              href="https://wam.now" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-muted/50 rounded-full border border-border/50 hover:bg-muted/70 transition-colors"
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
              <Button asChild size="lg">
                <Link href="/dashboard">
                  <Trophy className="mr-2 h-5 w-5" />
                  Tournament Dashboard
                </Link>
              </Button>
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
                  <Target className="mr-2 h-5 w-5" />
                  Top Scorers
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/knockout">
                  <Trophy className="mr-2 h-5 w-5" />
                  Knockout Stage
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tournament Stats */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
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
        </div>
      </section>

      <Separator />

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


      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground space-y-4">
            <p>© 2024 QPCC 8-A-SIDE Football Tournament. All rights reserved.</p>
            <p>
              <Link href="/admin" className="hover:text-foreground">Team Management</Link>
              {" • "}
              <Link href="/tournament" className="hover:text-foreground">Full Tournament View</Link>
              {" • "}
              <Link href="/init-db" className="hover:text-foreground">Database</Link>
            </p>
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
  )
}