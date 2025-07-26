"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import type { TradeWithDetails } from "@/lib/types/database"

interface TradeListProps {
  trades: TradeWithDetails[]
  currentTeamId: string
}

export function TradeList({ trades, currentTeamId }: TradeListProps) {
  const [responding, setResponding] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleResponse = async (tradeId: string, response: 'accepted' | 'declined') => {
    setResponding(tradeId)
    try {
      const { error } = await supabase
        .from("trades")
        .update({ status: response })
        .eq("id", tradeId)

      if (error) throw error

      router.refresh()
      alert(`Trade ${response}!`)
    } catch (error) {
      console.error("Error responding to trade:", error)
      alert("Failed to respond to trade")
    } finally {
      setResponding(null)
    }
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No pending trades
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {trades.map(trade => {
        const isMyOffer = trade.from_team_id === currentTeamId
        const fromPlayers = trade.trade_players?.filter(tp => tp.direction === 'from') || []
        const toPlayers = trade.trade_players?.filter(tp => tp.direction === 'to') || []

        return (
          <div key={trade.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">
                  {trade.from_team?.name} → {trade.to_team?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isMyOffer ? "Your offer" : "Offer to you"}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(trade.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">Giving:</p>
                {fromPlayers.map(tp => (
                  <p key={tp.player_id}>
                    {tp.player?.name}
                    {tp.player?.rank && ` (${tp.player.rank})`}
                  </p>
                ))}
              </div>
              <div>
                <p className="font-medium mb-1">Getting:</p>
                {toPlayers.map(tp => (
                  <p key={tp.player_id}>
                    {tp.player?.name}
                    {tp.player?.rank && ` (${tp.player.rank})`}
                  </p>
                ))}
              </div>
            </div>

            {trade.notes && (
              <p className="text-sm text-muted-foreground italic">
                "{trade.notes}"
              </p>
            )}

            {!isMyOffer && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleResponse(trade.id, 'accepted')}
                  disabled={responding === trade.id}
                  className="flex-1 bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleResponse(trade.id, 'declined')}
                  disabled={responding === trade.id}
                  className="flex-1 bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}