import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function TradeHistoryPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  // Get team
  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("email", user.email)
    .single()

  if (!team) redirect("/")

  // Get all completed trades involving this team
  const { data: trades } = await supabase
    .from("trades")
    .select(`
      *,
      from_team:teams!from_team_id(*),
      to_team:teams!to_team_id(*),
      trade_players(
        *,
        player:players(*)
      )
    `)
    .or(`from_team_id.eq.${team.id},to_team_id.eq.${team.id}`)
    .in("status", ["accepted", "declined"])
    .order("responded_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Trade History</h2>
          <p className="text-muted-foreground">
            View your completed trades
          </p>
        </div>
        <Link 
          href="/dashboard/trades"
          className="text-sm text-primary hover:underline"
        >
          ← Back to Trades
        </Link>
      </div>

      {!trades || trades.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No completed trades yet
        </div>
      ) : (
        <div className="space-y-4">
          {trades.map(trade => {
            const isMyOffer = trade.from_team_id === team.id
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
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      trade.status === 'accepted' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {trade.status}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {trade.responded_at && new Date(trade.responded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium mb-1">Gave:</p>
                    {fromPlayers.map(tp => (
                      <p key={tp.player_id}>
                        {tp.player?.name}
                        {tp.player?.rank && ` (${tp.player.rank})`}
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="font-medium mb-1">Received:</p>
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}