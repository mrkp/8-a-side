import Link from "next/link"
import { createClient } from "@/utils/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  
  // Get all teams
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .order("name")

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">8-a-Side Tournament</h1>
        <p className="text-muted-foreground">Select your team to continue</p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-4xl">
        {teams?.map(team => (
          <Link
            key={team.id}
            href={`/team/${team.id}`}
            className="p-6 border rounded-lg hover:border-primary hover:bg-accent transition-all text-center"
          >
            <h2 className="text-xl font-semibold">{team.name}</h2>
          </Link>
        ))}
      </div>
    </main>
  )
}