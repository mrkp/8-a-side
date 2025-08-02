import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeFixtureOptions {
  fixtureId: string
}

export function useRealtimeFixture({ fixtureId }: UseRealtimeFixtureOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [fixture, setFixture] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [lastGoal, setLastGoal] = useState<any>(null)
  const supabase = createClient()
  const channelsRef = useRef<{ fixture?: RealtimeChannel; events?: RealtimeChannel }>({})

  useEffect(() => {
    let pollInterval: NodeJS.Timeout

    const fetchFixture = async () => {
      try {
        const { data, error } = await supabase
          .from('fixtures')
          .select(`
            *,
            teamA:teams!fixtures_team_a_fkey(id, name, logo),
            teamB:teams!fixtures_team_b_fkey(id, name, logo)
          `)
          .eq('id', fixtureId)
          .single()

        if (!error && data) {
          setFixture(data)
        }
      } catch (err) {
        console.error('Error fetching fixture:', err)
      }
    }

    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            player:players!events_player_id_fkey(id, name, image_url, rank),
            assist_player:players!events_assist_player_id_fkey(id, name, image_url),
            team:teams(id, name)
          `)
          .eq('fixture_id', fixtureId)
          .in('type', ['goal', 'own_goal'])
          .order('minute', { ascending: false })

        if (!error && data) {
          setEvents(data)
          // Set the most recent goal as lastGoal (data is already sorted by minute descending)
          const recentGoal = data.find(event => event.type === 'goal' || event.type === 'own_goal')
          if (recentGoal && recentGoal.type === 'goal') {
            console.log('Setting initial lastGoal from fetched events:', recentGoal)
            setLastGoal(recentGoal)
          }
        }
      } catch (err) {
        console.error('Error fetching events:', err)
      }
    }

    const setupSubscriptions = () => {
      console.log('Setting up real-time subscriptions for fixture:', fixtureId)

      // Fixture updates channel
      channelsRef.current.fixture = supabase
        .channel(`fixture-${fixtureId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'fixtures',
            filter: `id=eq.${fixtureId}`
          },
          (payload) => {
            console.log('Fixture update received:', payload)
            if (payload.new) {
              setFixture((prev: any) => ({
                ...prev,
                ...payload.new,
                teamA: prev?.teamA,
                teamB: prev?.teamB,
                score: payload.new.score || prev?.score
              }))
            }
          }
        )
        .subscribe((status, error) => {
          console.log('Fixture channel status:', status, error)
          if (error) {
            console.error('Fixture channel error:', error)
          }
          setIsConnected(status === 'SUBSCRIBED')
        })

      // Events channel
      console.log('Setting up events channel for fixture:', fixtureId)
      channelsRef.current.events = supabase
        .channel(`events-${fixtureId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'events',
            filter: `fixture_id=eq.${fixtureId}`
          },
          async (payload) => {
            console.log('New event received:', payload)
            if (payload.new) {
              // Fetch full event details
              const { data: newEvent } = await supabase
                .from('events')
                .select(`
                  *,
                  player:players!events_player_id_fkey(id, name, image_url, rank),
                  assist_player:players!events_assist_player_id_fkey(id, name, image_url),
                  team:teams(id, name)
                `)
                .eq('id', payload.new.id)
                .single()

              if (newEvent) {
                console.log('Processing new event:', newEvent)
                // Add to events list maintaining sort order
                setEvents(prev => {
                  const updated = [newEvent, ...prev]
                  // Sort by minute descending to ensure most recent is first
                  return updated.sort((a, b) => b.minute - a.minute)
                })
                
                if (newEvent.type === 'goal' || newEvent.type === 'own_goal') {
                  console.log('Setting lastGoal:', {
                    id: newEvent.id,
                    type: newEvent.type,
                    player: newEvent.player,
                    team: newEvent.team,
                    minute: newEvent.minute
                  })
                  // Update lastGoal state
                  setLastGoal(newEvent)
                }
                // Refetch fixture to ensure score is synced
                fetchFixture()
              }
            }
          }
        )
        .subscribe((status, error) => {
          console.log('Events channel status:', status, error)
          if (error) {
            console.error('Events channel error:', error)
          }
        })
    }

    // Initial fetch
    fetchFixture()
    fetchEvents()

    // Setup subscriptions
    setupSubscriptions()

    // Polling fallback (every 3 seconds)
    pollInterval = setInterval(() => {
      fetchFixture()
      fetchEvents()
    }, 3000)

    // Cleanup
    return () => {
      console.log('Cleaning up subscriptions')
      if (channelsRef.current.fixture) {
        supabase.removeChannel(channelsRef.current.fixture)
      }
      if (channelsRef.current.events) {
        supabase.removeChannel(channelsRef.current.events)
      }
      clearInterval(pollInterval)
    }
  }, [fixtureId])

  return {
    fixture,
    events,
    isConnected,
    lastGoal
  }
}