import { ScoreboardClient } from "./scoreboard-client"

export default async function StadiumScoreboardPage({ 
  params 
}: { 
  params: Promise<{ fixtureId: string }> 
}) {
  const { fixtureId } = await params
  return <ScoreboardClient fixtureId={fixtureId} />
}