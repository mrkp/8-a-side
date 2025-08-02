"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Save, Play, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function FixtureEditDialog({ fixture }: { fixture: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    status: fixture.status,
    scoreA: fixture.score?.teamA || 0,
    scoreB: fixture.score?.teamB || 0,
    venue: fixture.venue || "",
    referee: fixture.referee || "",
    weather: fixture.weather || "",
    attendance: fixture.attendance || "",
    match_report: fixture.match_report || "",
    player_of_match: fixture.player_of_match || ""
  })

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("fixtures")
        .update({
          status: formData.status,
          score: {
            teamA: parseInt(formData.scoreA.toString()),
            teamB: parseInt(formData.scoreB.toString())
          },
          venue: formData.venue,
          referee: formData.referee,
          weather: formData.weather,
          attendance: formData.attendance ? parseInt(formData.attendance.toString()) : null,
          match_report: formData.match_report,
          player_of_match: formData.player_of_match || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", fixture.id)

      if (error) throw error

      toast.success("Fixture updated successfully")
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to update fixture")
    } finally {
      setLoading(false)
    }
  }

  const quickStatusUpdate = async (newStatus: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("fixtures")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", fixture.id)

      if (error) throw error

      toast.success(`Match status updated to ${newStatus}`)
      setFormData(prev => ({ ...prev, status: newStatus }))
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to update status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Fixture</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Match Details</h3>
            
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="font-medium">{fixture.teamA?.name}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">vs</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(fixture.date), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <div className="text-center">
                <p className="font-medium">{fixture.teamB?.name}</p>
              </div>
            </div>

            {/* Quick Status Buttons */}
            <div className="flex gap-2">
              <Button
                variant={formData.status === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => quickStatusUpdate('upcoming')}
                disabled={loading}
              >
                Upcoming
              </Button>
              <Button
                variant={formData.status === 'live' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => quickStatusUpdate('live')}
                disabled={loading}
              >
                <Play className="h-4 w-4 mr-1" />
                Start Match
              </Button>
              <Button
                variant={formData.status === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => quickStatusUpdate('completed')}
                disabled={loading}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                End Match
              </Button>
            </div>

            {/* Score */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{fixture.teamA?.name} Score</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.scoreA}
                  onChange={(e) => setFormData(prev => ({ ...prev, scoreA: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{fixture.teamB?.name} Score</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.scoreB}
                  onChange={(e) => setFormData(prev => ({ ...prev, scoreB: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Match Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Match Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Venue</Label>
                <Input
                  value={formData.venue}
                  onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                  placeholder="e.g., Field 1"
                />
              </div>
              <div className="space-y-2">
                <Label>Referee</Label>
                <Input
                  value={formData.referee}
                  onChange={(e) => setFormData(prev => ({ ...prev, referee: e.target.value }))}
                  placeholder="Referee name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weather</Label>
                <Input
                  value={formData.weather}
                  onChange={(e) => setFormData(prev => ({ ...prev, weather: e.target.value }))}
                  placeholder="e.g., Sunny, 25°C"
                />
              </div>
              <div className="space-y-2">
                <Label>Attendance</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.attendance}
                  onChange={(e) => setFormData(prev => ({ ...prev, attendance: e.target.value }))}
                  placeholder="Number of spectators"
                />
              </div>
            </div>
          </div>

          {/* Post-Match Details (only show if completed) */}
          {formData.status === 'completed' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Post-Match Details</h3>
              
              <div className="space-y-2">
                <Label>Player of the Match</Label>
                <Input
                  value={formData.player_of_match}
                  onChange={(e) => setFormData(prev => ({ ...prev, player_of_match: e.target.value }))}
                  placeholder="Select player (feature coming soon)"
                />
              </div>

              <div className="space-y-2">
                <Label>Match Report</Label>
                <Textarea
                  rows={4}
                  value={formData.match_report}
                  onChange={(e) => setFormData(prev => ({ ...prev, match_report: e.target.value }))}
                  placeholder="Write a brief match summary..."
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}