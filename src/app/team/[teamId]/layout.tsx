import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { RealtimeTrades } from "@/components/realtime/realtime-trades"

export default async function TeamLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ teamId: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  // Get team data
  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("id", resolvedParams.teamId)
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
                href={`/team/${resolvedParams.teamId}`} 
                className="text-sm font-medium hover:text-primary"
              >
                My Team
              </Link>
              <Link 
                href={`/team/${resolvedParams.teamId}/trades`} 
                className="text-sm font-medium hover:text-primary"
              >
                Trades
              </Link>
              <Link 
                href={`/team/${resolvedParams.teamId}/tournament`} 
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
        <RealtimeTrades teamId={resolvedParams.teamId} />
        {children}
      </main>
    </div>
  )
}