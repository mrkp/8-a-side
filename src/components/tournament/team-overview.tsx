import type { Team, Player } from "@/lib/types/database"

interface TeamOverviewProps {
  team: Team & { players: Player[] }
}

export function TeamOverview({ team }: TeamOverviewProps) {
  const getRankBadge = (rank: string | null) => {
    switch (rank) {
      case 'A':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">A</span>
      case 'B':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">B</span>
      case 'C':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">C</span>
      default:
        return null
    }
  }

  const rankCounts = team.players.reduce((acc, player) => {
    if (player.rank) {
      acc[player.rank] = (acc[player.rank] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{team.name}</h3>
        <div className="flex gap-2 text-xs">
          {rankCounts.A && <span className="text-red-600 font-medium">A: {rankCounts.A}</span>}
          {rankCounts.B && <span className="text-yellow-600 font-medium">B: {rankCounts.B}</span>}
          {rankCounts.C && <span className="text-green-600 font-medium">C: {rankCounts.C}</span>}
        </div>
      </div>
      
      <div className="space-y-1">
        {team.players.map(player => (
          <div key={player.id} className="flex items-center justify-between text-sm">
            <span>{player.name}</span>
            {getRankBadge(player.rank)}
          </div>
        ))}
      </div>
      
      <div className="pt-2 border-t text-xs text-muted-foreground">
        Total: {team.players.length} players
      </div>
    </div>
  )
}