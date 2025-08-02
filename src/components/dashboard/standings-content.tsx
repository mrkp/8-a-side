import { createClient } from "@/utils/supabase/server"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function StandingsContent() {
  const supabase = await createClient()

  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .eq("active", true)
    .order("name")

  // Sort teams by points, then goal difference, then goals for
  const sortedTeams = (teams || []).sort((a, b) => {
    const statsA = a.stats || { points: 0, gd: 0, gf: 0 }
    const statsB = b.stats || { points: 0, gd: 0, gf: 0 }
    
    if (statsB.points !== statsA.points) return statsB.points - statsA.points
    if (statsB.gd !== statsA.gd) return statsB.gd - statsA.gd
    return statsB.gf - statsA.gf
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">League Table</h3>
        <Link href="/standings" className="text-sm text-muted-foreground hover:underline">
          Full standings →
        </Link>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">P</TableHead>
              <TableHead className="text-center">W</TableHead>
              <TableHead className="text-center">D</TableHead>
              <TableHead className="text-center">L</TableHead>
              <TableHead className="text-center">GD</TableHead>
              <TableHead className="text-center font-bold">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTeams.slice(0, 8).map((team, index) => {
              const stats = team.stats || {
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                gd: 0,
                points: 0
              }

              return (
                <TableRow key={team.id}>
                  <TableCell>
                    <Badge 
                      variant={index === 0 ? 'default' : index < 4 ? 'secondary' : 'outline'} 
                      className="w-6 h-6 rounded-full p-0 flex items-center justify-center"
                    >
                      {index + 1}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/team/${team.id}`} className="flex items-center gap-2 hover:underline">
                      {team.logo && (
                        <img src={team.logo} alt="" className="h-5 w-5 object-contain" />
                      )}
                      <span className="truncate">{team.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-center">{stats.played}</TableCell>
                  <TableCell className="text-center text-green-600">{stats.won}</TableCell>
                  <TableCell className="text-center text-yellow-600">{stats.drawn}</TableCell>
                  <TableCell className="text-center text-red-600">{stats.lost}</TableCell>
                  <TableCell className="text-center">
                    <span className={stats.gd > 0 ? 'text-green-600' : stats.gd < 0 ? 'text-red-600' : ''}>
                      {stats.gd > 0 ? '+' : ''}{stats.gd}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge>{stats.points}</Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}