import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Star, Medal, Award, Target, User, Shield, Zap, TrendingUp, AlertCircle, Users, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function LeaderboardPage() {
  const supabase = await createClient()

  // Get all statistics
  const [topScorersRes, topAssistsRes, goalsAssistsRes, hatTricksRes, cleanSheetsRes, fastestGoalsRes, highScoringMatchesRes, ownGoalsRes] = await Promise.all([
    supabase.from("top_scorers").select("*").limit(50),
    supabase.from("top_assists").select("*").limit(50),
    supabase.from("goals_assists_combined").select("*").limit(50),
    supabase.from("hat_tricks").select("*"),
    supabase.from("clean_sheets").select("*"),
    supabase.from("fastest_goals").select("*"),
    supabase.from("highest_scoring_matches").select("*"),
    supabase.from("own_goals_leaderboard").select("*")
  ])

  const topScorers = topScorersRes.data || []
  const topAssists = topAssistsRes.data || []
  const goalsAssists = goalsAssistsRes.data || []
  const hatTricks = hatTricksRes.data || []
  const cleanSheets = cleanSheetsRes.data || []
  const fastestGoals = fastestGoalsRes.data || []
  const highScoringMatches = highScoringMatchesRes.data || []
  const ownGoals = ownGoalsRes.data || []

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <QPCCHeader />
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-xl font-bold">Statistics Dashboard</h1>
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
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="goals" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="assists">Assists</TabsTrigger>
              <TabsTrigger value="combined">G+A</TabsTrigger>
              <TabsTrigger value="hattricks">Hat-tricks</TabsTrigger>
              <TabsTrigger value="cleansheets">Clean Sheets</TabsTrigger>
              <TabsTrigger value="records">Records</TabsTrigger>
              <TabsTrigger value="owngoals">Own Goals</TabsTrigger>
            </TabsList>

            {/* Goals Tab */}
            <TabsContent value="goals" className="space-y-8">
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
          </TabsContent>

          {/* Assists Tab */}
          <TabsContent value="assists" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-10 w-10 text-blue-500" />
                <h2 className="text-4xl font-bold">Top Assist Providers</h2>
              </div>
              <p className="text-xl text-muted-foreground">
                Players creating the most goal-scoring opportunities
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {topAssists?.map((player, index) => (
                    <div key={player.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="w-12 text-center">
                        <Badge variant={index < 3 ? 'default' : 'outline'} className="font-bold">
                          {index + 1}
                        </Badge>
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={player.image_url} />
                        <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-muted-foreground">{player.team_name}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{player.assists}</div>
                        <div className="text-xs text-muted-foreground">assists</div>
                      </div>
                    </div>
                  ))}
                  {topAssists.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No assists recorded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals + Assists Combined Tab */}
          <TabsContent value="combined" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <BarChart3 className="h-10 w-10 text-purple-500" />
                <h2 className="text-4xl font-bold">Total Contributions</h2>
              </div>
              <p className="text-xl text-muted-foreground">
                Combined goals and assists leaderboard
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {goalsAssists?.map((player, index) => (
                    <div key={player.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="w-12 text-center">
                        <Badge variant={index < 3 ? 'default' : 'outline'} className="font-bold">
                          {index + 1}
                        </Badge>
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={player.image_url} />
                        <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-muted-foreground">{player.team_name}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-xl font-bold">{player.goals}</div>
                          <div className="text-xs text-muted-foreground">goals</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold">{player.assists}</div>
                          <div className="text-xs text-muted-foreground">assists</div>
                        </div>
                        <div className="text-center bg-muted/50 px-3 py-1 rounded">
                          <div className="text-2xl font-bold">{player.total_contributions}</div>
                          <div className="text-xs text-muted-foreground">total</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hat-tricks Tab */}
          <TabsContent value="hattricks" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Star className="h-10 w-10 text-orange-500" />
                <h2 className="text-4xl font-bold">Hat-trick Heroes</h2>
              </div>
              <p className="text-xl text-muted-foreground">
                Players who scored 3 or more goals in a single match
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {hatTricks?.map((record) => (
                <Card key={`${record.player_id}-${record.fixture_id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={record.image_url} />
                        <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold">{record.player_name}</div>
                        <div className="text-sm text-muted-foreground">{record.team_name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {record.team_a_name} vs {record.team_b_name}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">{record.goals_in_match}</div>
                        <div className="text-xs text-muted-foreground">goals</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {hatTricks.length === 0 && (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="text-center py-12 text-muted-foreground">
                      <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hat-tricks scored yet</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Clean Sheets Tab */}
          <TabsContent value="cleansheets" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-10 w-10 text-green-500" />
                <h2 className="text-4xl font-bold">Clean Sheet Champions</h2>
              </div>
              <p className="text-xl text-muted-foreground">
                Teams that kept their opponents from scoring
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {cleanSheets?.map((team, index) => (
                    <div key={team.team_id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="w-12 text-center">
                        <Badge variant={index < 3 ? 'default' : 'outline'} className="font-bold">
                          {index + 1}
                        </Badge>
                      </div>
                      {team.team_logo && (
                        <img src={team.team_logo} alt="" className="h-10 w-10 object-contain" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{team.team_name}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{team.clean_sheet_count}</div>
                        <div className="text-xs text-muted-foreground">clean sheets</div>
                      </div>
                    </div>
                  ))}
                  {cleanSheets.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No clean sheets recorded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="records" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Zap className="h-10 w-10 text-yellow-500" />
                <h2 className="text-4xl font-bold">Tournament Records</h2>
              </div>
              <p className="text-xl text-muted-foreground">
                Notable achievements and milestones
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Fastest Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Fastest Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {fastestGoals.slice(0, 5).map((goal, index) => (
                      <div key={goal.event_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{index + 1}</Badge>
                          <div>
                            <div className="font-medium">{goal.player_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {goal.team_a_name} vs {goal.team_b_name}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">{goal.minute}'</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Highest Scoring Matches */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Highest Scoring Matches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {highScoringMatches.slice(0, 5).map((match, index) => (
                      <div key={match.fixture_id} className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">
                            {match.team_a_name} {match.team_a_score} - {match.team_b_score} {match.team_b_name}
                          </div>
                        </div>
                        <Badge variant="secondary">{match.total_goals} goals</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Own Goals Tab */}
          <TabsContent value="owngoals" className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="h-10 w-10 text-red-500" />
                <h2 className="text-4xl font-bold">Own Goals</h2>
              </div>
              <p className="text-xl text-muted-foreground">
                Sometimes it goes in the wrong net
              </p>
            </div>

            {ownGoals.length > 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    {ownGoals.map((player) => (
                      <div key={player.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={player.image_url} />
                          <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-muted-foreground">{player.team_name}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{player.own_goals}</div>
                          <div className="text-xs text-muted-foreground">own goals</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No own goals recorded (that's good!)</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  </div>
  )
}