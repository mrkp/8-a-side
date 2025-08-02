import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  const supabase = await createClient()
  
  // Get all teams with logos
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, logo, active")
    .eq("active", true)
    .order("name")

  // Check which logo files exist
  const logoDir = path.join(process.cwd(), 'public', 'logos')
  const existingFiles = fs.readdirSync(logoDir)

  const results = teams?.map(team => {
    const logoFileName = team.logo?.split('/').pop()
    const fileExists = logoFileName ? existingFiles.includes(logoFileName) : false
    
    return {
      team: team.name,
      logoPath: team.logo,
      fileExists,
      issue: !team.logo ? 'No logo path set' : 
             !fileExists ? 'File not found' : 
             null
    }
  })

  return NextResponse.json({
    summary: {
      totalTeams: teams?.length || 0,
      teamsWithLogos: results?.filter(r => r.logoPath).length || 0,
      workingLogos: results?.filter(r => r.fileExists).length || 0
    },
    teams: results,
    availableFiles: existingFiles.filter(f => f !== 'README.md')
  })
}