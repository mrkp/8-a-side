"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, Clock, MapPin, Trophy, Timer, User, ChevronLeft } from "lucide-react"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { format } from "date-fns"
import { useParams } from "next/navigation"
import { GoalCelebration } from "@/components/goal-celebration"

interface MatchEvent {
  id: string
  minute: number
  type: string
  player?: any
  team?: any
  half?: number
  assist_player?: any
}

export default function LiveMatchPage() {
  const params = useParams()
  const fixtureId = params.fixtureId as string
  
  const [fixture, setFixture] = useState<any>(null)
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [displayTime, setDisplayTime] = useState(Date.now())
  const [celebrationData, setCelebrationData] = useState<{
    show: boolean
    playerName: string
    playerImage?: string
    assistName?: string
    assistImage?: string
    teamName: string
    rank?: string
  }>({
    show: false,
    playerName: "",
    teamName: "",
  })
  const supabase = createClient()

  useEffect(() => {
    fetchFixtureData()
    subscribeToUpdates()
  }, [fixtureId])

  // Update display time every second for live matches
  useEffect(() => {
    if (fixture?.status === 'live' && fixture.started_at) {
      const interval = setInterval(() => {
        setDisplayTime(Date.now())
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [fixture?.status, fixture?.started_at])

  // Calculate elapsed time based on actual start time and current half
  const getElapsedSeconds = () => {
    if (!fixture?.started_at) return 0
    
    const currentHalf = fixture.current_half || 1
    let startTime: number
    
    if (currentHalf === 2 && fixture.second_half_started_at) {
      // Second half - calculate from second half start
      startTime = new Date(fixture.second_half_started_at).getTime()
    } else {
      // First half - calculate from match start
      startTime = new Date(fixture.started_at).getTime()
    }
    
    const now = fixture.ended_at 
      ? new Date(fixture.ended_at).getTime() 
      : fixture.half_time_at && currentHalf === 1
      ? new Date(fixture.half_time_at).getTime()
      : displayTime
    
    const elapsed = Math.floor((now - startTime) / 1000) - (fixture.total_paused_time || 0)
    return Math.max(0, elapsed)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const fetchFixtureData = async () => {
    const { data: fixtureData } = await supabase
      .from("fixtures")
      .select(`
        *,
        teamA:teams!fixtures_team_a_fkey(id, name, logo),
        teamB:teams!fixtures_team_b_fkey(id, name, logo)
      `)
      .eq("id", fixtureId)
      .single()

    if (fixtureData) {
      setFixture(fixtureData)
      fetchEvents()
    }
    setLoading(false)
  }

  const fetchEvents = async () => {
    const { data: eventsData } = await supabase
      .from("events")
      .select(`
        *,
        player:players!events_player_id_fkey(id, name, image_url, rank),
        assist_player:players!events_assist_player_id_fkey(id, name, image_url),
        team:teams(id, name)
      `)
      .eq("fixture_id", fixtureId)
      .in("type", ["goal", "own_goal"])
      .order("minute", { ascending: false })

    if (eventsData) {
      setEvents(eventsData)
    }
  }

  const subscribeToUpdates = () => {
    // Subscribe to fixture updates
    const fixtureChannel = supabase
      .channel(`fixture-${fixtureId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'fixtures',
          filter: `id=eq.${fixtureId}`
        },
        (payload) => {
          fetchFixtureData()
        }
      )
      .subscribe()

    // Subscribe to events
    const eventsChannel = supabase
      .channel(`events-${fixtureId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
          filter: `fixture_id=eq.${fixtureId}`
        },
        async (payload) => {
          // Fetch the new event with player details
          const { data: newEvent } = await supabase
            .from("events")
            .select(`
              *,
              player:players!events_player_id_fkey(id, name, image_url, rank),
              assist_player:players!events_assist_player_id_fkey(id, name, image_url),
              team:teams(id, name)
            `)
            .eq("id", payload.new.id)
            .single()

          if (newEvent && (newEvent.type === 'goal' || newEvent.type === 'own_goal') && newEvent.player) {
            // Show celebration for goals (not own goals)
            if (newEvent.type === 'goal') {
              setCelebrationData({
                show: true,
                playerName: newEvent.player.name,
                playerImage: newEvent.player.image_url,
                teamName: newEvent.team.name,
                rank: newEvent.player.rank,
                assistName: newEvent.assist_player?.name,
                assistImage: newEvent.assist_player?.image_url
              })
            }
          }
          
          fetchEvents()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(fixtureChannel)
      supabase.removeChannel(eventsChannel)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading match data...</p>
        </div>
      </div>
    )
  }

  if (!fixture) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Match not found</p>
            <Button asChild className="mt-4">
              <Link href="/fixtures">Back to Fixtures</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isLive = fixture.status === 'live'
  const isCompleted = fixture.status === 'completed'

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Home
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-8" />
              <QPCCHeader />
            </div>
            <div className="flex items-center gap-4">
              {isLive && (
                <Badge variant="destructive" className="animate-pulse">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  LIVE
                </Badge>
              )}
              <Button variant="secondary" size="sm" asChild>
                <Link href={`/scoreboard/${fixtureId}`} target="_blank">
                  Stadium Scoreboard
                </Link>
              </Button>
              <a 
                href="https://wam.now" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border border-border/50 hover:bg-muted/70 transition-colors"
              >
                <span className="text-xs text-muted-foreground">Powered by</span>
                <img src="/wam-logo.svg" alt="WAM!" className="h-4 w-auto" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Score Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className={isLive ? "border-2 border-red-500/50" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>
                      {fixture.stage === 'group' ? 'Group Stage' : 
                       fixture.stage.charAt(0).toUpperCase() + fixture.stage.slice(1)}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(fixture.date), 'MMM d, yyyy • h:mm a')}</span>
                      </div>
                      {fixture.venue && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{fixture.venue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {isCompleted && (
                    <Badge variant="secondary" className="text-lg px-4 py-1">
                      Full Time
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-8 items-center">
                  {/* Team A */}
                  <div className="text-center space-y-3">
                    {fixture.teamA?.logo && (
                      <img 
                        src={fixture.teamA.logo} 
                        alt={fixture.teamA.name}
                        className="h-24 w-24 object-contain mx-auto"
                      />
                    )}
                    <h3 className="text-xl font-bold">{fixture.teamA?.name}</h3>
                    <Badge variant="outline">Home</Badge>
                  </div>

                  {/* Score */}
                  <div className="text-center">
                    <div className="text-6xl font-bold flex items-center justify-center gap-4">
                      <span className={fixture.score.teamA > fixture.score.teamB && isCompleted ? 'text-green-600' : ''}>
                        {fixture.score.teamA}
                      </span>
                      <span className="text-4xl text-muted-foreground">-</span>
                      <span className={fixture.score.teamB > fixture.score.teamA && isCompleted ? 'text-green-600' : ''}>
                        {fixture.score.teamB}
                      </span>
                    </div>
                    {isLive && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-center gap-2 text-sm">
                          <Timer className="h-4 w-4" />
                          <span className="font-mono text-lg">{formatTime(getElapsedSeconds())}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {fixture.current_half === 2 ? '2nd Half' : '1st Half'} • Match in progress
                        </p>
                      </div>
                    )}
                    {fixture?.half_time_at && !fixture?.second_half_started_at && (
                      <div className="mt-4">
                        <Badge variant="secondary" className="text-sm">
                          HALF TIME
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Team B */}
                  <div className="text-center space-y-3">
                    {fixture.teamB?.logo && (
                      <img 
                        src={fixture.teamB.logo} 
                        alt={fixture.teamB.name}
                        className="h-24 w-24 object-contain mx-auto"
                      />
                    )}
                    <h3 className="text-xl font-bold">{fixture.teamB?.name}</h3>
                    <Badge variant="outline">Away</Badge>
                  </div>
                </div>

                {/* Match Stats Summary */}
                {events.length > 0 && (
                  <div className="mt-8 pt-8 border-t">
                    <div className="grid grid-cols-2 gap-8 text-center">
                      <div>
                        <p className="text-3xl font-bold">
                          {events.filter(e => e.type === 'goal' && e.team?.id === fixture.team_a).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Goals</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold">
                          {events.filter(e => e.type === 'goal' && e.team?.id === fixture.team_b).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Goals</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Match Events Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Match Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {events.length > 0 ? (
                    <div className="space-y-4">
                      {events.map((event, idx) => (
                        <div key={event.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                          <Badge variant="outline" className="mt-1">
                            {event.minute}'
                            {event.half === 2 && (
                              <span className="ml-1 text-xs">(2nd)</span>
                            )}
                          </Badge>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={event.player?.image_url} />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {event.player?.name}
                                  {event.type === 'own_goal' && (
                                    <span className="text-sm text-muted-foreground ml-2">(Own Goal)</span>
                                  )}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>{event.team?.name}</span>
                                  {event.player?.rank && (
                                    <Badge variant="outline" className="text-xs">
                                      Rank {event.player.rank}
                                    </Badge>
                                  )}
                                </div>
                                {event.assist_player && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Assist: {event.assist_player.name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div>
                            {event.type === 'goal' && <span className="text-2xl">⚽</span>}
                            {event.type === 'own_goal' && <span className="text-2xl opacity-50">⚽</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No events yet</p>
                      {fixture.status === 'upcoming' && (
                        <p className="text-sm mt-2">Match hasn't started</p>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Match Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Match Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Competition</p>
                  <p className="font-medium">QPCC 8-A-SIDE Tournament</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stage</p>
                  <p className="font-medium">
                    {fixture.stage === 'group' ? 'Group Stage' : 
                     fixture.stage.charAt(0).toUpperCase() + fixture.stage.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div>
                    <Badge variant={
                      fixture.status === 'live' ? 'destructive' :
                      fixture.status === 'completed' ? 'secondary' : 'default'
                    }>
                      {fixture.status.charAt(0).toUpperCase() + fixture.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goal Scorers */}
            {events.filter(e => e.type === 'goal' || e.type === 'own_goal').length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Goal Scorers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events
                      .filter(e => e.type === 'goal' || e.type === 'own_goal')
                      .map((event, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={event.player?.image_url} />
                            <AvatarFallback>
                              <User className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {event.player?.name}
                              {event.type === 'own_goal' && ' (OG)'}
                            </p>
                            <p className="text-xs text-muted-foreground">{event.minute}'</p>
                          </div>
                          <span className="text-lg">⚽</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Goal Celebration */}
      <GoalCelebration
        show={celebrationData.show}
        playerName={celebrationData.playerName}
        playerImage={celebrationData.playerImage}
        teamName={celebrationData.teamName}
        rank={celebrationData.rank}
        onComplete={() => {
          setCelebrationData({ ...celebrationData, show: false })
        }}
      />
    </div>
  )
}