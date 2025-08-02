"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Filter } from "lucide-react"

interface FixtureFiltersProps {
  onTeamFilter?: (team: string) => void
  onStageFilter?: (stage: string) => void
  onVenueFilter?: (venue: string) => void
  teams?: string[]
  venues?: string[]
}

export function FixtureFilters({ 
  onTeamFilter, 
  onStageFilter, 
  onVenueFilter,
  teams = [],
  venues = []
}: FixtureFiltersProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [selectedStage, setSelectedStage] = useState<string>("all")
  const [selectedVenue, setSelectedVenue] = useState<string>("all")

  const handleTeamChange = (value: string) => {
    setSelectedTeam(value)
    onTeamFilter?.(value)
  }

  const handleStageChange = (value: string) => {
    setSelectedStage(value)
    onStageFilter?.(value)
  }

  const handleVenueChange = (value: string) => {
    setSelectedVenue(value)
    onVenueFilter?.(value)
  }

  const hasActiveFilters = selectedTeam !== "all" || selectedStage !== "all" || selectedVenue !== "all"

  const clearFilters = () => {
    setSelectedTeam("all")
    setSelectedStage("all")
    setSelectedVenue("all")
    onTeamFilter?.("all")
    onStageFilter?.("all")
    onVenueFilter?.("all")
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      <Select value={selectedTeam} onValueChange={handleTeamChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Teams" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Teams</SelectItem>
          {teams.map(team => (
            <SelectItem key={team} value={team}>{team}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedStage} onValueChange={handleStageChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All Stages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>
          <SelectItem value="group">Group Stage</SelectItem>
          <SelectItem value="semifinal">Semi-finals</SelectItem>
          <SelectItem value="final">Final</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedVenue} onValueChange={handleVenueChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Venues" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Venues</SelectItem>
          {venues.map(venue => (
            <SelectItem key={venue} value={venue}>{venue}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}