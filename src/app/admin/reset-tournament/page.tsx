"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  AlertTriangle, ArrowLeft, Trash2, RefreshCw
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin-header"

export default function ResetTournamentPage() {
  const [options, setOptions] = useState({
    fixtures: true,
    events: true,
    teamStats: true,
    knockoutStage: true,
    keepTeams: true,
    keepPlayers: true
  })
  const [resetting, setResetting] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const supabase = createClient()
  const router = useRouter()

  const handleReset = async () => {
    if (confirmText !== "RESET TOURNAMENT") {
      toast.error("Please type the confirmation text exactly")
      return
    }

    if (!confirm("This action cannot be undone. Are you absolutely sure?")) {
      return
    }

    setResetting(true)

    try {
      // Reset in order to avoid foreign key constraints
      
      if (options.events) {
        // Delete all events
        const { error } = await supabase
          .from("events")
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all
        
        if (error) throw error
        toast.success("Deleted all match events")
      }

      if (options.knockoutStage) {
        // Delete knockout fixtures
        const { error } = await supabase
          .from("fixtures")
          .delete()
          .in("stage", ["semifinal", "final"])
        
        if (error) throw error
        toast.success("Deleted knockout stage fixtures")
      }

      if (options.fixtures) {
        // Reset all group stage fixtures
        const { error } = await supabase
          .from("fixtures")
          .update({
            status: "upcoming",
            score: { teamA: 0, teamB: 0 },
            started_at: null,
            half_time_at: null,
            second_half_started_at: null,
            ended_at: null,
            current_half: null
          })
          .eq("stage", "group")
        
        if (error) throw error
        toast.success("Reset all group stage fixtures")
      }

      if (options.teamStats) {
        // Reset team statistics
        const { error } = await supabase
          .from("teams")
          .update({
            stats: {
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              gf: 0,
              ga: 0,
              gd: 0,
              points: 0
            }
          })
          .eq("active", true)
        
        if (error) throw error
        toast.success("Reset all team statistics")
      }

      if (!options.keepPlayers) {
        // Delete all players
        const { error } = await supabase
          .from("players")
          .delete()
          .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all
        
        if (error) throw error
        toast.success("Deleted all players")
      }

      if (!options.keepTeams) {
        // Deactivate all teams
        const { error } = await supabase
          .from("teams")
          .update({ active: false })
          .eq("active", true)
        
        if (error) throw error
        toast.success("Deactivated all teams")
      }

      toast.success("Tournament reset completed successfully!")
      
      // Redirect to admin page after 2 seconds
      setTimeout(() => {
        router.push("/admin")
      }, 2000)

    } catch (error) {
      console.error("Reset error:", error)
      toast.error("Failed to reset tournament. Check console for details.")
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <AdminHeader title="Reset Tournament" backTo="/admin" backLabel="Back to Admin" />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>WARNING:</strong> This will reset the entire tournament. This action cannot be undone.
              Make sure to export any data you need before proceeding.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Reset Options</CardTitle>
              <CardDescription>
                Select what you want to reset. Unchecked items will be preserved.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="fixtures"
                    checked={options.fixtures}
                    onCheckedChange={(checked) => 
                      setOptions({...options, fixtures: checked as boolean})
                    }
                  />
                  <label htmlFor="fixtures" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Reset all group stage fixtures to upcoming
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="events"
                    checked={options.events}
                    onCheckedChange={(checked) => 
                      setOptions({...options, events: checked as boolean})
                    }
                  />
                  <label htmlFor="events" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Delete all match events (goals, assists, cards)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="teamStats"
                    checked={options.teamStats}
                    onCheckedChange={(checked) => 
                      setOptions({...options, teamStats: checked as boolean})
                    }
                  />
                  <label htmlFor="teamStats" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Reset team statistics (points, goals, etc.)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="knockoutStage"
                    checked={options.knockoutStage}
                    onCheckedChange={(checked) => 
                      setOptions({...options, knockoutStage: checked as boolean})
                    }
                  />
                  <label htmlFor="knockoutStage" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Delete knockout stage fixtures
                  </label>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="keepTeams"
                    checked={options.keepTeams}
                    onCheckedChange={(checked) => 
                      setOptions({...options, keepTeams: checked as boolean})
                    }
                  />
                  <label htmlFor="keepTeams" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Keep teams (uncheck to deactivate all teams)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="keepPlayers"
                    checked={options.keepPlayers}
                    onCheckedChange={(checked) => 
                      setOptions({...options, keepPlayers: checked as boolean})
                    }
                  />
                  <label htmlFor="keepPlayers" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Keep players (uncheck to delete all players)
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Confirm Reset</CardTitle>
              <CardDescription>
                Type <strong>RESET TOURNAMENT</strong> below to confirm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type confirmation text here"
                className="w-full px-3 py-2 border rounded-md"
              />
              
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleReset}
                disabled={resetting || confirmText !== "RESET TOURNAMENT"}
              >
                {resetting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Tournament...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reset Tournament
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}