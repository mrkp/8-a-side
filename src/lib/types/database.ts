export type Team = {
  id: string
  name: string
  slug: string
  email: string
  logo?: string | null
  group?: string | null
  stats?: TeamStats
  created_at: string
}

export type TeamStats = {
  played: number
  won: number
  drawn: number
  lost: number
  gf: number  // goals for
  ga: number  // goals against
  gd: number  // goal difference
  points: number
}

export type Player = {
  id: string
  name: string
  team_id: string | null
  rank: 'A' | 'B' | 'C' | null
  is_professional?: boolean
  is_captain?: boolean
  goals?: number
  assists?: number
  image_url?: string | null
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

// Tournament types
export type Fixture = {
  id: string
  team_a: string
  team_b: string
  date: string
  venue?: string | null
  status: 'upcoming' | 'live' | 'completed'
  score: {
    teamA: number
    teamB: number
  }
  stage: 'group' | 'quarterfinal' | 'semifinal' | 'final'
  created_at: string
  updated_at: string
}

export type MatchEvent = {
  id: string
  fixture_id: string
  team_id: string
  player_id: string
  assist_player_id?: string | null
  minute: number
  type: 'goal' | 'own_goal' | 'yellow_card' | 'red_card'
  created_at: string
}

export type KnockoutBracket = {
  id: string
  stage: 'quarterfinal' | 'semifinal' | 'final'
  position: number
  team_a?: string | null
  team_b?: string | null
  winner?: string | null
  fixture_id?: string | null
  created_at: string
  updated_at: string
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

export type FixtureWithTeams = Fixture & {
  teamA?: Team
  teamB?: Team
  events?: MatchEvent[]
}

export type MatchEventWithDetails = MatchEvent & {
  player?: Player
  team?: Team
}