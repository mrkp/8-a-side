import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { RealtimeTrades } from "@/components/realtime/realtime-trades"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/")
  }

  // Get team data
  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("email", user.email)
    .single()

  if (!team) {
    redirect("/")
  }

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
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
                href="/dashboard" 
                className="text-sm font-medium hover:text-primary"
              >
                My Team
              </Link>
              <Link 
                href="/dashboard/trades" 
                className="text-sm font-medium hover:text-primary"
              >
                Trades
              </Link>
              <Link 
                href="/dashboard/tournament" 
                className="text-sm font-medium hover:text-primary"
              >
                Tournament
              </Link>
            </nav>
          </div>
          <form action={handleSignOut}>
            <button
              type="submit"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>
      <main className="container py-6">
        <RealtimeTrades teamId={team.id} />
        {children}
      </main>
    </div>
  )
}