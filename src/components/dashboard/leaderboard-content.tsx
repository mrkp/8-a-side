import { createClient } from "@/utils/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Star, Medal, Award, User } from "lucide-react"
import Link from "next/link"

export default async function LeaderboardContent() {
  const supabase = await createClient()

  const { data: topScorers } = await supabase
    .from("top_scorers")
    .select("*")
    .limit(10)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Top Scorers</h3>
        <Link href="/leaderboard" className="text-sm text-muted-foreground hover:underline">
          Full leaderboard →
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {topScorers?.map((player, index) => (
              <div 
                key={player.id} 
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  index < 3 ? 'bg-muted/50' : 'hover:bg-muted/30'
                } transition-colors`}
              >
                <div className="w-10 text-center">
                  {index === 0 && <Trophy className="h-5 w-5 text-yellow-500 mx-auto" />}
                  {index === 1 && <Medal className="h-5 w-5 text-slate-500 mx-auto" />}
                  {index === 2 && <Award className="h-5 w-5 text-orange-600 mx-auto" />}
                  {index > 2 && (
                    <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
                  )}
                </div>
                
                <Avatar className="h-8 w-8">
                  <AvatarImage src={player.image_url} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{player.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{player.team_name}</div>
                </div>

                <div className="flex items-center gap-3">
                  {player.rank && (
                    <Badge variant={
                      player.rank === 'A' ? 'destructive' :
                      player.rank === 'B' ? 'secondary' : 'outline'
                    } className="text-xs">
                      {player.rank}
                    </Badge>
                  )}
                  <div className="text-center">
                    <div className="text-xl font-bold">{player.goals}</div>
                    <div className="text-xs text-muted-foreground">goals</div>
                  </div>
                </div>
              </div>
            ))}

            {(!topScorers || topScorers.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No goals scored yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}