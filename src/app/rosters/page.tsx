import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Trophy, Shield, User } from "lucide-react"
import Link from "next/link"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"
import { TeamLogo } from "@/components/team-logo"

export default async function RostersPage() {
  const supabase = await createClient()

  // Get all teams with their players
  const { data: teams } = await supabase
    .from("teams")
    .select(`
      *,
      players(*)
    `)
    .eq("active", true)
    .order("name")

  // Sort teams and organize player data
  const teamsWithPlayers = teams?.map(team => {
    const sortedPlayers = [...team.players].sort((a: any, b: any) => {
      // Sort alphabetically by name
      return a.name.localeCompare(b.name)
    })
    
    return { ...team, players: sortedPlayers }
  }).sort((a, b) => a.name.localeCompare(b.name)) || []

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <QPCCHeader />
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-xl font-bold">Team Rosters</h1>
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
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">35 & Under Division</h2>
            <p className="text-muted-foreground">
              Complete team rosters with jersey numbers
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teamsWithPlayers.map(team => (
              <Card key={team.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TeamLogo 
                        src={team.logo} 
                        alt={team.name} 
                        size="lg"
                      />
                      <div>
                        <CardTitle className="text-xl">{team.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {team.players.length} Players
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {team.players.length > 0 ? (
                      <div className="grid gap-2">
                        {team.players.map((player: any) => (
                          <div 
                            key={player.id} 
                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {player.jersey_number && (
                                <span className="text-lg font-bold text-muted-foreground w-8 text-right">
                                  {player.jersey_number}
                                </span>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{player.name}</span>
                                {player.is_captain && (
                                  <Badge variant="default" className="h-5 px-1 text-xs">
                                    C
                                  </Badge>
                                )}
                                {player.is_professional && (
                                  <Trophy className="w-4 h-4 text-yellow-500" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No players assigned yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-6 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-3">Legend</h3>
            <div className="grid gap-2 md:grid-cols-3 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="h-5 px-1 text-xs">C</Badge>
                <span className="text-muted-foreground">Team Captain</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-muted-foreground">Professional Player</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}