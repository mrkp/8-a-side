import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, ChevronRight, Users } from "lucide-react"
import Link from "next/link"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"

interface BracketMatch {
  id: string
  stage: string
  position: number
  team_a?: string
  team_b?: string
  winner?: string
  fixture_id?: string
  teamA?: any
  teamB?: any
  fixture?: any
}

export default async function KnockoutPage() {
  const supabase = await createClient()

  // Get knockout bracket data
  const { data: bracketMatches } = await supabase
    .from("knockout_bracket")
    .select(`
      *,
      teamA:teams!knockout_bracket_team_a_fkey(id, name, logo),
      teamB:teams!knockout_bracket_team_b_fkey(id, name, logo),
      fixture:fixtures!knockout_bracket_fixture_id_fkey(id, score, status)
    `)
    .order("stage")
    .order("position")

  // Group matches by stage
  const quarterFinals = bracketMatches?.filter(m => m.stage === 'quarterfinal') || []
  const semiFinals = bracketMatches?.filter(m => m.stage === 'semifinal') || []
  const final = bracketMatches?.filter(m => m.stage === 'final') || []

  // Get teams sorted by group stage performance for bracket generation
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("group")

  const sortedTeams = (teams || []).sort((a, b) => {
    const statsA = a.stats || { points: 0, gd: 0, gf: 0 }
    const statsB = b.stats || { points: 0, gd: 0, gf: 0 }
    
    if (statsB.points !== statsA.points) return statsB.points - statsA.points
    if (statsB.gd !== statsA.gd) return statsB.gd - statsA.gd
    return statsB.gf - statsA.gf
  })

  const groupATeams = sortedTeams.filter(t => t.group === 'A').slice(0, 4)
  const groupBTeams = sortedTeams.filter(t => t.group === 'B').slice(0, 4)

  const canGenerateBracket = quarterFinals.length === 0 && groupATeams.length === 4 && groupBTeams.length === 4

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
                <Link href="/dashboard">Back to Dashboard</Link>
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

          {/* Generate Bracket Button */}
          {canGenerateBracket && (
            <Card className="border-dashed">
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Group stage complete! Generate the knockout bracket based on final standings.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Matchups: 1A vs 4B, 2A vs 3B, 1B vs 4A, 2B vs 3A
                </p>
                <Button asChild size="lg">
                  <Link href="/admin/knockout/generate">
                    Generate Knockout Bracket
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Tournament Bracket Visualization */}
          {quarterFinals.length > 0 && (
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr_1fr]">
              {/* Quarter Finals */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-center mb-6">Quarter Finals</h3>
                {quarterFinals.map((match, idx) => (
                  <BracketMatch key={match.id} match={match} />
                ))}
              </div>

              {/* Semi Finals */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-center mb-6">Semi Finals</h3>
                <div className="pt-16">
                  {semiFinals.map((match, idx) => (
                    <div key={match.id} className={idx === 0 ? "mb-32" : ""}>
                      <BracketMatch match={match} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Final */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-center mb-6">Final</h3>
                <div className="flex items-center justify-center h-full">
                  {final[0] && <BracketMatch match={final[0]} isFinal />}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {quarterFinals.length === 0 && !canGenerateBracket && (
            <Card>
              <CardContent className="text-center py-16">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg text-muted-foreground">
                  The knockout stage hasn't started yet
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete the group stage matches to generate the bracket
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

function BracketMatch({ match, isFinal = false }: { match: BracketMatch, isFinal?: boolean }) {
  const hasTeams = match.team_a && match.team_b
  const isComplete = match.fixture?.status === 'completed'
  const winnerId = isComplete && match.fixture?.score ? 
    (match.fixture.score.teamA > match.fixture.score.teamB ? match.team_a : match.team_b) : null

  return (
    <Card className={`${isFinal ? 'border-2 border-yellow-500' : ''} ${!hasTeams ? 'opacity-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant={isFinal ? 'destructive' : 'secondary'}>
            {match.stage === 'quarterfinal' ? `QF ${match.position}` : 
             match.stage === 'semifinal' ? `SF ${match.position}` : 'FINAL'}
          </Badge>
          {match.fixture?.status === 'live' && (
            <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasTeams ? (
          <div className="space-y-3">
            {/* Team A */}
            <div className={`flex items-center justify-between p-2 rounded ${
              winnerId === match.team_a ? 'bg-green-500/20 border border-green-500' : ''
            }`}>
              <div className="flex items-center gap-2">
                {match.teamA?.logo && (
                  <img src={match.teamA.logo} alt="" className="h-6 w-6 object-contain" />
                )}
                <span className="font-medium">{match.teamA?.name || 'TBD'}</span>
              </div>
              {match.fixture && (
                <span className="text-lg font-bold">{match.fixture.score.teamA}</span>
              )}
            </div>

            {/* Team B */}
            <div className={`flex items-center justify-between p-2 rounded ${
              winnerId === match.team_b ? 'bg-green-500/20 border border-green-500' : ''
            }`}>
              <div className="flex items-center gap-2">
                {match.teamB?.logo && (
                  <img src={match.teamB.logo} alt="" className="h-6 w-6 object-contain" />
                )}
                <span className="font-medium">{match.teamB?.name || 'TBD'}</span>
              </div>
              {match.fixture && (
                <span className="text-lg font-bold">{match.fixture.score.teamB}</span>
              )}
            </div>

            {match.fixture_id && (
              <div className="pt-2 border-t">
                <Button asChild size="sm" variant="ghost" className="w-full">
                  <Link href={`/live/${match.fixture_id}`}>
                    View Match
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Awaiting teams</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}