import { createClient } from "@/utils/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Calendar, BarChart3, Users, Dribbble } from "lucide-react"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

// Import the content from other pages (we'll create components for reusability)
import FixturesContent from "@/components/dashboard/fixtures-content"
import StandingsContent from "@/components/dashboard/standings-content"
import LeaderboardContent from "@/components/dashboard/leaderboard-content"
import LiveMatchesContent from "@/components/dashboard/live-matches-content"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get counts for badges
  const { count: liveCount } = await supabase
    .from("fixtures")
    .select("*", { count: 'exact', head: true })
    .eq("status", "live")

  const { count: upcomingCount } = await supabase
    .from("fixtures")
    .select("*", { count: 'exact', head: true })
    .eq("status", "upcoming")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <QPCCHeader />
              <Separator orientation="vertical" className="h-8" />
              <div className="flex items-center gap-2">
                <Dribbble className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-bold">Tournament Dashboard</h1>
              </div>
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
                <Link href="/admin">Admin</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="fixtures" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl mx-auto">
            <TabsTrigger value="fixtures" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Fixtures</span>
              {upcomingCount! > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1">
                  {upcomingCount}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="table" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Table</span>
            </TabsTrigger>
            
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Top Scorers</span>
            </TabsTrigger>
            
            <TabsTrigger value="live" className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  {liveCount! > 0 && (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </>
                  )}
                </span>
                <span className="hidden sm:inline">Live</span>
              </div>
              {liveCount! > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 px-1">
                  {liveCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fixtures">
            <FixturesContent />
          </TabsContent>

          <TabsContent value="table">
            <StandingsContent />
          </TabsContent>

          <TabsContent value="leaderboard">
            <LeaderboardContent />
          </TabsContent>

          <TabsContent value="live">
            <LiveMatchesContent />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}