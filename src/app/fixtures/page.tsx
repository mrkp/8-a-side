import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Clock, MapPin, Trophy } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"

export default async function FixturesPage() {
  const supabase = await createClient()

  // Get all fixtures with team details
  const { data: fixtures } = await supabase
    .from("fixtures")
    .select(`
      *,
      teamA:teams!fixtures_team_a_fkey(id, name, logo),
      teamB:teams!fixtures_team_b_fkey(id, name, logo)
    `)
    .order("date", { ascending: true })

  // Group fixtures by status
  const upcomingFixtures = fixtures?.filter(f => f.status === 'upcoming') || []
  const liveFixtures = fixtures?.filter(f => f.status === 'live') || []
  const completedFixtures = fixtures?.filter(f => f.status === 'completed') || []

  // Group fixtures by stage
  const groupStageFixtures = fixtures?.filter(f => f.stage === 'group') || []
  const knockoutFixtures = fixtures?.filter(f => f.stage !== 'group') || []

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <QPCCHeader />
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-xl font-bold">Fixtures & Results</h1>
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
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="all">All Fixtures</TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming
              {upcomingFixtures.length > 0 && (
                <Badge variant="secondary" className="ml-2">{upcomingFixtures.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="live">
              Live
              {liveFixtures.length > 0 && (
                <Badge variant="destructive" className="ml-2">{liveFixtures.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {knockoutFixtures.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Knockout Stage
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {knockoutFixtures.map(fixture => (
                    <FixtureCard key={fixture.id} fixture={fixture} />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Group Stage</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupStageFixtures.map(fixture => (
                  <FixtureCard key={fixture.id} fixture={fixture} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingFixtures.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">No upcoming fixtures</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingFixtures.map(fixture => (
                  <FixtureCard key={fixture.id} fixture={fixture} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="live" className="space-y-4">
            {liveFixtures.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">No live matches</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {liveFixtures.map(fixture => (
                  <FixtureCard key={fixture.id} fixture={fixture} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedFixtures.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">No completed fixtures yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedFixtures.map(fixture => (
                  <FixtureCard key={fixture.id} fixture={fixture} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
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
            }>
              {fixture.stage === 'group' ? 'Group Stage' : fixture.stage.charAt(0).toUpperCase() + fixture.stage.slice(1)}
            </Badge>
            {isLive && (
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {fixture.teamA?.logo && (
                  <img src={fixture.teamA.logo} alt={fixture.teamA.name} className="h-8 w-8 object-contain" />
                )}
                <span className="font-medium">{fixture.teamA?.name}</span>
              </div>
              {(isLive || isCompleted) && (
                <span className="text-2xl font-bold">{fixture.score.teamA}</span>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {isLive ? 'vs' : isCompleted ? 'FT' : 'vs'}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {fixture.teamB?.logo && (
                  <img src={fixture.teamB.logo} alt={fixture.teamB.name} className="h-8 w-8 object-contain" />
                )}
                <span className="font-medium">{fixture.teamB?.name}</span>
              </div>
              {(isLive || isCompleted) && (
                <span className="text-2xl font-bold">{fixture.score.teamB}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              <span>{format(new Date(fixture.date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(fixture.date), 'h:mm a')}</span>
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
  )
}