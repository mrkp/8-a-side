"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchFixtures()
  }, [])

  useEffect(() => {
    if (selectedFixture) {
      fetchPlayers(selectedFixture.team_a, selectedFixture.team_b)
      setIsTimerRunning(selectedFixture.status === 'live')
    }
  }, [selectedFixture])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

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
      .update({ status: "live" })
      .eq("id", selectedFixture.id)

    if (!error) {
      setSelectedFixture({ ...selectedFixture, status: "live" })
      setIsTimerRunning(true)
      toast.success("Match started!")
    }
  }

  const endMatch = async () => {
    if (!selectedFixture) return

    const { error } = await supabase
      .from("fixtures")
      .update({ status: "completed" })
      .eq("id", selectedFixture.id)

    if (!error) {
      setIsTimerRunning(false)
      toast.success("Match completed!")
      router.push(`/live/${selectedFixture.id}`)
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

    // Record event
    const { error: eventError } = await supabase
      .from("events")
      .insert({
        fixture_id: selectedFixture.id,
        team_id: scoringTeam === 'A' ? selectedFixture.team_a : selectedFixture.team_b,
        player_id: selectedPlayer,
        assist_player_id: selectedAssistPlayer || null,
        minute: Math.floor(elapsedTime / 60),
        type: isOwnGoal ? 'own_goal' : 'goal'
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
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4" />
                        <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
                      </div>
                    )}
                    {selectedFixture.status === 'upcoming' && (
                      <Button onClick={startMatch} size="sm">
                        Start Match
                      </Button>
                    )}
                    {selectedFixture.status === 'live' && (
                      <Button onClick={endMatch} variant="destructive" size="sm">
                        End Match
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Record Goal - {scoringTeam === 'A' ? selectedFixture?.teamA?.name : selectedFixture?.teamB?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGoalDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={recordGoal} disabled={!selectedPlayer}>
              Record Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}