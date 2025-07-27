"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function TestRealtimePage() {
  const [fixtures, setFixtures] = useState<any[]>([])
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("Not subscribed")
  const [messages, setMessages] = useState<string[]>([])
  
  const supabase = createClient()

  useEffect(() => {
    fetchFixtures()
    
    // Subscribe to all fixture updates
    const channel = supabase
      .channel('test-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fixtures'
        },
        (payload) => {
          const message = `${new Date().toLocaleTimeString()} - ${payload.eventType} on fixtures: ${JSON.stringify(payload)}`
          console.log(message)
          setMessages(prev => [message, ...prev].slice(0, 10))
          fetchFixtures()
        }
      )
      .subscribe((status) => {
        setSubscriptionStatus(status)
        console.log('Subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchFixtures = async () => {
    const { data } = await supabase
      .from("fixtures")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(5)
    
    if (data) {
      setFixtures(data)
    }
  }

  const updateRandomFixture = async () => {
    if (fixtures.length === 0) return
    
    const fixture = fixtures[0]
    const newScore = {
      teamA: fixture.score.teamA + Math.floor(Math.random() * 2),
      teamB: fixture.score.teamB + Math.floor(Math.random() * 2)
    }
    
    const { error } = await supabase
      .from("fixtures")
      .update({ 
        score: newScore,
        updated_at: new Date().toISOString()
      })
      .eq("id", fixture.id)
    
    if (error) {
      console.error('Update error:', error)
    } else {
      console.log('Updated fixture:', fixture.id)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Real-time Test Page</CardTitle>
          <Badge variant={subscriptionStatus === 'SUBSCRIBED' ? 'default' : 'secondary'}>
            {subscriptionStatus}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={updateRandomFixture}>
            Update Random Fixture Score
          </Button>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Recent Fixtures:</h3>
            {fixtures.map(fixture => (
              <div key={fixture.id} className="p-2 border rounded">
                <p className="text-sm">ID: {fixture.id}</p>
                <p>Score: {fixture.score.teamA} - {fixture.score.teamB}</p>
                <p className="text-xs text-muted-foreground">
                  Updated: {new Date(fixture.updated_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Real-time Messages:</h3>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {messages.map((msg, idx) => (
                <p key={idx} className="text-xs font-mono">{msg}</p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}