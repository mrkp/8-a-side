import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Star, Medal, Award, Target, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

export default async function LeaderboardPage() {
  const supabase = await createClient()

  // Get top scorers using the view
  const { data: topScorers } = await supabase
    .from("top_scorers")
    .select("*")
    .limit(50)

  // Get teams for filtering
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name")
    .order("name")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <QPCCHeader />
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-xl font-bold">Top Scorers</h1>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="https://wam.now" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border border-border/50 hover:bg-muted/70 transition-colors"
              >
                <span className="text-xs text-muted-foreground">Powered by</span>
                <img src="/wam-logo.svg" alt="WAM!" className="h-4 w-auto" />
              </a>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Trophy className="h-10 w-10 text-yellow-500" />
              <h2 className="text-4xl font-bold">Golden Boot Race</h2>
            </div>
            <p className="text-xl text-muted-foreground">
              Leading goal scorers in the tournament
            </p>
          </div>

          {/* Top 3 Scorers Podium */}
          {topScorers && topScorers.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              {/* 2nd Place */}
              <Card className="mt-8 border-2 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <CardContent className="pt-6 text-center">
                  <div className="relative mb-4">
                    <Medal className="h-8 w-8 text-slate-500 mx-auto" />
                    <span className="text-4xl font-bold">2</span>
                  </div>
                  <Avatar className="h-20 w-20 mx-auto mb-3">
                    <AvatarImage src={topScorers[1].image_url} />
                    <AvatarFallback>
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg">{topScorers[1].name}</h3>
                  <p className="text-sm text-muted-foreground">{topScorers[1].team_name}</p>
                  <div className="mt-3 space-y-2">
                    <div className="text-3xl font-bold">{topScorers[1].goals}</div>
                    <p className="text-sm text-muted-foreground">Goals</p>
                    {topScorers[1].rank && (
                      <Badge variant={
                        topScorers[1].rank === 'A' ? 'destructive' :
                        topScorers[1].rank === 'B' ? 'secondary' : 'outline'
                      }>
                        Rank {topScorers[1].rank}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 1st Place */}
              <Card className="border-2 border-yellow-500 bg-gradient-to-b from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
                <CardContent className="pt-6 text-center">
                  <div className="relative mb-4">
                    <Trophy className="h-10 w-10 text-yellow-500 mx-auto" />
                    <span className="text-5xl font-bold">1</span>
                  </div>
                  <Avatar className="h-24 w-24 mx-auto mb-3 ring-4 ring-yellow-500">
                    <AvatarImage src={topScorers[0].image_url} />
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-xl">{topScorers[0].name}</h3>
                  <p className="text-sm text-muted-foreground">{topScorers[0].team_name}</p>
                  <div className="mt-3 space-y-2">
                    <div className="text-4xl font-bold">{topScorers[0].goals}</div>
                    <p className="text-sm text-muted-foreground">Goals</p>
                    {topScorers[0].rank && (
                      <Badge variant={
                        topScorers[0].rank === 'A' ? 'destructive' :
                        topScorers[0].rank === 'B' ? 'secondary' : 'outline'
                      }>
                        Rank {topScorers[0].rank}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 3rd Place */}
              <Card className="mt-8 border-2 bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                <CardContent className="pt-6 text-center">
                  <div className="relative mb-4">
                    <Award className="h-8 w-8 text-orange-600 mx-auto" />
                    <span className="text-4xl font-bold">3</span>
                  </div>
                  <Avatar className="h-20 w-20 mx-auto mb-3">
                    <AvatarImage src={topScorers[2].image_url} />
                    <AvatarFallback>
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg">{topScorers[2].name}</h3>
                  <p className="text-sm text-muted-foreground">{topScorers[2].team_name}</p>
                  <div className="mt-3 space-y-2">
                    <div className="text-3xl font-bold">{topScorers[2].goals}</div>
                    <p className="text-sm text-muted-foreground">Goals</p>
                    {topScorers[2].rank && (
                      <Badge variant={
                        topScorers[2].rank === 'A' ? 'destructive' :
                        topScorers[2].rank === 'B' ? 'secondary' : 'outline'
                      }>
                        Rank {topScorers[2].rank}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Full Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topScorers?.map((player, index) => (
                  <div 
                    key={player.id} 
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      index < 3 ? 'bg-muted/50' : 'hover:bg-muted/30'
                    } transition-colors`}
                  >
                    <div className="w-12 text-center">
                      <Badge variant={index < 3 ? 'default' : 'outline'} className="font-bold">
                        {index + 1}
                      </Badge>
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={player.image_url} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {player.name}
                        {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                        {index === 1 && <Medal className="h-4 w-4 text-slate-500" />}
                        {index === 2 && <Award className="h-4 w-4 text-orange-600" />}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {player.team_name}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {player.rank && (
                        <Badge variant={
                          player.rank === 'A' ? 'destructive' :
                          player.rank === 'B' ? 'secondary' : 'outline'
                        } className="text-xs">
                          {player.rank === 'A' && <Star className="w-3 h-3 mr-1" />}
                          {player.rank === 'B' && <Medal className="w-3 h-3 mr-1" />}
                          {player.rank === 'C' && <Award className="w-3 h-3 mr-1" />}
                          {player.rank}
                        </Badge>
                      )}
                      <div className="text-center">
                        <div className="text-2xl font-bold">{player.goals}</div>
                        <div className="text-xs text-muted-foreground">goals</div>
                      </div>
                    </div>
                  </div>
                ))}

                {(!topScorers || topScorers.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No goals scored yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}