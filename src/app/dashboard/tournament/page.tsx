import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { TeamOverview } from "@/components/tournament/team-overview"

export default async function TournamentPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  // Get all teams with their players
  const { data: teams } = await supabase
    .from("teams")
    .select(`
      *,
      players(*)
    `)
    .order("name")

  // Sort players within each team
  const teamsWithSortedPlayers = teams?.map(team => ({
    ...team,
    players: team.players.sort((a: any, b: any) => {
      const rankOrder = { 'A': 0, 'B': 1, 'C': 2 }
      const aRank = a.rank ? rankOrder[a.rank as keyof typeof rankOrder] : 999
      const bRank = b.rank ? rankOrder[b.rank as keyof typeof rankOrder] : 999
      if (aRank !== bRank) return aRank - bRank
      return a.name.localeCompare(b.name)
    })
  })) || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Tournament Overview</h2>
        <p className="text-muted-foreground">
          View all teams and their current rosters
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teamsWithSortedPlayers.map(team => (
          <TeamOverview key={team.id} team={team} />
        ))}
      </div>
    </div>
  )
}