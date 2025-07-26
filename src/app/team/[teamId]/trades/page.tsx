import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { TradeProposal } from "@/components/trades/trade-proposal"
import { TradeList } from "@/components/trades/trade-list"

export default async function TeamTradesPage({
  params
}: {
  params: { teamId: string }
}) {
  const supabase = await createClient()

  // Get team
  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("id", params.teamId)
    .single()

  if (!team) redirect("/")

  // Get all teams except current team
  const { data: otherTeams } = await supabase
    .from("teams")
    .select("*")
    .neq("id", params.teamId)
    .order("name")

  // Get pending trades involving this team
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
    .or(`from_team_id.eq.${params.teamId},to_team_id.eq.${params.teamId}`)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">Trades</h2>
          <p className="text-muted-foreground">
            Propose new trades and manage pending trades
          </p>
        </div>
        <Link 
          href={`/team/${params.teamId}/trades/history`}
          className="text-sm text-primary hover:underline"
        >
          View Trade History →
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-xl font-semibold mb-4">Propose New Trade</h3>
          <TradeProposal 
            teamId={params.teamId} 
            otherTeams={otherTeams || []}
          />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Pending Trades</h3>
          <TradeList 
            trades={trades || []} 
            currentTeamId={params.teamId}
          />
        </div>
      </div>
    </div>
  )
}