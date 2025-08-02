import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Trophy, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TeamRosterPage({ params }: { params: Promise<{ team: string }> }) {
  const supabase = await createClient()
  const { team } = await params

  // Decode team name from URL
  const teamName = decodeURIComponent(team)

  // Get team with players
  const { data: teamData, error } = await supabase
    .from("teams")
    .select(`
      *,
      players(
        id,
        name,
        jersey_number,
        rank,
        position,
        is_captain,
        is_professional,
        goals,
        assists
      )
    `)
    .eq("name", teamName)
    .eq("active", true)
    .single()

  if (error || !teamData) {
    notFound()
  }

  // Sort players alphabetically by name
  const sortedPlayers = [...teamData.players].sort((a: any, b: any) => {
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <QPCCHeader />
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-xl font-bold">{teamData.name} Roster</h1>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/rosters">
                <ArrowLeft className="h-4 w-4 mr-2" />
                All Rosters
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="bg-muted/30">
              <div className="flex items-center gap-4">
                {teamData.logo && (
                  <img src={teamData.logo} alt={teamData.name} className="h-16 w-16 object-contain" />
                )}
                <div>
                  <CardTitle className="text-2xl">{teamData.name}</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {teamData.division || '35 & Under'} • {sortedPlayers.length} Players
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-1">
                {sortedPlayers.map((player: any) => (
                  <div 
                    key={player.id} 
                    className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-muted-foreground w-12 text-center">
                        {player.jersey_number || '-'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-lg">{player.name}</span>
                          {player.is_captain && (
                            <Badge variant="default" className="h-5 px-1 text-xs">C</Badge>
                          )}
                          {player.is_professional && (
                            <Trophy className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        {player.position && (
                          <p className="text-sm text-muted-foreground">{player.position}</p>
                        )}
                      </div>
                    </div>
                    {(player.goals > 0 || player.assists > 0) && (
                      <div className="text-sm text-muted-foreground">
                        {player.goals > 0 && <span>{player.goals} goals</span>}
                        {player.goals > 0 && player.assists > 0 && <span> • </span>}
                        {player.assists > 0 && <span>{player.assists} assists</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Jersey numbers and player information as of {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}