import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  
  // Get Full Barrel team and players
  const { data: team, error } = await supabase
    .from("teams")
    .select(`
      *,
      players(
        id,
        name,
        jersey_number,
        team_id
      )
    `)
    .eq("name", "Full Barrel")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Also get players directly
  const { data: directPlayers } = await supabase
    .from("players")
    .select("*")
    .eq("team_id", team?.id)
    .order("jersey_number")

  return NextResponse.json({
    team: {
      id: team?.id,
      name: team?.name,
      logo: team?.logo,
      playerCount: team?.players?.length || 0,
      players: team?.players?.map((p: any) => ({
        name: p.name,
        jersey: p.jersey_number
      }))
    },
    directQuery: directPlayers?.map(p => ({
      name: p.name,
      jersey: p.jersey_number
    }))
  })
}