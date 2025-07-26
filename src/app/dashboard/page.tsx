import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { PlayerCard } from "@/components/team/player-card"
import type { Player } from "@/lib/types/database"

export default async function DashboardPage() {
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

  // Get team players
  const { data: players } = await supabase
    .from("players")
    .select("*")
    .eq("team_id", team.id)
    .order("rank", { ascending: true, nullsLast: true })
    .order("name", { ascending: true })

  const rankOrder = { 'A': 0, 'B': 1, 'C': 2 }
  const sortedPlayers = players?.sort((a, b) => {
    const aRank = a.rank ? rankOrder[a.rank as keyof typeof rankOrder] : 999
    const bRank = b.rank ? rankOrder[b.rank as keyof typeof rankOrder] : 999
    if (aRank !== bRank) return aRank - bRank
    return a.name.localeCompare(b.name)
  }) || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">My Team</h2>
        <p className="text-muted-foreground">
          Manage your players and their rankings
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedPlayers.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            teamId={team.id}
            editable
          />
        ))}
      </div>

      {sortedPlayers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No players assigned to your team yet.
        </div>
      )}
    </div>
  )
}