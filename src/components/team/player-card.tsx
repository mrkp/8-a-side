"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import type { Player } from "@/lib/types/database"
import { cn } from "@/lib/utils"
import { Trophy } from "lucide-react"

interface PlayerCardProps {
  player: Player
  teamId: string
  editable?: boolean
  selectable?: boolean
  selected?: boolean
  onSelect?: () => void
}

export function PlayerCard({ 
  player, 
  teamId,
  editable = false,
  selectable = false,
  selected = false,
  onSelect
}: PlayerCardProps) {
  const [updating, setUpdating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRankChange = async (newRank: string) => {
    if (!editable || player.team_id !== teamId) return
    
    setUpdating(true)
    try {
      const { error } = await supabase
        .from("players")
        .update({ rank: newRank || null })
        .eq("id", player.id)

      if (error) throw error
      
      router.refresh()
    } catch (error) {
      console.error("Error updating rank:", error)
    } finally {
      setUpdating(false)
    }
  }

  const handleProfessionalToggle = async () => {
    if (!editable || player.team_id !== teamId) return
    
    setUpdating(true)
    try {
      const { error } = await supabase
        .from("players")
        .update({ is_professional: !player.is_professional })
        .eq("id", player.id)

      if (error) throw error
      
      router.refresh()
    } catch (error) {
      console.error("Error updating professional status:", error)
    } finally {
      setUpdating(false)
    }
  }

  const getRankColor = (rank: string | null) => {
    switch (rank) {
      case 'A': return 'bg-red-100 border-red-400 text-red-900'
      case 'B': return 'bg-yellow-100 border-yellow-400 text-yellow-900'
      case 'C': return 'bg-green-100 border-green-400 text-green-900'
      default: return 'bg-gray-100 border-gray-300'
    }
  }

  return (
    <div 
      className={cn(
        "p-4 border-2 rounded-lg transition-all",
        getRankColor(player.rank),
        selectable && "cursor-pointer hover:scale-105",
        selected && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={selectable ? onSelect : undefined}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium flex items-center gap-2">
            {player.name}
            {player.is_professional && (
              <Trophy className="h-4 w-4 text-yellow-600" title="Professional Player" />
            )}
          </h3>
          {player.rank && (
            <span className="text-sm font-bold">Rank {player.rank}</span>
          )}
        </div>
        
        {editable && player.team_id === teamId && (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleProfessionalToggle()
              }}
              disabled={updating}
              className={cn(
                "p-1.5 rounded transition-all disabled:opacity-50",
                player.is_professional 
                  ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" 
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              )}
              title={player.is_professional ? "Remove professional status" : "Mark as professional"}
            >
              <Trophy className="h-4 w-4" />
            </button>
            
            <select
              value={player.rank || ''}
              onChange={(e) => handleRankChange(e.target.value)}
              disabled={updating}
              className="px-3 py-1 text-sm border rounded bg-white disabled:opacity-50"
              onClick={(e) => e.stopPropagation()}
            >
              <option value="">No Rank</option>
              <option value="A">Rank A</option>
              <option value="B">Rank B</option>
              <option value="C">Rank C</option>
            </select>
          </div>
        )}
      </div>
    </div>
  )
}