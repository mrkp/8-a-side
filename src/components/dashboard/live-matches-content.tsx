import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock } from "lucide-react"
import Link from "next/link"

export default async function LiveMatchesContent() {
  const supabase = await createClient()

  const { data: liveMatches } = await supabase
    .from("fixtures")
    .select(`
      *,
      teamA:teams!fixtures_team_a_fkey(id, name, logo),
      teamB:teams!fixtures_team_b_fkey(id, name, logo),
      events(*)
    `)
    .eq("status", "live")
    .order("date", { ascending: true })

  if (!liveMatches || liveMatches.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-16">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg text-muted-foreground">No live matches at the moment</p>
            <p className="text-sm text-muted-foreground mt-2">Check back during match times</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {liveMatches.map(match => (
          <Link key={match.id} href={`/live/${match.id}`}>
            <Card className="hover:shadow-lg transition-all duration-300 border-2 border-red-500/50 bg-red-50/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Live Match</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <Badge variant="destructive" className="animate-pulse">
                      LIVE
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {match.teamA?.logo && (
                        <img src={match.teamA.logo} alt={match.teamA.name} className="h-10 w-10 object-contain" />
                      )}
                      <div>
                        <p className="font-semibold">{match.teamA?.name}</p>
                        <p className="text-xs text-muted-foreground">Home</p>
                      </div>
                    </div>
                    <span className="text-3xl font-bold">{match.score.teamA}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {match.teamB?.logo && (
                        <img src={match.teamB.logo} alt={match.teamB.name} className="h-10 w-10 object-contain" />
                      )}
                      <div>
                        <p className="font-semibold">{match.teamB?.name}</p>
                        <p className="text-xs text-muted-foreground">Away</p>
                      </div>
                    </div>
                    <span className="text-3xl font-bold">{match.score.teamB}</span>
                  </div>
                </div>

                {match.events && match.events.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Latest events:</p>
                    <div className="space-y-1">
                      {match.events.slice(-3).reverse().map((event: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="text-xs">
                            {event.minute}'
                          </Badge>
                          <span className="text-muted-foreground">
                            {event.type === 'goal' ? '⚽' : event.type === 'own_goal' ? '⚽ (OG)' : ''}
                            {' Goal'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center pt-2">
                  <Badge variant="secondary" className="text-xs">
                    Click to view live updates
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}