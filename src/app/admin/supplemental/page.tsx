"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { User, Users, Heart, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SupplementalPlayer {
  id: string
  player_id: string
  rank_estimate: string
  draft_order?: number
  drafted_to_team_id?: string
  player: {
    id: string
    name: string
    image_url?: string
    rank?: string
    rank_estimate?: string
    preferred_teammate?: {
      id: string
      name: string
      team_id?: string
      team?: { name: string }
    }
  }
}

interface DraftOrder {
  id: string
  name: string
  player_count: number
  strength_score: number
  draft_position: number
}

interface DraftPhaseInfo {
  pick_number: number
  team_name: string
  phase: 'C_PICKS' | 'OPEN_DRAFT'
  expected_player_type: string
  is_current: boolean
}

export default function SupplementalDraftPage() {
  const [availablePlayers, setAvailablePlayers] = useState<SupplementalPlayer[]>([])
  const [draftOrder, setDraftOrder] = useState<DraftOrder[]>([])
  const [draftPhases, setDraftPhases] = useState<DraftPhaseInfo[]>([])
  const [currentPick, setCurrentPick] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState<SupplementalPlayer | null>(null)
  const [confirmDialog, setConfirmDialog] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // Fetch available supplemental players
    const { data: players } = await supabase
      .from("supplemental_players")
      .select(`
        *,
        player:players!player_id(
          id,
          name,
          image_url,
          rank,
          rank_estimate,
          preferred_teammate:players!preferred_teammate_id(
            id,
            name,
            team_id,
            team:teams(name)
          )
        )
      `)
      .is("drafted_to_team_id", null)
      .order("player(rank_estimate)", { ascending: true })

    // Get current draft team
    const { data: currentTeamData } = await supabase
      .rpc("get_supplemental_draft_order")

    // Get full draft phase display
    const { data: phaseData } = await supabase
      .rpc("get_full_draft_order_display")

    // Get current pick number
    const { count: draftedCount } = await supabase
      .from("supplemental_players")
      .select("*", { count: 'exact', head: true })
      .not("drafted_to_team_id", "is", null)

    if (players) setAvailablePlayers(players)
    if (currentTeamData && currentTeamData.length > 0) {
      setDraftOrder([currentTeamData[0]])
      setCurrentPick((draftedCount || 0) + 1)
    }
    if (phaseData) setDraftPhases(phaseData)
    
    setLoading(false)
  }

  const handleDraft = async () => {
    if (!selectedPlayer || !draftOrder[currentPick]) return

    const team = draftOrder[currentPick]
    
    // Update supplemental player record
    const { error: supplementalError } = await supabase
      .from("supplemental_players")
      .update({
        drafted_to_team_id: team.id,
        drafted_at: new Date().toISOString(),
        draft_order: currentPick + 1
      })
      .eq("id", selectedPlayer.id)

    // Update player's team assignment
    const { error: playerError } = await supabase
      .from("players")
      .update({ team_id: team.id })
      .eq("id", selectedPlayer.player_id)

    // Record draft history
    const { error: historyError } = await supabase
      .from("draft_history")
      .insert({
        player_id: selectedPlayer.player_id,
        team_id: team.id,
        draft_type: "supplemental",
        draft_round: Math.floor(currentPick / draftOrder.length) + 1,
        draft_position: currentPick + 1
      })

    if (supplementalError || playerError || historyError) {
      toast.error("Failed to complete draft pick")
    } else {
      toast.success(`${selectedPlayer.player.name} drafted to ${team.name}`)
      setCurrentPick(prev => prev + 1)
      setSelectedPlayer(null)
      setConfirmDialog(false)
      fetchData()
    }
  }

  const getRankBadgeVariant = (rank?: string) => {
    switch (rank) {
      case 'A': return 'destructive'
      case 'B': return 'secondary'
      case 'C': return 'default'
      default: return 'outline'
    }
  }

  const currentTeam = draftOrder[0] // Always the first item since we fetch current team
  const currentPhase = draftPhases.find(p => p.is_current)
  const draftComplete = availablePlayers.length === 0
  const isPhase1 = currentPhase?.phase === 'C_PICKS'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading draft data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <QPCCHeader />
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-xl font-bold">Supplemental Draft</h1>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin/teams">View Teams</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Draft Status */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Draft Status</CardTitle>
              </CardHeader>
              <CardContent>
                {draftComplete ? (
                  <div className="text-center py-8">
                    <p className="text-lg font-medium text-green-600">Draft Complete!</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      All available players have been drafted
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Currently Picking</p>
                      <p className="text-2xl font-bold">{currentTeam?.name}</p>
                      <Badge variant="outline" className="mt-2">
                        Pick #{currentPick + 1}
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Team Status</p>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Players:</span>
                          <span className="font-medium">{currentTeam?.player_count}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Strength:</span>
                          <span className="font-medium">{currentTeam?.strength_score.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {/* Phase indicator */}
                      {currentPhase && (
                        <div className="mt-4">
                          <Badge 
                            variant={isPhase1 ? "destructive" : "default"}
                            className="w-full justify-center"
                          >
                            {isPhase1 ? "Phase 1: C Player Selection" : "Phase 2: Open Draft"}
                          </Badge>
                        </div>
                      )}
                      
                      {/* C Player Guidance for phase 1 */}
                      {isPhase1 && (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm font-medium text-yellow-800">
                            ⚠️ Must select a C-rated player
                          </p>
                          <p className="text-xs text-yellow-600 mt-1">
                            Phase 1 requires C player selection
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Draft Order */}
            <Card>
              <CardHeader>
                <CardTitle>Draft Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Phase 1 Header */}
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Phase 1: C Players Only
                  </div>
                  
                  {draftPhases.filter(p => p.phase === 'C_PICKS').map((phase) => (
                    <div
                      key={phase.pick_number}
                      className={`flex items-center justify-between p-2 rounded ${
                        phase.is_current ? 'bg-primary/10 border border-primary' : ''
                      } ${phase.pick_number < currentPick ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">#{phase.pick_number}</span>
                        <span className="text-sm">{phase.team_name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">C</Badge>
                    </div>
                  ))}
                  
                  {/* Phase 2 Header */}
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-4">
                    Phase 2: Open Draft
                  </div>
                  
                  {draftPhases.filter(p => p.phase === 'OPEN_DRAFT').slice(0, 8).map((phase) => (
                    <div
                      key={phase.pick_number}
                      className={`flex items-center justify-between p-2 rounded ${
                        phase.is_current ? 'bg-primary/10 border border-primary' : ''
                      } ${phase.pick_number < currentPick ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">#{phase.pick_number}</span>
                        <span className="text-sm">{phase.team_name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">Any</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available Players */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Available Players</CardTitle>
              </CardHeader>
              <CardContent>
                {availablePlayers.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No players available for draft
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {availablePlayers.map(sp => {
                      const isC = (sp.player.rank_estimate || sp.player.rank) === 'C'
                      const shouldHighlightC = isPhase1 && isC
                      
                      return (
                        <Card
                          key={sp.id}
                          className={`cursor-pointer transition-all ${
                            selectedPlayer?.id === sp.id 
                              ? 'ring-2 ring-primary' 
                              : 'hover:shadow-md'
                          } ${
                            shouldHighlightC 
                              ? 'bg-yellow-50 border-yellow-300' 
                              : ''
                          }`}
                          onClick={() => setSelectedPlayer(sp)}
                        >
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={sp.player.image_url} />
                              <AvatarFallback>
                                <User className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 space-y-2">
                              <div>
                                <h3 className="font-semibold">{sp.player.name}</h3>
                                <Badge 
                                  variant={getRankBadgeVariant(sp.player.rank_estimate || sp.player.rank)}
                                  className="mt-1"
                                >
                                  Rank {sp.player.rank_estimate || sp.player.rank || 'U'}
                                </Badge>
                              </div>
                              
                              {sp.player.preferred_teammate && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Heart className="h-3 w-3" />
                                  <span>Wants to play with {sp.player.preferred_teammate.name}</span>
                                  {sp.player.preferred_teammate.team && (
                                    <span className="text-xs">
                                      ({sp.player.preferred_teammate.team.name})
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      )
                    })}
                  </div>
                )}
                
                {selectedPlayer && !draftComplete && (
                  <div className="mt-6 flex justify-center">
                    <Button 
                      size="lg"
                      onClick={() => setConfirmDialog(true)}
                      className="gap-2"
                    >
                      Draft {selectedPlayer.player.name}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Draft Pick</DialogTitle>
            <DialogDescription>
              Draft {selectedPlayer?.player.name} to {currentTeam?.name}?
            </DialogDescription>
            
            {/* Phase 1 C player warning */}
            {isPhase1 && (selectedPlayer?.player.rank_estimate || selectedPlayer?.player.rank) !== 'C' && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                ⚠️ Phase 1 requires selecting a C-rated player!
              </div>
            )}
            
            {/* Player preference warning */}
            {selectedPlayer?.player.preferred_teammate && 
             selectedPlayer.player.preferred_teammate.team?.name !== currentTeam?.name && (
              <div className="mt-2 text-sm text-yellow-600">
                Note: Player prefers to be with {selectedPlayer.player.preferred_teammate.name} 
                on {selectedPlayer.player.preferred_teammate.team?.name}
              </div>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDraft}>
              Confirm Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}