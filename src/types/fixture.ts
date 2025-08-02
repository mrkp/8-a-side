export interface Fixture {
  id: string
  team_a: string
  team_b: string
  date: string
  venue?: string
  status: 'upcoming' | 'live' | 'completed'
  score: {
    teamA: number
    teamB: number
  }
  stage: 'group' | 'quarter' | 'semi' | 'final'
  teamA?: {
    id: string
    name: string
    logo?: string
  }
  teamB?: {
    id: string
    name: string
    logo?: string
  }
  started_at?: string
  ended_at?: string
  paused_at?: string
  total_paused_time?: number
  current_half?: number
  half_time_at?: string
  second_half_started_at?: string
}

export interface MatchEvent {
  id: string
  fixture_id: string
  team_id: string
  player_id: string
  assist_player_id?: string
  minute: number
  type: 'goal' | 'own_goal' | 'yellow_card' | 'red_card'
  half?: number
  created_at: string
  player?: {
    id: string
    name: string
    image_url?: string
    rank?: string
  }
  assist_player?: {
    id: string
    name: string
    image_url?: string
  }
  team?: {
    id: string
    name: string
  }
}