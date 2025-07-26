import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Users, ExternalLink, Star, Medal, Award, Trophy } from "lucide-react"
import type { Team, Player } from "@/lib/types/database"

interface TeamOverviewProps {
  team: Team & { players: Player[] }
}

export function TeamOverview({ team }: TeamOverviewProps) {
  const getRankBadge = (rank: string | null) => {
    switch (rank) {
      case 'A':
        return (
          <Badge variant="destructive" className="text-xs">
            <Star className="w-3 h-3 mr-1" />
            A
          </Badge>
        )
      case 'B':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
            <Medal className="w-3 h-3 mr-1" />
            B
          </Badge>
        )
      case 'C':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
            <Award className="w-3 h-3 mr-1" />
            C
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Unranked
          </Badge>
        )
    }
  }

  const rankCounts = team.players.reduce((acc, player) => {
    if (player.rank) {
      acc[player.rank] = (acc[player.rank] || 0) + 1
    } else {
      acc.unranked = (acc.unranked || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            {team.name}
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/team/${team.id}`}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {/* Rank Summary */}
        <div className="flex gap-2 flex-wrap">
          {rankCounts.A && (
            <Badge variant="destructive" className="text-xs">
              A: {rankCounts.A}
            </Badge>
          )}
          {rankCounts.B && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
              B: {rankCounts.B}
            </Badge>
          )}
          {rankCounts.C && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              C: {rankCounts.C}
            </Badge>
          )}
          {rankCounts.unranked && (
            <Badge variant="outline" className="text-xs">
              Unranked: {rankCounts.unranked}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Player List */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {team.players.length > 0 ? (
            team.players.map(player => (
              <div key={player.id} className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-muted/50">
                <span className="font-medium flex items-center gap-1">
                  {player.name}
                  {player.is_captain && (
                    <span 
                      title="Team Captain" 
                      className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold ml-1"
                    >
                      C
                    </span>
                  )}
                  {player.is_professional && (
                    <span title="Professional Player">
                      <Trophy className="w-3 h-3 text-yellow-500" />
                    </span>
                  )}
                </span>
                {getRankBadge(player.rank)}
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No players assigned
            </div>
          )}
        </div>
        
        <Separator className="my-3" />
        
        {/* Team Summary */}
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {team.players.length} players total
          </span>
          <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
            <Link href={`/team/${team.id}`}>
              Manage →
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}