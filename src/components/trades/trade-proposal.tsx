"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { PlayerCard } from "@/components/team/player-card"
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

  const handleTeamSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTeamId = e.target.value
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
      alert("Please select at least one player from each team")
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
          notes
        })
        .select()
        .single()

      if (tradeError) throw tradeError

      // Add trade players
      const tradePlayers = [
        ...selectedMyPlayers.map(playerId => ({
          trade_id: trade.id,
          player_id: playerId,
          direction: 'from' as const
        })),
        ...selectedTheirPlayers.map(playerId => ({
          trade_id: trade.id,
          player_id: playerId,
          direction: 'to' as const
        }))
      ]

      const { error: playersError } = await supabase
        .from("trade_players")
        .insert(tradePlayers)

      if (playersError) throw playersError

      // Reset form
      setSelectedTeam("")
      setSelectedMyPlayers([])
      setSelectedTheirPlayers([])
      setNotes("")
      setMyPlayers([])
      setTheirPlayers([])
      
      router.refresh()
      alert("Trade proposal sent!")
    } catch (error) {
      console.error("Error creating trade:", error)
      alert("Failed to create trade proposal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Select Team to Trade With
        </label>
        <select
          value={selectedTeam}
          onChange={handleTeamSelect}
          className="w-full px-3 py-2 border border-input rounded-md"
          required
        >
          <option value="">Choose a team...</option>
          {otherTeams.map(team => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {selectedTeam && !loadingPlayers && (
        <>
          <div>
            <h4 className="font-medium mb-2">Select Your Players to Trade</h4>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {myPlayers.map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  teamId={teamId}
                  selectable
                  selected={selectedMyPlayers.includes(player.id)}
                  onSelect={() => togglePlayer(player.id, true)}
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Select Players You Want</h4>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {theirPlayers.map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  teamId={selectedTeam}
                  selectable
                  selected={selectedTheirPlayers.includes(player.id)}
                  onSelect={() => togglePlayer(player.id, false)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md"
              rows={3}
              placeholder="Any additional comments about this trade..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || selectedMyPlayers.length === 0 || selectedTheirPlayers.length === 0}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Trade Proposal"}
          </button>
        </>
      )}
    </form>
  )
}