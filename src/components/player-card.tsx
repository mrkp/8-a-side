import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, Shield, Target, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlayerCardProps {
  player: {
    id: string
    name: string
    team_id?: string | null
    rank?: string | null
    jersey_number?: number | null
    position?: string | null
    is_captain?: boolean
    is_professional?: boolean
    goals?: number
    assists?: number
    yellow_cards?: number
    red_cards?: number
  }
  team?: {
    id: string
    name: string
    logo?: string | null
  }
  showStats?: boolean
  className?: string
}

export function PlayerCard({ player, team, showStats = false, className }: PlayerCardProps) {
  const getRankColor = (rank: string | null | undefined) => {
    switch (rank) {
      case 'A': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
      case 'B': return 'bg-blue-500/10 text-blue-600 border-blue-500/30'
      case 'C': return 'bg-green-500/10 text-green-600 border-green-500/30'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/30'
    }
  }

  const getPositionIcon = (position: string | null | undefined) => {
    switch (position?.toLowerCase()) {
      case 'goalkeeper':
      case 'gk':
        return <Shield className="h-4 w-4" />
      case 'forward':
      case 'striker':
        return <Target className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              {player.jersey_number && (
                <span className="text-2xl font-bold text-muted-foreground">
                  #{player.jersey_number}
                </span>
              )}
              <h3 className="font-semibold text-lg">{player.name}</h3>
            </div>
            {team && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {team.logo && (
                  <img src={team.logo} alt={team.name} className="h-4 w-4 object-contain" />
                )}
                <span>{team.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {player.rank && (
              <Badge variant="outline" className={cn("font-bold", getRankColor(player.rank))}>
                {player.rank}
              </Badge>
            )}
            {player.is_captain && (
              <Badge variant="default" className="bg-blue-600">
                C
              </Badge>
            )}
            {player.is_professional && (
              <Trophy className="h-4 w-4 text-yellow-500" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {(showStats || player.position) && (
        <CardContent>
          {player.position && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              {getPositionIcon(player.position)}
              <span>{player.position}</span>
            </div>
          )}
          
          {showStats && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {player.goals !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Goals</span>
                  <span className="font-medium">{player.goals}</span>
                </div>
              )}
              {player.assists !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Assists</span>
                  <span className="font-medium">{player.assists}</span>
                </div>
              )}
              {player.yellow_cards !== undefined && player.yellow_cards > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Yellow Cards</span>
                  <span className="font-medium text-yellow-600">{player.yellow_cards}</span>
                </div>
              )}
              {player.red_cards !== undefined && player.red_cards > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Red Cards</span>
                  <span className="font-medium text-red-600">{player.red_cards}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}