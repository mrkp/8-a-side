"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { Plus, CalendarIcon, Upload, Trash2, Edit, Users, Trophy, Image as ImageIcon } from "lucide-react"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { toast } from "sonner"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { uploadTeamLogo, uploadPlayerImage } from "@/lib/storage"

interface Team {
  id: string
  name: string
  logo?: string
  group?: string
}

interface Player {
  id: string
  name: string
  team_id: string
  image_url?: string
  rank?: string
}

interface Fixture {
  id: string
  team_a: string
  team_b: string
  date: string
  venue?: string
  stage: string
  status: string
  teamA?: Team
  teamB?: Team
}

export default function SetupPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [isCreatingFixture, setIsCreatingFixture] = useState(false)
  const [selectedTeamA, setSelectedTeamA] = useState("")
  const [selectedTeamB, setSelectedTeamB] = useState("")
  const [fixtureDate, setFixtureDate] = useState<Date>()
  const [fixtureTime, setFixtureTime] = useState("17:00")
  const [fixtureVenue, setFixtureVenue] = useState("")
  const [fixtureStage, setFixtureStage] = useState<string>("group")
  const [editingFixture, setEditingFixture] = useState<Fixture | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null)
  const [uploadingPlayer, setUploadingPlayer] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [teamsRes, playersRes, fixturesRes] = await Promise.all([
      supabase.from("teams").select("*").order("name"),
      supabase.from("players").select("*").order("name"),
      supabase.from("fixtures").select(`
        *,
        teamA:teams!fixtures_team_a_fkey(id, name, logo),
        teamB:teams!fixtures_team_b_fkey(id, name, logo)
      `).order("date", { ascending: false })
    ])

    if (teamsRes.data) setTeams(teamsRes.data)
    if (playersRes.data) setPlayers(playersRes.data)
    if (fixturesRes.data) setFixtures(fixturesRes.data)
  }

  const createFixture = async () => {
    if (!selectedTeamA || !selectedTeamB || !fixtureDate) {
      toast.error("Please fill in all required fields")
      return
    }

    if (selectedTeamA === selectedTeamB) {
      toast.error("Teams must be different")
      return
    }

    const fullDate = new Date(fixtureDate)
    const [hours, minutes] = fixtureTime.split(':')
    fullDate.setHours(parseInt(hours), parseInt(minutes))

    const { error } = await supabase
      .from("fixtures")
      .insert({
        team_a: selectedTeamA,
        team_b: selectedTeamB,
        date: fullDate.toISOString(),
        venue: fixtureVenue || null,
        stage: fixtureStage,
        status: "upcoming"
      })

    if (!error) {
      toast.success("Fixture created successfully")
      setIsCreatingFixture(false)
      resetFixtureForm()
      fetchData()
    } else {
      toast.error("Failed to create fixture")
    }
  }

  const updateFixture = async () => {
    if (!editingFixture || !fixtureDate) return

    const fullDate = new Date(fixtureDate)
    const [hours, minutes] = fixtureTime.split(':')
    fullDate.setHours(parseInt(hours), parseInt(minutes))

    const { error } = await supabase
      .from("fixtures")
      .update({
        date: fullDate.toISOString(),
        venue: fixtureVenue || null,
        stage: fixtureStage
      })
      .eq("id", editingFixture.id)

    if (!error) {
      toast.success("Fixture updated successfully")
      setEditingFixture(null)
      resetFixtureForm()
      fetchData()
    } else {
      toast.error("Failed to update fixture")
    }
  }

  const deleteFixture = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fixture?")) return

    const { error } = await supabase
      .from("fixtures")
      .delete()
      .eq("id", id)

    if (!error) {
      toast.success("Fixture deleted")
      fetchData()
    } else {
      toast.error("Failed to delete fixture")
    }
  }

  const resetFixtureForm = () => {
    setSelectedTeamA("")
    setSelectedTeamB("")
    setFixtureDate(undefined)
    setFixtureTime("17:00")
    setFixtureVenue("")
    setFixtureStage("group")
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, teamId: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(teamId)
    const logoUrl = await uploadTeamLogo(file, teamId)

    if (logoUrl) {
      const { error } = await supabase
        .from("teams")
        .update({ logo: logoUrl })
        .eq("id", teamId)

      if (!error) {
        toast.success("Logo uploaded successfully")
        fetchData()
      }
    }
    setUploadingLogo(null)
  }

  const handlePlayerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, playerId: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPlayer(playerId)
    const imageUrl = await uploadPlayerImage(file, playerId)

    if (imageUrl) {
      const { error } = await supabase
        .from("players")
        .update({ image_url: imageUrl })
        .eq("id", playerId)

      if (!error) {
        toast.success("Player image uploaded successfully")
        fetchData()
      }
    }
    setUploadingPlayer(null)
  }

  const updateTeamGroup = async (teamId: string, group: string) => {
    const { error } = await supabase
      .from("teams")
      .update({ group })
      .eq("id", teamId)

    if (!error) {
      toast.success("Team group updated")
      fetchData()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <QPCCHeader />
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-xl font-bold">Match Setup</h1>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">Back to Admin</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="fixtures" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
          </TabsList>

          {/* Fixtures Tab */}
          <TabsContent value="fixtures" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Match Fixtures</h2>
                <p className="text-muted-foreground">Create and manage tournament matches</p>
              </div>
              <Button onClick={() => setIsCreatingFixture(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Fixture
              </Button>
            </div>

            <div className="grid gap-4">
              {fixtures.map(fixture => (
                <Card key={fixture.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-6">
                      <Badge variant={
                        fixture.stage === 'final' ? 'destructive' :
                        fixture.stage === 'semifinal' ? 'secondary' :
                        fixture.stage === 'quarterfinal' ? 'outline' : 'default'
                      }>
                        {fixture.stage}
                      </Badge>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{fixture.teamA?.name}</p>
                        </div>
                        <span className="text-muted-foreground">vs</span>
                        <div>
                          <p className="font-medium">{fixture.teamB?.name}</p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>{format(new Date(fixture.date), 'MMM d, yyyy • h:mm a')}</p>
                        {fixture.venue && <p>{fixture.venue}</p>}
                      </div>
                      <Badge variant={
                        fixture.status === 'live' ? 'destructive' :
                        fixture.status === 'completed' ? 'secondary' : 'outline'
                      }>
                        {fixture.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingFixture(fixture)
                          setFixtureDate(new Date(fixture.date))
                          setFixtureTime(format(new Date(fixture.date), 'HH:mm'))
                          setFixtureVenue(fixture.venue || "")
                          setFixtureStage(fixture.stage)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteFixture(fixture.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Team Management</h2>
              <p className="text-muted-foreground">Upload logos and assign groups</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map(team => (
                <Card key={team.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {team.logo && (
                        <img src={team.logo} alt={team.name} className="h-8 w-8 object-contain" />
                      )}
                      {team.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Logo</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, team.id)}
                          disabled={uploadingLogo === team.id}
                          className="text-sm"
                        />
                        {uploadingLogo === team.id && (
                          <Badge variant="secondary">Uploading...</Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Group</Label>
                      <Select
                        value={team.group || ""}
                        onValueChange={(value) => updateTeamGroup(team.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Group A</SelectItem>
                          <SelectItem value="B">Group B</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {players.filter(p => p.team_id === team.id).length} players
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Player Images</h2>
              <p className="text-muted-foreground">Upload profile images for players</p>
            </div>

            <div className="space-y-6">
              {teams.map(team => {
                const teamPlayers = players.filter(p => p.team_id === team.id)
                if (teamPlayers.length === 0) return null

                return (
                  <Card key={team.id}>
                    <CardHeader>
                      <CardTitle>{team.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {teamPlayers.map(player => (
                          <div key={player.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            {player.image_url ? (
                              <img 
                                src={player.image_url} 
                                alt={player.name}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{player.name}</p>
                              {player.rank && (
                                <Badge variant="outline" className="text-xs">Rank {player.rank}</Badge>
                              )}
                            </div>
                            <div>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePlayerImageUpload(e, player.id)}
                                disabled={uploadingPlayer === player.id}
                                className="text-xs w-24"
                              />
                              {uploadingPlayer === player.id && (
                                <Badge variant="secondary" className="text-xs mt-1">Uploading...</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Create/Edit Fixture Dialog */}
      <Dialog open={isCreatingFixture || !!editingFixture} onOpenChange={(open) => {
        if (!open) {
          setIsCreatingFixture(false)
          setEditingFixture(null)
          resetFixtureForm()
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingFixture ? 'Edit' : 'Create'} Fixture</DialogTitle>
            <DialogDescription>
              {editingFixture ? 'Update match details' : 'Schedule a new match'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!editingFixture && (
              <>
                <div className="space-y-2">
                  <Label>Team A (Home)</Label>
                  <Select value={selectedTeamA} onValueChange={setSelectedTeamA}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Team B (Away)</Label>
                  <Select value={selectedTeamB} onValueChange={setSelectedTeamB}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.filter(t => t.id !== selectedTeamA).map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fixtureDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fixtureDate ? format(fixtureDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fixtureDate}
                    onSelect={setFixtureDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={fixtureTime}
                onChange={(e) => setFixtureTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Venue (optional)</Label>
              <Input
                placeholder="e.g., Main Field"
                value={fixtureVenue}
                onChange={(e) => setFixtureVenue(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Stage</Label>
              <RadioGroup value={fixtureStage} onValueChange={setFixtureStage}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="group" id="group" />
                  <Label htmlFor="group">Group Stage</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quarterfinal" id="quarterfinal" />
                  <Label htmlFor="quarterfinal">Quarter Final</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="semifinal" id="semifinal" />
                  <Label htmlFor="semifinal">Semi Final</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="final" id="final" />
                  <Label htmlFor="final">Final</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreatingFixture(false)
              setEditingFixture(null)
              resetFixtureForm()
            }}>
              Cancel
            </Button>
            <Button onClick={editingFixture ? updateFixture : createFixture}>
              {editingFixture ? 'Update' : 'Create'} Fixture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}