import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, MapPin } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export default async function FixturesContent() {
  const supabase = await createClient()

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select(`
      *,
      teamA:teams!fixtures_team_a_fkey(id, name, logo),
      teamB:teams!fixtures_team_b_fkey(id, name, logo)
    `)
    .order("date", { ascending: true })
    .limit(20)

  const upcomingFixtures = fixtures?.filter(f => f.status === 'upcoming') || []
  const recentFixtures = fixtures?.filter(f => f.status === 'completed').slice(0, 5) || []

  return (
    <div className="space-y-6">
      {upcomingFixtures.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Upcoming Matches</h3>
            <Link href="/fixtures" className="text-sm text-muted-foreground hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingFixtures.slice(0, 6).map(fixture => (
              <FixtureCard key={fixture.id} fixture={fixture} />
            ))}
          </div>
        </div>
      )}

      {recentFixtures.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Recent Results</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentFixtures.map(fixture => (
              <FixtureCard key={fixture.id} fixture={fixture} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FixtureCard({ fixture }: { fixture: any }) {
  const isLive = fixture.status === 'live'
  const isCompleted = fixture.status === 'completed'

  return (
    <Link href={`/live/${fixture.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant={
              fixture.stage === 'final' ? 'destructive' :
              fixture.stage === 'semifinal' ? 'secondary' :
              fixture.stage === 'quarterfinal' ? 'outline' : 'default'
            } className="text-xs">
              {fixture.stage === 'group' ? 'Group' : fixture.stage}
            </Badge>
            {isLive && (
              <Badge variant="destructive" className="animate-pulse text-xs">
                LIVE
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="secondary" className="text-xs">
                FT
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                {fixture.teamA?.logo && (
                  <img src={fixture.teamA.logo} alt="" className="h-6 w-6 object-contain" />
                )}
                <span className="text-sm font-medium truncate">{fixture.teamA?.name}</span>
              </div>
              {(isLive || isCompleted) && (
                <span className="text-lg font-bold">{fixture.score.teamA}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                {fixture.teamB?.logo && (
                  <img src={fixture.teamB.logo} alt="" className="h-6 w-6 object-contain" />
                )}
                <span className="text-sm font-medium truncate">{fixture.teamB?.name}</span>
              </div>
              {(isLive || isCompleted) && (
                <span className="text-lg font-bold">{fixture.score.teamB}</span>
              )}
            </div>
          </div>

          {!isCompleted && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                <span>{format(new Date(fixture.date), 'MMM d')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{format(new Date(fixture.date), 'h:mm a')}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}