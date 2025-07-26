import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trophy, Users, Dribbble, Star, Medal, Award, Shield } from "lucide-react"
import { QPCCHeader } from "@/components/qpcc-header"

export default async function Home() {
  const supabase = await createClient()
  
  // Get all teams with their players and rankings
  const { data: teams } = await supabase
    .from("teams")
    .select(`
      *,
      players(*)
    `)
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
  const rankedPlayers = teams?.reduce((acc, team) => 
    acc + team.players.filter((p: any) => p.rank).length, 0) || 0
  
  const rankStats = teams?.reduce((acc, team) => {
    team.players.forEach((player: any) => {
      if (player.rank) {
        acc[player.rank] = (acc[player.rank] || 0) + 1
      }
    })
    return acc
  }, {} as Record<string, number>) || {}

  // Sort teams alphabetically and organize player data
  const teamsWithPlayers = teams?.map(team => {
    const sortedPlayers = [...team.players].sort((a: any, b: any) => {
      const rankOrder = { 'A': 0, 'B': 1, 'C': 2 }
      const aRank = a.rank ? rankOrder[a.rank as keyof typeof rankOrder] : 999
      const bRank = b.rank ? rankOrder[b.rank as keyof typeof rankOrder] : 999
      if (aRank !== bRank) return aRank - bRank
      return a.name.localeCompare(b.name)
    })
    
    return { ...team, players: sortedPlayers }
  }).sort((a, b) => a.name.localeCompare(b.name)) || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="border-b bg-background/50 backdrop-blur">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-4 mb-6">
              <QPCCHeader />
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight">
              <span className="text-primary">QPCC</span> 8-A-SIDE
              <span className="block text-3xl mt-2 text-muted-foreground">Football Tournament</span>
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
          </div>
        </div>
      </section>

      {/* Tournament Stats */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 max-w-6xl mx-auto">
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
                <p className="text-xs text-muted-foreground">
                  {rankedPlayers} ranked ({totalPlayers > 0 ? Math.round((rankedPlayers / totalPlayers) * 100) : 0}%)
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
                <p className="text-xs text-muted-foreground">Skilled players</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">B-Grade</CardTitle>
                <Medal className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rankStats.B || 0}</div>
                <p className="text-xs text-muted-foreground">Competitive players</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">C-Grade</CardTitle>
                <Award className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rankStats.C || 0}</div>
                <p className="text-xs text-muted-foreground">Recreational players</p>
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
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        {team.name}
                      </span>
                      <Badge variant="outline">{team.players.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {team.players.length > 0 ? (
                        team.players.map((player: any) => (
                          <div key={player.id} className="flex items-center justify-between py-1">
                            <span className="text-sm font-medium flex items-center gap-1">
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
                            {player.rank ? (
                              player.rank === 'A' ? (
                                <Badge variant="destructive" className="text-xs">
                                  <Star className="w-3 h-3 mr-1" />A
                                </Badge>
                              ) : player.rank === 'B' ? (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                  <Medal className="w-3 h-3 mr-1" />B
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                  <Award className="w-3 h-3 mr-1" />C
                                </Badge>
                              )
                            ) : (
                              <span className="text-xs text-muted-foreground">Unranked</span>
                            )}
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