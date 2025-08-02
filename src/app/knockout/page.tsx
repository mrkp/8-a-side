import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"
import Link from "next/link"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export default async function KnockoutPage() {
  const supabase = await createClient()

  // Get knockout fixtures directly from fixtures table
  const { data: knockoutFixtures } = await supabase
    .from("fixtures")
    .select(`
      *,
      teamA:teams!fixtures_team_a_fkey(id, name, logo),
      teamB:teams!fixtures_team_b_fkey(id, name, logo)
    `)
    .in("stage", ["semifinal", "final"])
    .order("date", { ascending: true })

  const semiFinals = knockoutFixtures?.filter(f => f.stage === 'semifinal') || []
  const final = knockoutFixtures?.filter(f => f.stage === 'final') || []
  const hasKnockoutFixtures = semiFinals.length > 0 || final.length > 0

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <QPCCHeader />
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-xl font-bold">Knockout Stage</h1>
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

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Trophy className="h-10 w-10 text-yellow-500" />
              <h2 className="text-4xl font-bold">Tournament Bracket</h2>
            </div>
            <p className="text-xl text-muted-foreground">
              The road to championship glory
            </p>
          </div>

          {/* Tournament Bracket Visualization */}
          {hasKnockoutFixtures ? (
            <div className="max-w-5xl mx-auto">
              {/* Semifinals */}
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-center mb-6">Semifinals</h3>
                <p className="text-center text-muted-foreground mb-8">
                  October 3rd, 2025 • 6:20 PM AST
                </p>
                <div className="grid gap-6 md:grid-cols-2">
                  {semiFinals.map((match, idx) => (
                    <BracketMatch key={match.id} match={match} index={idx + 1} />
                  ))}
                </div>
              </div>

              {/* Final */}
              {final.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-center mb-6">Final</h3>
                  <p className="text-center text-muted-foreground mb-8">
                    October 3rd, 2025 • 8:20 PM AST • {final[0].venue}
                  </p>
                  <div className="max-w-md mx-auto">
                    <BracketMatch match={final[0]} isFinal />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <Card>
              <CardContent className="text-center py-16">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg text-muted-foreground">
                  The knockout stage hasn't been generated yet
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete the group stage matches to generate the bracket
                </p>
                <Button asChild className="mt-6">
                  <Link href="/admin/knockout">
                    Generate Knockout Stage
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

function BracketMatch({ match, isFinal = false, index }: { match: any, isFinal?: boolean, index?: number }) {
  const hasTeams = match.teamA || match.teamB
  const isComplete = match.status === 'completed'
  const isLive = match.status === 'live'
  const isUpcoming = match.status === 'upcoming'
  const score = match.score

  const getWinner = () => {
    if (!isComplete || !score) return null
    return score.teamA > score.teamB ? 'A' : 'B'
  }

  const winner = getWinner()

  return (
    <Link href={!isUpcoming ? `/live/${match.id}` : '#'} className={isUpcoming ? 'cursor-default' : ''}>
      <Card className={cn(
        "overflow-hidden transition-all",
        !isUpcoming && "hover:shadow-lg cursor-pointer",
        isFinal && "border-2 border-yellow-500",
        isLive && "border-2 border-red-500"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={isFinal ? "destructive" : "secondary"}>
                {isFinal ? "FINAL" : `SEMIFINAL ${index || ''}`}
              </Badge>
              {isLive && (
                <Badge variant="destructive" className="animate-pulse">
                  LIVE
                </Badge>
              )}
              {isComplete && (
                <Badge variant="secondary">
                  FT
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {match.venue}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          {hasTeams ? (
            <div className="space-y-3">
              {/* Team A */}
              <div className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                winner === 'A' && "bg-green-500/10 border border-green-500/20"
              )}>
                <div className="flex items-center gap-3">
                  {match.teamA?.logo && (
                    <img src={match.teamA.logo} alt="" className="h-8 w-8 object-contain" />
                  )}
                  <span className={cn(
                    "font-medium",
                    winner === 'A' && "text-green-600 dark:text-green-400"
                  )}>
                    {match.teamA?.name || "TBD"}
                  </span>
                </div>
                {(isLive || isComplete) && (
                  <span className={cn(
                    "text-2xl font-bold",
                    winner === 'A' && "text-green-600 dark:text-green-400"
                  )}>
                    {score?.teamA || 0}
                  </span>
                )}
              </div>

              <div className="text-center text-xs text-muted-foreground">vs</div>

              {/* Team B */}
              <div className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                winner === 'B' && "bg-green-500/10 border border-green-500/20"
              )}>
                <div className="flex items-center gap-3">
                  {match.teamB?.logo && (
                    <img src={match.teamB.logo} alt="" className="h-8 w-8 object-contain" />
                  )}
                  <span className={cn(
                    "font-medium",
                    winner === 'B' && "text-green-600 dark:text-green-400"
                  )}>
                    {match.teamB?.name || "TBD"}
                  </span>
                </div>
                {(isLive || isComplete) && (
                  <span className={cn(
                    "text-2xl font-bold",
                    winner === 'B' && "text-green-600 dark:text-green-400"
                  )}>
                    {score?.teamB || 0}
                  </span>
                )}
              </div>

              {isComplete && winner && (
                <div className="text-center pt-2">
                  <Badge variant="default" className="bg-green-600">
                    {winner === 'A' ? match.teamA?.name : match.teamB?.name} advances
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {isFinal ? "Awaiting semifinal results" : "Teams to be determined"}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}