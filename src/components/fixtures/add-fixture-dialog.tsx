"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, CalendarIcon } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"

interface Team {
  id: string
  name: string
  logo?: string
}

export function AddFixtureDialog({ teams }: { teams: Team[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    team_a: "",
    team_b: "",
    date: "",
    time: "",
    venue: "Field 1",
    stage: "group"
  })

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async () => {
    if (!formData.team_a || !formData.team_b || !formData.date || !formData.time) {
      toast.error("Please fill in all required fields")
      return
    }

    if (formData.team_a === formData.team_b) {
      toast.error("Please select different teams")
      return
    }

    setLoading(true)
    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`)

      const { error } = await supabase
        .from("fixtures")
        .insert({
          team_a: formData.team_a,
          team_b: formData.team_b,
          date: dateTime.toISOString(),
          venue: formData.venue,
          stage: formData.stage,
          status: "upcoming",
          score: { teamA: 0, teamB: 0 }
        })

      if (error) throw error

      toast.success("Fixture created successfully")
      setOpen(false)
      setFormData({
        team_a: "",
        team_b: "",
        date: "",
        time: "",
        venue: "Field 1",
        stage: "group"
      })
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to create fixture")
    } finally {
      setLoading(false)
    }
  }

  // Get today's date in YYYY-MM-DD format
  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Fixture
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Fixture</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Team A *</Label>
            <Select
              value={formData.team_a}
              onValueChange={(value) => setFormData(prev => ({ ...prev, team_a: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team A" />
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
            <Label>Team B *</Label>
            <Select
              value={formData.team_b}
              onValueChange={(value) => setFormData(prev => ({ ...prev, team_b: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team B" />
              </SelectTrigger>
              <SelectContent>
                {teams
                  .filter(team => team.id !== formData.team_a)
                  .map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                min={today}
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Time *</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Venue</Label>
            <Input
              value={formData.venue}
              onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
              placeholder="e.g., Field 1"
            />
          </div>

          <div className="space-y-2">
            <Label>Stage</Label>
            <Select
              value={formData.stage}
              onValueChange={(value) => setFormData(prev => ({ ...prev, stage: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="group">Group Stage</SelectItem>
                <SelectItem value="quarterfinal">Quarter Final</SelectItem>
                <SelectItem value="semifinal">Semi Final</SelectItem>
                <SelectItem value="final">Final</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Create Fixture
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}