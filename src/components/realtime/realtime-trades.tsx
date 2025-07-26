"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

interface RealtimeTradesProps {
  teamId: string
}

export function RealtimeTrades({ teamId }: RealtimeTradesProps) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to new trades
    const channel = supabase
      .channel('trades')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trades',
          filter: `to_team_id=eq.${teamId}`
        },
        (payload) => {
          console.log('New trade received:', payload)
          router.refresh()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trades',
          filter: `from_team_id=eq.${teamId}`
        },
        (payload) => {
          console.log('Trade updated:', payload)
          router.refresh()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'players',
          filter: `team_id=eq.${teamId}`
        },
        (payload) => {
          console.log('Player updated:', payload)
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [teamId, router, supabase])

  return null
}