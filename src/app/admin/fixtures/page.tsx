import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Clock, MapPin, Trophy, Users, Edit, Plus } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"
import { AdminNav } from "@/components/admin-nav"
import { FixtureEditDialog } from "@/components/fixtures/fixture-edit-dialog"
import { AddFixtureDialog } from "@/components/fixtures/add-fixture-dialog"

export default async function AdminFixturesPage() {
  const supabase = await createClient()

  // Get all fixtures with team details
  const { data: fixtures } = await supabase
    .from("fixtures")
    .select(`
      *,
      teamA:teams!fixtures_team_a_fkey(id, name, logo),
      teamB:teams!fixtures_team_b_fkey(id, name, logo),
      player_of_match:players(id, name)
    `)
    .order("date", { ascending: false })

  // Get all active teams for the add fixture dialog
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .eq("active", true)
    .order("name")

  // Group fixtures by status
  const upcomingFixtures = fixtures?.filter(f => f.status === 'upcoming') || []
  const liveFixtures = fixtures?.filter(f => f.status === 'live') || []
  const completedFixtures = fixtures?.filter(f => f.status === 'completed') || []

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <QPCCHeader />
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-xl font-bold">Fixture Management</h1>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">Back to Admin</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <AdminNav />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Manage Fixtures</h2>
                <p className="text-muted-foreground mt-1">
                  Add, edit, and update match fixtures and results
                </p>
              </div>
              <AddFixtureDialog teams={teams || []} />
            </div>

            <Tabs defaultValue="upcoming" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 max-w-lg">
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

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingFixtures.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-muted-foreground">No upcoming fixtures</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
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
                  <div className="grid gap-4">
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
                  <div className="grid gap-4">
                    {completedFixtures.slice(0, 20).map(fixture => (
                      <FixtureCard key={fixture.id} fixture={fixture} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">Quick Actions</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Click on any fixture to view and update match details</li>
                <li>• Use the "Add Fixture" button to create new matches</li>
                <li>• Update scores and match status in real-time</li>
                <li>• Add match reports and player of the match after completion</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function FixtureCard({ fixture }: { fixture: any }) {
  const isLive = fixture.status === 'live'
  const isCompleted = fixture.status === 'completed'

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
            {isCompleted && (
              <Badge variant="secondary">
                COMPLETED
              </Badge>
            )}
          </div>
          <FixtureEditDialog fixture={fixture} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 items-center gap-4">
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="font-medium">{fixture.teamA?.name}</span>
              {fixture.teamA?.logo && (
                <img src={fixture.teamA.logo} alt={fixture.teamA.name} className="h-8 w-8 object-contain" />
              )}
            </div>
          </div>
          
          <div className="text-center">
            {(isLive || isCompleted) ? (
              <div className="text-2xl font-bold">
                {fixture.score.teamA} - {fixture.score.teamB}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">vs</div>
            )}
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2">
              {fixture.teamB?.logo && (
                <img src={fixture.teamB.logo} alt={fixture.teamB.name} className="h-8 w-8 object-contain" />
              )}
              <span className="font-medium">{fixture.teamB?.name}</span>
            </div>
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

        {fixture.player_of_match && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-muted-foreground">Player of the Match:</span>
              <span className="font-medium">{fixture.player_of_match.name}</span>
            </div>
          </div>
        )}

        {fixture.attendance && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>Attendance: {fixture.attendance}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}