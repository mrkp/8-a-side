import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trophy, Users, ArrowRight, Zap, Dribbble, Activity, Settings } from "lucide-react"
import { QPCCHeader } from "@/components/qpcc-header"

export default async function AdminPage() {
  const supabase = await createClient()
  
  // Get all teams with player counts
  const { data: teams } = await supabase
    .from("teams")
    .select(`
      *,
      players:players(count)
    `)
    .order("name")

  // Get total player count
  const { count: totalPlayers } = await supabase
    .from("players")
    .select("*", { count: 'exact', head: true })

  // Get active trades count
  const { count: activeTrades } = await supabase
    .from("trades")
    .select("*", { count: 'exact', head: true })
    .eq("status", "pending")

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <QPCCHeader />
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Dribbble className="h-8 w-8 text-green-600" />
            <Badge variant="secondary" className="text-lg px-4 py-1">
              8-A-SIDE Football Tournament
            </Badge>
          </div>
          
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-muted/50 rounded-full border border-border/50">
            <span className="text-xs text-muted-foreground">Powered by</span>
            <img 
              src="/wam-logo.svg" 
              alt="WAM!" 
              className="h-4 w-auto"
            />
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="text-primary">QPCC</span> Draft & Trade
            <span className="text-primary"> Hub</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your football team, rank players, and propose strategic trades 
            in the official QPCC 8-A-SIDE tournament
          </p>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild>
                <Link href="/tournament">
                  <Trophy className="mr-2 h-4 w-4" />
                  Tournament Overview
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button size="lg" variant="secondary" asChild>
                <Link href="/admin/score">
                  <Activity className="mr-2 h-4 w-4" />
                  Score Matches
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" asChild>
                <Link href="/admin/setup">
                  <Settings className="mr-2 h-4 w-4" />
                  Match Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="flex gap-6 text-sm text-muted-foreground justify-center">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {totalPlayers} Players
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                {activeTrades} Active Trades
              </div>
            </div>
          </div>
        </div>

        <Separator className="mb-12" />

        {/* Teams Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Choose Your Team</h2>
            <p className="text-muted-foreground">
              Select your sponsor team to manage players and trades
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {teams?.map(team => (
              <Card key={team.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-center flex items-center justify-between">
                    <span className="truncate">{team.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {team.players?.[0]?.count || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <Button asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                    <Link href={`/team/${team.id}`}>
                      <Users className="mr-2 h-4 w-4" />
                      Manage Team
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-16">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Dribbble className="h-5 w-5 text-green-600" />
                Tournament Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">{teams?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Sponsor Teams</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-green-600">{totalPlayers || 0}</div>
                  <div className="text-sm text-muted-foreground">Football Players</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-orange-500">{activeTrades || 0}</div>
                  <div className="text-sm text-muted-foreground">Pending Trades</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}