import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RealtimeTrades } from "@/components/realtime/realtime-trades"
import { Users, ArrowLeftRight, Trophy, MoreHorizontal } from "lucide-react"

export default async function TeamLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ teamId: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  // Get team data with player count
  const { data: team } = await supabase
    .from("teams")
    .select(`
      *,
      players:players(count)
    `)
    .eq("id", resolvedParams.teamId)
    .single()

  // Get pending trades for this team
  const { count } = await supabase
    .from("trades")
    .select("*", { count: 'exact', head: true })
    .or(`from_team_id.eq.${resolvedParams.teamId},to_team_id.eq.${resolvedParams.teamId}`)
    .eq("status", "pending")
  
  const pendingTrades = count || 0

  if (!team) {
    redirect("/")
  }

  const playerCount = team.players?.[0]?.count || 0

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container">
          {/* Top Header */}
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                  {team.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl font-bold">{team.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {playerCount} players
                    {pendingTrades > 0 && (
                      <>
                        <Separator orientation="vertical" className="h-3" />
                        <Badge variant="secondary" className="text-xs">
                          {pendingTrades} pending trades
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                Switch Team
              </Link>
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex h-12 items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/team/${resolvedParams.teamId}`} className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                My Team
              </Link>
            </Button>
            
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/team/${resolvedParams.teamId}/trades`} className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                Trades
                {pendingTrades > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs px-1 py-0 min-w-5 h-5">
                    {pendingTrades}
                  </Badge>
                )}
              </Link>
            </Button>
            
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tournament" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Tournament
              </Link>
            </Button>

            <div className="ml-auto">
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </nav>
        </div>
      </header>
      
      <main className="container py-8">
        <RealtimeTrades teamId={resolvedParams.teamId} />
        {children}
      </main>
    </div>
  )
}