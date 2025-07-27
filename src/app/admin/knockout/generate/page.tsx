"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { Trophy, ArrowRight, AlertCircle } from "lucide-react"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { toast } from "sonner"

interface Team {
  id: string
  name: string
  logo?: string
  group?: string
  stats?: any
}

export default function GenerateKnockoutPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [groupATeams, setGroupATeams] = useState<Team[]>([])
  const [groupBTeams, setGroupBTeams] = useState<Team[]>([])
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    const { data } = await supabase
      .from("teams")
      .select("*")
      .order("group")

    if (data) {
      const sorted = data.sort((a, b) => {
        const statsA = a.stats || { points: 0, gd: 0, gf: 0 }
        const statsB = b.stats || { points: 0, gd: 0, gf: 0 }
        
        if (statsB.points !== statsA.points) return statsB.points - statsA.points
        if (statsB.gd !== statsA.gd) return statsB.gd - statsA.gd
        return statsB.gf - statsA.gf
      })

      setTeams(sorted)
      setGroupATeams(sorted.filter(t => t.group === 'A').slice(0, 4))
      setGroupBTeams(sorted.filter(t => t.group === 'B').slice(0, 4))
    }
    setLoading(false)
  }

  const generateBracket = async () => {
    if (groupATeams.length !== 4 || groupBTeams.length !== 4) {
      toast.error("Need exactly 4 teams from each group")
      return
    }

    setGenerating(true)

    try {
      // Create quarter-final matchups
      const quarterFinals = [
        { stage: 'quarterfinal', position: 1, team_a: groupATeams[0].id, team_b: groupBTeams[3].id }, // 1A vs 4B
        { stage: 'quarterfinal', position: 2, team_a: groupATeams[1].id, team_b: groupBTeams[2].id }, // 2A vs 3B
        { stage: 'quarterfinal', position: 3, team_a: groupBTeams[0].id, team_b: groupATeams[3].id }, // 1B vs 4A
        { stage: 'quarterfinal', position: 4, team_a: groupBTeams[1].id, team_b: groupATeams[2].id }, // 2B vs 3A
      ]

      // Create empty semi-finals
      const semiFinals = [
        { stage: 'semifinal', position: 1 }, // Winner QF1 vs Winner QF2
        { stage: 'semifinal', position: 2 }, // Winner QF3 vs Winner QF4
      ]

      // Create empty final
      const final = [
        { stage: 'final', position: 1 }, // Winner SF1 vs Winner SF2
      ]

      // Insert all bracket matches
      const { error } = await supabase
        .from("knockout_bracket")
        .insert([...quarterFinals, ...semiFinals, ...final])

      if (!error) {
        toast.success("Knockout bracket generated successfully!")
        router.push("/knockout")
      } else {
        throw error
      }
    } catch (error) {
      console.error("Error generating bracket:", error)
      toast.error("Failed to generate bracket")
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading teams...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <QPCCHeader />
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-xl font-bold">Generate Knockout Bracket</h1>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/knockout">Back to Bracket</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Generate Knockout Stage</h2>
            <p className="text-muted-foreground">
              Create quarter-final matchups based on group stage standings
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The knockout bracket will be generated with the following format:
              <ul className="list-disc list-inside mt-2">
                <li>QF1: 1st Group A vs 4th Group B</li>
                <li>QF2: 2nd Group A vs 3rd Group B</li>
                <li>QF3: 1st Group B vs 4th Group A</li>
                <li>QF4: 2nd Group B vs 3rd Group A</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Group A */}
            <Card>
              <CardHeader>
                <CardTitle>Group A - Top 4</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groupATeams.map((team, idx) => (
                    <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={idx === 0 ? 'default' : 'secondary'}>
                          {idx + 1}
                        </Badge>
                        {team.logo && (
                          <img src={team.logo} alt={team.name} className="h-6 w-6 object-contain" />
                        )}
                        <span className="font-medium">{team.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {team.stats?.points || 0} pts
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Group B */}
            <Card>
              <CardHeader>
                <CardTitle>Group B - Top 4</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groupBTeams.map((team, idx) => (
                    <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={idx === 0 ? 'default' : 'secondary'}>
                          {idx + 1}
                        </Badge>
                        {team.logo && (
                          <img src={team.logo} alt={team.name} className="h-6 w-6 object-contain" />
                        )}
                        <span className="font-medium">{team.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {team.stats?.points || 0} pts
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Matchup Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Quarter-Final Matchups</CardTitle>
              <CardDescription>Preview of the generated bracket</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Upper Bracket</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>{groupATeams[0]?.name || 'TBD'}</span>
                      <span className="text-muted-foreground">vs</span>
                      <span>{groupBTeams[3]?.name || 'TBD'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>{groupATeams[1]?.name || 'TBD'}</span>
                      <span className="text-muted-foreground">vs</span>
                      <span>{groupBTeams[2]?.name || 'TBD'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Lower Bracket</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>{groupBTeams[0]?.name || 'TBD'}</span>
                      <span className="text-muted-foreground">vs</span>
                      <span>{groupATeams[3]?.name || 'TBD'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <span>{groupBTeams[1]?.name || 'TBD'}</span>
                      <span className="text-muted-foreground">vs</span>
                      <span>{groupATeams[2]?.name || 'TBD'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button 
              size="lg" 
              onClick={generateBracket}
              disabled={generating || groupATeams.length !== 4 || groupBTeams.length !== 4}
            >
              {generating ? 'Generating...' : 'Generate Knockout Bracket'}
              <Trophy className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}