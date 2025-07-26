export type Team = {
  id: string
  name: string
  slug: string
  email: string
  created_at: string
}

export type Player = {
  id: string
  name: string
  team_id: string | null
  rank: 'A' | 'B' | 'C' | null
  is_professional?: boolean
  is_captain?: boolean
  created_at: string
  updated_at: string
}

export type Trade = {
  id: string
  from_team_id: string
  to_team_id: string
  status: 'pending' | 'accepted' | 'declined' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
  responded_at: string | null
}

export type TradePlayer = {
  trade_id: string
  player_id: string
  direction: 'from' | 'to'
}

export type TradeHistory = {
  id: string
  trade_id: string
  action: string
  team_id: string
  metadata: Record<string, any>
  created_at: string
}

// View types for joins
export type PlayerWithTeam = Player & {
  team?: Team
}

export type TradeWithDetails = Trade & {
  from_team?: Team
  to_team?: Team
  trade_players?: (TradePlayer & {
    player?: Player
  })[]
}