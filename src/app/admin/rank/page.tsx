"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { CheckCircle2, User } from "lucide-react"

interface Player {
  id: string
  name: string
  image_url?: string
  team_id?: string | null
  team?: { id: string; name: string } | null
  rank?: string | null
  rank_estimate?: string | null
}

interface Vote {
  subject_id: string
  skill_rating: string
}

export default function PlayerRankingPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [currentVoter, setCurrentVoter] = useState<string>("")
  const [votes, setVotes] = useState<Record<string, string>>({})
  const [existingVotes, setExistingVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    fetchPlayers()
  }, [])

  useEffect(() => {
    if (currentVoter) {
      fetchExistingVotes()
    }
  }, [currentVoter])

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from("players")
      .select(`
        id,
        name,
        image_url,
        rank,
        rank_estimate,
        team_id
      `)
      .order("name")

    if (error) {
      console.error('Error fetching players:', error)
      setLoading(false)
      return
    }

    if (data) {
      // Fetch teams separately to avoid the array issue
      const { data: teams } = await supabase
        .from("teams")
        .select("id, name")
      
      const teamsMap = new Map(teams?.map(t => [t.id, t]))
      
      const playersWithTeams = data.map(player => ({
        ...player,
        team: player.team_id ? teamsMap.get(player.team_id) : null
      }))
      
      setPlayers(playersWithTeams)
    }
    setLoading(false)
  }

  const fetchExistingVotes = async () => {
    const { data } = await supabase
      .from("player_votes")
      .select("subject_id, skill_rating")
      .eq("voter_id", currentVoter)

    if (data) {
      setExistingVotes(data)
      const voteMap: Record<string, string> = {}
      data.forEach(vote => {
        voteMap[vote.subject_id] = vote.skill_rating
      })
      setVotes(voteMap)
    }
  }

  const handleVote = async (subjectId: string, rating: string) => {
    if (!currentVoter) {
      toast.error("Please select yourself as the voter first")
      return
    }

    if (currentVoter === subjectId) {
      toast.error("You cannot vote for yourself")
      return
    }

    setSaving(true)
    
    const { error } = await supabase
      .from("player_votes")
      .upsert({
        voter_id: currentVoter,
        subject_id: subjectId,
        skill_rating: rating,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'voter_id,subject_id'
      })

    if (error) {
      toast.error("Failed to save vote")
    } else {
      setVotes(prev => ({ ...prev, [subjectId]: rating }))
      toast.success("Vote saved")
    }
    
    setSaving(false)
  }

  const votedCount = Object.keys(votes).length
  const totalPlayers = players.length - 1 // Exclude self
  const progress = totalPlayers > 0 ? (votedCount / totalPlayers) * 100 : 0

  const getRankBadgeVariant = (rank?: string) => {
    switch (rank) {
      case 'A': return 'destructive'
      case 'B': return 'secondary'
      case 'C': return 'default'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading players...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <QPCCHeader />
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-xl font-bold">Player Skill Ranking</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Voter Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Yourself</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={currentVoter} onValueChange={setCurrentVoter}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Choose your name to start voting" />
              </SelectTrigger>
              <SelectContent>
                {players.map(player => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name} {player.team?.name && `(${player.team.name})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {currentVoter && (
          <>
            {/* Progress */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Voting Progress</span>
                    <span className="font-medium">{votedCount}/{totalPlayers} players rated</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  {progress === 100 && (
                    <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>All players rated! Thank you!</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Player Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {players
                .filter(p => p.id !== currentVoter)
                .map(player => (
                  <Card key={player.id} className={votes[player.id] ? "border-green-500" : ""}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={player.image_url} />
                          <AvatarFallback>
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="font-semibold">{player.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {player.team?.name || "No team"}
                            </p>
                            {player.rank_estimate && (
                              <Badge 
                                variant={getRankBadgeVariant(player.rank_estimate)} 
                                className="mt-1"
                              >
                                Current: {player.rank_estimate}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            {['A', 'B', 'C'].map(rating => (
                              <Button
                                key={rating}
                                size="sm"
                                variant={votes[player.id] === rating ? "default" : "outline"}
                                onClick={() => handleVote(player.id, rating)}
                                disabled={saving}
                                className="flex-1"
                              >
                                {rating}
                              </Button>
                            ))}
                          </div>
                          
                          {votes[player.id] && (
                            <p className="text-xs text-green-600">
                              ✓ Rated as {votes[player.id]}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}