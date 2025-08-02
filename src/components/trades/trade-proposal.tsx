"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { PlayerCard } from "@/components/team/player-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRightLeft, Users, MessageSquare, Send, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import type { Team, Player } from "@/lib/types/database"

interface TradeProposalProps {
  teamId: string
  otherTeams: Team[]
}

export function TradeProposal({ teamId, otherTeams }: TradeProposalProps) {
  const [selectedTeam, setSelectedTeam] = useState("")
  const [myPlayers, setMyPlayers] = useState<Player[]>([])
  const [theirPlayers, setTheirPlayers] = useState<Player[]>([])
  const [selectedMyPlayers, setSelectedMyPlayers] = useState<string[]>([])
  const [selectedTheirPlayers, setSelectedTheirPlayers] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingPlayers, setLoadingPlayers] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const loadPlayers = async (targetTeamId: string) => {
    setLoadingPlayers(true)
    try {
      // Load my team's players
      const { data: myData } = await supabase
        .from("players")
        .select("*")
        .eq("team_id", teamId)
        .order("rank", { ascending: true })
        .order("name")

      // Load target team's players
      const { data: theirData } = await supabase
        .from("players")
        .select("*")
        .eq("team_id", targetTeamId)
        .order("rank", { ascending: true })
        .order("name")

      setMyPlayers(myData || [])
      setTheirPlayers(theirData || [])
    } finally {
      setLoadingPlayers(false)
    }
  }

  const handleTeamSelect = (newTeamId: string) => {
    setSelectedTeam(newTeamId)
    setSelectedMyPlayers([])
    setSelectedTheirPlayers([])
    
    if (newTeamId) {
      loadPlayers(newTeamId)
    } else {
      setMyPlayers([])
      setTheirPlayers([])
    }
  }

  const togglePlayer = (playerId: string, isMine: boolean) => {
    if (isMine) {
      setSelectedMyPlayers(prev =>
        prev.includes(playerId)
          ? prev.filter(id => id !== playerId)
          : [...prev, playerId]
      )
    } else {
      setSelectedTheirPlayers(prev =>
        prev.includes(playerId)
          ? prev.filter(id => id !== playerId)
          : [...prev, playerId]
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedTeam || selectedMyPlayers.length === 0 || selectedTheirPlayers.length === 0) {
      return
    }

    setLoading(true)
    try {
      // Create the trade
      const { data: trade, error: tradeError } = await supabase
        .from("trades")
        .insert({
          from_team_id: teamId,
          to_team_id: selectedTeam,
          notes,
          status: 'pending',
          trade_type: 'standard'
        })
        .select()
        .single()

      if (tradeError) throw tradeError

      // Add trade items
      const tradeItems = [
        ...selectedMyPlayers.map(playerId => ({
          trade_id: trade.id,
          item_type: 'player' as const,
          from_team: true,
          player_id: playerId
        })),
        ...selectedTheirPlayers.map(playerId => ({
          trade_id: trade.id,
          item_type: 'player' as const,
          from_team: false,
          player_id: playerId
        }))
      ]

      const { error: itemsError } = await supabase
        .from("trade_items")
        .insert(tradeItems)

      if (itemsError) throw itemsError

      // Reset form
      setSelectedTeam("")
      setSelectedMyPlayers([])
      setSelectedTheirPlayers([])
      setNotes("")
      setMyPlayers([])
      setTheirPlayers([])
      
      router.refresh()
    } catch (error: any) {
      console.error("Error creating trade:", error)
      const errorMessage = error?.message || error?.error?.message || "Failed to create trade"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const selectedTeamName = otherTeams.find(t => t.id === selectedTeam)?.name
  const isValid = selectedTeam && selectedMyPlayers.length > 0 && selectedTheirPlayers.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" />
          Propose Trade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Selection */}
          <div className="space-y-2">
            <Label htmlFor="team-select">Select Team to Trade With</Label>
            <Select value={selectedTeam} onValueChange={handleTeamSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a team..." />
              </SelectTrigger>
              <SelectContent>
                {otherTeams.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {loadingPlayers && (
            <div className="space-y-4">
              <Skeleton className="h-4 w-48" />
              <div className="grid gap-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          )}

          {/* Trade Interface */}
          {selectedTeam && !loadingPlayers && (
            <>
              <div className="text-center py-2">
                <Badge variant="outline" className="text-sm">
                  Trade with {selectedTeamName}
                </Badge>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Your Players */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Your Players
                      {selectedMyPlayers.length > 0 && (
                        <Badge variant="secondary">
                          {selectedMyPlayers.length} selected
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {myPlayers.length > 0 ? (
                        myPlayers.map(player => (
                          <PlayerCard
                            key={player.id}
                            player={player}
                            teamId={teamId}
                            selectable
                            selected={selectedMyPlayers.includes(player.id)}
                            onSelect={() => togglePlayer(player.id, true)}
                          />
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          No players available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Their Players */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {selectedTeamName} Players
                      {selectedTheirPlayers.length > 0 && (
                        <Badge variant="secondary">
                          {selectedTheirPlayers.length} selected
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {theirPlayers.length > 0 ? (
                        theirPlayers.map(player => (
                          <PlayerCard
                            key={player.id}
                            player={player}
                            teamId={selectedTeam}
                            selectable
                            selected={selectedTheirPlayers.includes(player.id)}
                            onSelect={() => togglePlayer(player.id, false)}
                          />
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          No players available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Trade Validation */}
              {!isValid && (selectedMyPlayers.length > 0 || selectedTheirPlayers.length > 0) && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please select at least one player from each team to propose a trade.
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Trade Notes (optional)
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any comments about this trade proposal..."
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !isValid}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Trade Proposal...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Trade Proposal
                  </>
                )}
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  )
}