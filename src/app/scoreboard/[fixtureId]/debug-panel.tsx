"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"

interface DebugPanelProps {
  fixtureId: string
  celebrationData: any
  lastCelebratedGoalId: string | null
  fixture: any
  events: any[]
  isConnected: boolean
  lastGoal: any
}

export function DebugPanel({ fixtureId, celebrationData, lastCelebratedGoalId, fixture, events, isConnected, lastGoal }: DebugPanelProps) {
  const supabase = createClient()

  const triggerTestGoal = async () => {
    // Get a player from the fixture
    const teamId = fixture?.team_a
    if (!teamId) return

    const { data: players } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", teamId)
      .limit(1)

    if (!players || players.length === 0) return

    const player = players[0]
    
    // Insert test goal
    const { error } = await supabase
      .from("events")
      .insert({
        fixture_id: fixtureId,
        team_id: teamId,
        player_id: player.id,
        minute: 45,
        type: "goal"
      })

    if (!error) {
      // Update score
      const newScore = {
        teamA: (fixture?.score?.teamA || 0) + 1,
        teamB: fixture?.score?.teamB || 0
      }
      
      await supabase
        .from("fixtures")
        .update({ score: newScore })
        .eq("id", fixtureId)
        
      console.log("Test goal triggered!")
    }
  }
  
  const manualCelebration = () => {
    console.log('Manually triggering celebration...')
    window.dispatchEvent(new CustomEvent('manual-celebration', {
      detail: {
        playerName: 'Test Player',
        teamName: fixture?.teamA?.name || 'Team A',
        show: true
      }
    }))
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 text-white p-4 text-xs font-mono">
      <div className="max-w-7xl mx-auto space-y-2">
        <div className="flex items-center gap-4">
          <span className={isConnected ? "text-green-400" : "text-red-400"}>
            {isConnected ? "● Connected" : "● Disconnected"}
          </span>
          <span>Events: {events.length}</span>
          <span>Last Goal ID: {lastGoal?.id || "none"}</span>
          <span>Last Celebrated: {lastCelebratedGoalId || "none"}</span>
          <span>Celebration Show: {celebrationData.show ? "YES" : "NO"}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Last Goal: {lastGoal ? `${lastGoal.player?.name} (${lastGoal.type})` : "none"}</span>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={triggerTestGoal}
          >
            Trigger Test Goal
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={manualCelebration}
          >
            Manual Celebration
          </Button>
        </div>
      </div>
    </div>
  )
}