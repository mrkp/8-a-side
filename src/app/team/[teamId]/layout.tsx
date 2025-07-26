import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { RealtimeTrades } from "@/components/realtime/realtime-trades"

export default async function TeamLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { teamId: string }
}) {
  const supabase = await createClient()
  
  // Get team data
  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("id", params.teamId)
    .single()

  if (!team) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold">{team.name}</h1>
            <nav className="flex items-center gap-4">
              <Link 
                href={`/team/${params.teamId}`} 
                className="text-sm font-medium hover:text-primary"
              >
                My Team
              </Link>
              <Link 
                href={`/team/${params.teamId}/trades`} 
                className="text-sm font-medium hover:text-primary"
              >
                Trades
              </Link>
              <Link 
                href={`/team/${params.teamId}/tournament`} 
                className="text-sm font-medium hover:text-primary"
              >
                Tournament
              </Link>
            </nav>
          </div>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Switch Team
          </Link>
        </div>
      </header>
      <main className="container py-6">
        <RealtimeTrades teamId={params.teamId} />
        {children}
      </main>
    </div>
  )
}