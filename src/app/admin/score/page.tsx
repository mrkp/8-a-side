"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { Plus, Minus, Trophy, Users, Activity, Timer } from "lucide-react"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

interface Fixture {
  id: string
  team_a: string
  team_b: string
  date: string
  status: string
  score: { teamA: number; teamB: number }
  teamA?: any
  teamB?: any
  started_at?: string
  ended_at?: string
  paused_at?: string
  total_paused_time?: number
  current_half?: number
  half_time_at?: string
  second_half_started_at?: string
}

interface Player {
  id: string
  name: string
  rank?: string
  image_url?: string
}

export default function ScorePage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null)
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([])
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([])
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false)
  const [scoringTeam, setScoringTeam] = useState<'A' | 'B'>('A')
  const [selectedPlayer, setSelectedPlayer] = useState<string>("")
  const [selectedAssistPlayer, setSelectedAssistPlayer] = useState<string>("")
  const [isOwnGoal, setIsOwnGoal] = useState(false)
  const [matchStartTime, setMatchStartTime] = useState<Date | null>(null)
  const [showHalfTimeDialog, setShowHalfTimeDialog] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchFixtures()
  }, [])

  useEffect(() => {
    if (selectedFixture) {
      fetchPlayers(selectedFixture.team_a, selectedFixture.team_b)
      // Refetch fixture to get latest timing data
      refreshFixtureData(selectedFixture.id)
      
      // Debug log
      console.log('Selected fixture:', {
        id: selectedFixture.id,
        status: selectedFixture.status,
        current_half: selectedFixture.current_half,
        half_time_at: selectedFixture.half_time_at,
        second_half_started_at: selectedFixture.second_half_started_at
      })
    }
  }, [selectedFixture?.id])

  const refreshFixtureData = async (fixtureId: string) => {
    const { data } = await supabase
      .from("fixtures")
      .select("*")
      .eq("id", fixtureId)
      .single()
    
    if (data) {
      setSelectedFixture(prev => ({ ...prev, ...data }))
      if (data.started_at) {
        setMatchStartTime(new Date(data.started_at))
      }
    }
  }

  // Update timer display every second and force component re-render
  const [, forceUpdate] = useState({})
  useEffect(() => {
    if (selectedFixture?.status === 'live' && selectedFixture.started_at) {
      const interval = setInterval(() => {
        // Force re-render to update timer display
        forceUpdate({})
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [selectedFixture?.status, selectedFixture?.started_at])

  // Calculate elapsed time based on actual start time and current half
  const getElapsedSeconds = () => {
    if (!selectedFixture?.started_at) {
      console.log('No started_at for fixture:', selectedFixture?.id)
      return 0
    }
    
    const currentHalf = selectedFixture.current_half || 1
    let startTime: number
    
    if (currentHalf === 2 && selectedFixture.second_half_started_at) {
      // Second half - calculate from second half start
      startTime = new Date(selectedFixture.second_half_started_at).getTime()
    } else {
      // First half - calculate from match start
      startTime = new Date(selectedFixture.started_at).getTime()
    }
    
    const now = selectedFixture.ended_at 
      ? new Date(selectedFixture.ended_at).getTime() 
      : selectedFixture.half_time_at && currentHalf === 1
      ? new Date(selectedFixture.half_time_at).getTime()
      : Date.now()
    
    const elapsed = Math.floor((now - startTime) / 1000) - (selectedFixture.total_paused_time || 0)
    return Math.max(0, elapsed)
  }
  
  // Get the current minute based on half
  const getCurrentMinute = () => {
    const elapsed = getElapsedSeconds()
    const minutes = Math.floor(elapsed / 60)
    const currentHalf = selectedFixture?.current_half || 1
    
    if (currentHalf === 2) {
      return minutes + 21 // Add 20 minutes for first half + 1 for start of second
    }
    return minutes + 1
  }

  const fetchFixtures = async () => {
    const { data } = await supabase
      .from("fixtures")
      .select(`
        *,
        teamA:teams!fixtures_team_a_fkey(id, name, logo),
        teamB:teams!fixtures_team_b_fkey(id, name, logo)
      `)
      .in("status", ["upcoming", "live"])
      .order("date", { ascending: true })

    if (data) {
      setFixtures(data)
    }
  }

  const fetchPlayers = async (teamAId: string, teamBId: string) => {
    const [teamARes, teamBRes] = await Promise.all([
      supabase.from("players").select("*").eq("team_id", teamAId).order("name"),
      supabase.from("players").select("*").eq("team_id", teamBId).order("name")
    ])

    if (teamARes.data) setTeamAPlayers(teamARes.data)
    if (teamBRes.data) setTeamBPlayers(teamBRes.data)
  }

  const startMatch = async () => {
    if (!selectedFixture) return

    const { error } = await supabase
      .from("fixtures")
      .update({ 
        status: "live",
        started_at: new Date().toISOString(),
        current_half: 1
      })
      .eq("id", selectedFixture.id)

    if (!error) {
      const now = new Date().toISOString()
      setSelectedFixture({ ...selectedFixture, status: "live", started_at: now, current_half: 1 })
      setMatchStartTime(new Date(now))
      toast.success("Match started!")
    }
  }

  const endMatch = async () => {
    if (!selectedFixture) return

    const { error } = await supabase
      .from("fixtures")
      .update({ 
        status: "completed",
        ended_at: new Date().toISOString()
      })
      .eq("id", selectedFixture.id)

    if (!error) {
      toast.success("Match completed!")
      router.push(`/live/${selectedFixture.id}`)
    }
  }
  
  const callHalfTime = async () => {
    if (!selectedFixture) return
    if (selectedFixture.current_half === 2) return // Already in second half
    
    const elapsedSeconds = getElapsedSeconds()
    if (elapsedSeconds < 1200) { // Less than 20 minutes
      const minutes = Math.floor(elapsedSeconds / 60)
      const confirm = window.confirm(`Only ${minutes} minutes have elapsed. Call half-time early?`)
      if (!confirm) return
    }
    
    const { error } = await supabase
      .from("fixtures")
      .update({ 
        half_time_at: new Date().toISOString()
      })
      .eq("id", selectedFixture.id)

    if (!error) {
      setSelectedFixture({ 
        ...selectedFixture, 
        half_time_at: new Date().toISOString() 
      })
      setShowHalfTimeDialog(true)
      toast.success("Half-time called!")
    }
  }
  
  const startSecondHalf = async () => {
    if (!selectedFixture) return
    if (selectedFixture.current_half === 2) return // Already in second half
    
    const { error } = await supabase
      .from("fixtures")
      .update({ 
        current_half: 2,
        second_half_started_at: new Date().toISOString()
      })
      .eq("id", selectedFixture.id)

    if (!error) {
      setSelectedFixture({ 
        ...selectedFixture, 
        current_half: 2,
        second_half_started_at: new Date().toISOString() 
      })
      setShowHalfTimeDialog(false)
      toast.success("Second half started!")
    }
  }

  const restartTimer = async () => {
    if (!selectedFixture || selectedFixture.status !== 'live') return

    const confirmed = window.confirm('Are you sure you want to restart the match timer? This will reset the match start time to now.')
    if (!confirmed) return

    const { error } = await supabase
      .from("fixtures")
      .update({ 
        started_at: new Date().toISOString(),
        total_paused_time: 0
      })
      .eq("id", selectedFixture.id)

    if (!error) {
      const now = new Date().toISOString()
      setSelectedFixture({ 
        ...selectedFixture, 
        started_at: now,
        total_paused_time: 0 
      })
      setMatchStartTime(new Date(now))
      toast.success("Match timer restarted!")
    }
  }

  const openGoalDialog = (team: 'A' | 'B') => {
    setScoringTeam(team)
    setSelectedPlayer("")
    setSelectedAssistPlayer("")
    setIsOwnGoal(false)
    setIsGoalDialogOpen(true)
  }

  const recordGoal = async () => {
    if (!selectedFixture || !selectedPlayer) return

    const actualScoringTeam = isOwnGoal ? (scoringTeam === 'A' ? 'B' : 'A') : scoringTeam
    const newScore = {
      teamA: selectedFixture.score.teamA + (actualScoringTeam === 'A' ? 1 : 0),
      teamB: selectedFixture.score.teamB + (actualScoringTeam === 'B' ? 1 : 0)
    }

    // Update fixture score
    const { error: fixtureError } = await supabase
      .from("fixtures")
      .update({ score: newScore })
      .eq("id", selectedFixture.id)

    if (fixtureError) {
      toast.error("Failed to update score")
      return
    }

    // Record event with accurate minute based on match start time
    const minute = getCurrentMinute()
    const currentHalf = selectedFixture.current_half || 1
    
    const { error: eventError } = await supabase
      .from("events")
      .insert({
        fixture_id: selectedFixture.id,
        team_id: scoringTeam === 'A' ? selectedFixture.team_a : selectedFixture.team_b,
        player_id: selectedPlayer,
        assist_player_id: selectedAssistPlayer || null,
        minute: minute,
        type: isOwnGoal ? 'own_goal' : 'goal',
        half: currentHalf
      })

    if (!eventError) {
      setSelectedFixture({ ...selectedFixture, score: newScore })
      setIsGoalDialogOpen(false)
      toast.success(`Goal recorded! ${isOwnGoal ? '(Own Goal)' : ''}`)
      console.log('Goal recorded successfully. Check scoreboard for real-time update.')
    } else {
      toast.error('Failed to record goal')
      console.error('Event error:', eventError)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <QPCCHeader />
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-xl font-bold">Match Scoring</h1>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">Back to Admin</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Fixture Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Match</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedFixture?.id || ""}
                onValueChange={(value) => {
                  const fixture = fixtures.find(f => f.id === value)
                  setSelectedFixture(fixture || null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a match to score" />
                </SelectTrigger>
                <SelectContent>
                  {fixtures.map(fixture => (
                    <SelectItem key={fixture.id} value={fixture.id}>
                      <div className="flex items-center gap-2">
                        {fixture.status === 'live' && (
                          <Badge variant="destructive" className="text-xs">LIVE</Badge>
                        )}
                        {fixture.teamA?.name} vs {fixture.teamB?.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Scoring Interface */}
          {selectedFixture && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Match Score</CardTitle>
                  <div className="flex items-center gap-4">
                    {selectedFixture.status === 'live' && (
                      <>
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4" />
                          <span className="font-mono text-lg">
                            {formatTime(getElapsedSeconds())}
                            <span className="text-sm text-muted-foreground ml-2">
                              ({selectedFixture.current_half === 2 ? '2nd Half' : '1st Half'})
                            </span>
                          </span>
                        </div>
                        {(!selectedFixture.current_half || selectedFixture.current_half === 1) && !selectedFixture.half_time_at && (
                          <Button onClick={callHalfTime} variant="secondary" size="sm">
                            Half Time
                          </Button>
                        )}
                        {selectedFixture.half_time_at && !selectedFixture.second_half_started_at && (
                          <Button onClick={startSecondHalf} variant="secondary" size="sm">
                            Start Second Half
                          </Button>
                        )}
                        <Button onClick={restartTimer} variant="outline" size="sm">
                          Restart Timer
                        </Button>
                        <Button onClick={endMatch} variant="destructive" size="sm">
                          End Match
                        </Button>
                      </>
                    )}
                    {selectedFixture.status === 'upcoming' && (
                      <Button onClick={startMatch} size="sm">
                        Start Match
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-8">
                  {/* Team A */}
                  <div className="text-center space-y-4">
                    {selectedFixture.teamA?.logo && (
                      <img 
                        src={selectedFixture.teamA.logo} 
                        alt={selectedFixture.teamA.name}
                        className="h-20 w-20 object-contain mx-auto"
                      />
                    )}
                    <h3 className="text-xl font-bold">{selectedFixture.teamA?.name}</h3>
                    <div className="text-6xl font-bold">{selectedFixture.score.teamA}</div>
                    {selectedFixture.status === 'live' && (
                      <Button 
                        size="lg"
                        onClick={() => openGoalDialog('A')}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Add Goal
                      </Button>
                    )}
                  </div>

                  {/* Team B */}
                  <div className="text-center space-y-4">
                    {selectedFixture.teamB?.logo && (
                      <img 
                        src={selectedFixture.teamB.logo} 
                        alt={selectedFixture.teamB.name}
                        className="h-20 w-20 object-contain mx-auto"
                      />
                    )}
                    <h3 className="text-xl font-bold">{selectedFixture.teamB?.name}</h3>
                    <div className="text-6xl font-bold">{selectedFixture.score.teamB}</div>
                    {selectedFixture.status === 'live' && (
                      <Button 
                        size="lg"
                        onClick={() => openGoalDialog('B')}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Add Goal
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Goal Dialog */}
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              Record Goal - {scoringTeam === 'A' ? selectedFixture?.teamA?.name : selectedFixture?.teamB?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 overflow-y-auto flex-1 px-1">
            <div className="space-y-2">
              <Label>Select Player</Label>
              <RadioGroup value={selectedPlayer} onValueChange={setSelectedPlayer}>
                {(scoringTeam === 'A' ? teamAPlayers : teamBPlayers).map(player => (
                  <div key={player.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={player.id} id={player.id} />
                    <Label htmlFor={player.id} className="flex items-center gap-2 cursor-pointer flex-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={player.image_url} />
                        <AvatarFallback>{player.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{player.name}</span>
                      {player.rank && (
                        <Badge variant="outline" className="text-xs">{player.rank}</Badge>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Assist Player Selection */}
            {!isOwnGoal && selectedPlayer && (
              <div className="space-y-2">
                <Label>Assist By (Optional)</Label>
                <RadioGroup value={selectedAssistPlayer} onValueChange={setSelectedAssistPlayer}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="" id="no-assist" />
                    <Label htmlFor="no-assist" className="cursor-pointer">No Assist</Label>
                  </div>
                  {(scoringTeam === 'A' ? teamAPlayers : teamBPlayers)
                    .filter(player => player.id !== selectedPlayer)
                    .map(player => (
                      <div key={player.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={player.id} id={`assist-${player.id}`} />
                        <Label htmlFor={`assist-${player.id}`} className="flex items-center gap-2 cursor-pointer flex-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={player.image_url} />
                            <AvatarFallback>{player.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{player.name}</span>
                          {player.rank && (
                            <Badge variant="outline" className="text-xs">{player.rank}</Badge>
                          )}
                        </Label>
                      </div>
                    ))}
                </RadioGroup>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="own-goal" 
                checked={isOwnGoal}
                onCheckedChange={(checked) => {
                  setIsOwnGoal(checked as boolean)
                  if (checked) setSelectedAssistPlayer("") // Clear assist if own goal
                }}
              />
              <Label htmlFor="own-goal" className="cursor-pointer">
                Own Goal
              </Label>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsGoalDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={recordGoal} disabled={!selectedPlayer}>
              Record Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Half Time Dialog */}
      <Dialog open={showHalfTimeDialog} onOpenChange={setShowHalfTimeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Half Time</DialogTitle>
            <DialogDescription>
              First half has ended. Take a break and start the second half when ready.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {selectedFixture?.teamA?.name} {selectedFixture?.score.teamA} - {selectedFixture?.score.teamB} {selectedFixture?.teamB?.name}
              </div>
              <div className="text-muted-foreground">
                First Half Duration: {formatTime(getElapsedSeconds())}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={startSecondHalf}>
              Start Second Half
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}