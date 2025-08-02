"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRealtimeFixture } from "@/hooks/useRealtimeFixture"
import { StadiumGoalCelebration } from "@/components/stadium-goal-celebration"

interface ScoreboardClientProps {
  fixtureId: string
}

export function ScoreboardClient({ fixtureId }: ScoreboardClientProps) {
  const [displayTime, setDisplayTime] = useState(Date.now())
  const [lastCelebratedGoalId, setLastCelebratedGoalId] = useState<string | null>(null)
  const celebrationTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [celebrationData, setCelebrationData] = useState<{
    show: boolean
    playerName: string
    playerImage?: string
    assistName?: string
    assistImage?: string
    teamName: string
    rank?: string
  }>({
    show: false,
    playerName: "",
    teamName: "",
  })
  
  // Manual celebration trigger for testing
  useEffect(() => {
    const handleManualCelebration = (event: CustomEvent) => {
      console.log('Manual celebration triggered:', event.detail)
      setCelebrationData({
        show: true,
        playerName: event.detail.playerName,
        teamName: event.detail.teamName,
        playerImage: undefined,
        assistName: undefined,
        assistImage: undefined,
        rank: undefined
      })
      
      setTimeout(() => {
        setCelebrationData(prev => ({ ...prev, show: false }))
      }, 10000)
    }
    
    window.addEventListener('manual-celebration', handleManualCelebration as any)
    return () => window.removeEventListener('manual-celebration', handleManualCelebration as any)
  }, [])
  
  // Debug celebration state
  useEffect(() => {
    console.log('Celebration data updated:', celebrationData)
  }, [celebrationData])

  const { fixture, events, isConnected, lastGoal } = useRealtimeFixture({ fixtureId })
  
  // Debug real-time data
  useEffect(() => {
    console.log('Real-time hook data:', {
      fixtureId,
      isConnected,
      hasFixture: !!fixture,
      eventsCount: events.length,
      lastGoal: lastGoal ? {
        id: lastGoal.id,
        type: lastGoal.type,
        playerName: lastGoal.player?.name,
        teamName: lastGoal.team?.name
      } : null,
      lastCelebratedGoalId
    })
  }, [fixtureId, isConnected, fixture, events, lastGoal, lastCelebratedGoalId])
  const [previousScore, setPreviousScore] = useState<{ teamA: number; teamB: number } | null>(null)
  
  // Debug logging
  useEffect(() => {
    console.log('Scoreboard state:', {
      fixtureId,
      isConnected,
      fixtureStatus: fixture?.status,
      currentScore: fixture?.score,
      eventsCount: events.length,
      lastGoal,
      celebrationData
    })
  }, [fixtureId, isConnected, fixture, events, lastGoal, celebrationData])

  // Handle score changes as a fallback if real-time events fail
  useEffect(() => {
    if (fixture?.score && previousScore) {
      const scoreChanged = 
        fixture.score.teamA !== previousScore.teamA || 
        fixture.score.teamB !== previousScore.teamB
      
      if (scoreChanged) {
        console.log('Score changed detected! Waiting for events to update...')
        // Don't trigger celebration here - let the lastGoal mechanism handle it
        // This prevents showing stale player data
      }
    }
    
    // Update previous score
    if (fixture?.score) {
      setPreviousScore(fixture.score)
    }
  }, [fixture?.score])

  // Handle lastGoal from real-time events
  useEffect(() => {
    console.log('Goal celebration effect triggered:', {
      lastGoalId: lastGoal?.id,
      lastCelebratedGoalId,
      isDifferent: lastGoal?.id !== lastCelebratedGoalId,
      hasPlayer: !!lastGoal?.player,
      goalType: lastGoal?.type
    })
    
    // Check if we have a new goal to celebrate
    if (!lastGoal) return
    if (!lastGoal.player) {
      console.warn('Goal event missing player data:', lastGoal)
      return
    }
    if (lastGoal.id === lastCelebratedGoalId) {
      console.log('Goal already celebrated:', lastGoal.id)
      return
    }
    
    // Only show celebration for regular goals (not own goals)
    if (lastGoal.type === 'goal') {
      console.log('🎉 Triggering celebration for:', lastGoal.player.name)
      
      // Mark this goal as celebrated
      setLastCelebratedGoalId(lastGoal.id)
      
      // Show celebration
      setCelebrationData({
        show: true,
        playerName: lastGoal.player.name,
        playerImage: lastGoal.player.image_url,
        assistName: lastGoal.assist_player?.name,
        assistImage: lastGoal.assist_player?.image_url,
        teamName: lastGoal.team.name,
        rank: lastGoal.player.rank
      })
      
      // Clear any existing timer
      if (celebrationTimerRef.current) {
        clearTimeout(celebrationTimerRef.current)
      }
      
      // Auto-hide after 10 seconds
      celebrationTimerRef.current = setTimeout(() => {
        console.log('Hiding celebration after 10 seconds')
        setCelebrationData(prev => ({ ...prev, show: false }))
        celebrationTimerRef.current = null
      }, 10000)
    } else {
      console.log('Skipping celebration - not a regular goal:', lastGoal.type)
    }
  }, [lastGoal?.id, lastCelebratedGoalId]) // Depend on both IDs to ensure proper triggering

  // Update display time every second for live matches
  useEffect(() => {
    if (fixture?.status === 'live' && fixture.started_at) {
      const interval = setInterval(() => {
        setDisplayTime(Date.now())
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [fixture?.status, fixture?.started_at])
  
  // Cleanup celebration timer on unmount
  useEffect(() => {
    return () => {
      if (celebrationTimerRef.current) {
        clearTimeout(celebrationTimerRef.current)
      }
    }
  }, [])

  const getElapsedSeconds = () => {
    if (!fixture?.started_at) return 0
    
    const currentHalf = fixture.current_half || 1
    let startTime: number
    
    if (currentHalf === 2 && fixture.second_half_started_at) {
      // Second half - calculate from second half start
      startTime = new Date(fixture.second_half_started_at).getTime()
    } else {
      // First half - calculate from match start
      startTime = new Date(fixture.started_at).getTime()
    }
    
    const now = fixture.ended_at 
      ? new Date(fixture.ended_at).getTime() 
      : fixture.half_time_at && currentHalf === 1
      ? new Date(fixture.half_time_at).getTime()
      : displayTime
    
    const elapsed = Math.floor((now - startTime) / 1000) - (fixture.total_paused_time || 0)
    return Math.max(0, elapsed)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!fixture) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-2xl">Loading scoreboard...</p>
      </div>
    )
  }

  const isLive = fixture.status === 'live'
  const isCompleted = fixture.status === 'completed'

  // Group goals by team
  const teamAGoals = events.filter(e => e.team?.id === fixture.team_a)
  const teamBGoals = events.filter(e => e.team?.id === fixture.team_b)

  return (
    <div className="min-h-screen bg-[#B34AFF] text-black overflow-hidden relative">
      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm animate-pulse">
          Connecting...
        </div>
      )}

      {/* Main Scoreboard */}
      <div className="h-screen flex flex-col p-8">
        {/* Header */}
        <div className="text-center mb-8 bg-black text-[#FFEE54] p-6 rounded-2xl shadow-2xl">
          <h1 className="text-4xl font-bold mb-2">QPCC 8-A-SIDE FOOTBALL</h1>
          <div className="text-2xl">
            {fixture.stage === 'group' ? 'Group Stage' : 
             fixture.stage.charAt(0).toUpperCase() + fixture.stage.slice(1)}
          </div>
        </div>

        {/* Score Display */}
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-16 items-center w-full max-w-7xl">
            {/* Team A */}
            <div className="text-center space-y-6 bg-[#FFEE54] p-8 rounded-2xl shadow-2xl">
              {fixture.teamA?.logo && (
                <img 
                  src={fixture.teamA.logo} 
                  alt={fixture.teamA.name}
                  className="h-48 w-48 object-contain mx-auto"
                />
              )}
              <h2 className="text-5xl font-bold">{fixture.teamA?.name}</h2>
              
              {/* Goal Scorers */}
              <div className="space-y-2 text-xl">
                {teamAGoals.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <span>⚽</span>
                    <span>{event.player?.name}</span>
                    <span className="text-sm">
                      ({event.minute}'{event.half === 2 && ' 2nd'})
                    </span>
                    {event.assist_player && (
                      <span className="text-sm text-black/60">
                        (A: {event.assist_player.name})
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Score */}
            <div className="text-center bg-black text-[#FFEE54] p-8 rounded-2xl shadow-2xl">
              <div className="text-9xl font-bold flex items-center justify-center gap-8">
                <motion.span
                  key={`scoreA-${fixture.score?.teamA || 0}`}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  className="tabular-nums"
                >
                  {fixture.score?.teamA || 0}
                </motion.span>
                <span className="text-6xl">-</span>
                <motion.span
                  key={`scoreB-${fixture.score?.teamB || 0}`}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  className="tabular-nums"
                >
                  {fixture.score?.teamB || 0}
                </motion.span>
              </div>
              
              {/* Timer */}
              {isLive && (
                <div className="mt-8">
                  <div className="text-5xl font-mono animate-pulse">
                    {formatTime(getElapsedSeconds())}
                  </div>
                  <div className="text-2xl mt-2">
                    {fixture.current_half === 2 ? '2nd Half' : '1st Half'}
                  </div>
                </div>
              )}
              
              {/* Half Time Status */}
              {fixture?.half_time_at && !fixture?.second_half_started_at && (
                <div className="mt-8 text-4xl">
                  HALF TIME
                </div>
              )}
              
              {isCompleted && (
                <div className="mt-8 text-4xl">
                  FULL TIME
                </div>
              )}
            </div>

            {/* Team B */}
            <div className="text-center space-y-6 bg-[#FFEE54] p-8 rounded-2xl shadow-2xl">
              {fixture.teamB?.logo && (
                <img 
                  src={fixture.teamB.logo} 
                  alt={fixture.teamB.name}
                  className="h-48 w-48 object-contain mx-auto"
                />
              )}
              <h2 className="text-5xl font-bold">{fixture.teamB?.name}</h2>
              
              {/* Goal Scorers */}
              <div className="space-y-2 text-xl">
                {teamBGoals.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <span>⚽</span>
                    <span>{event.player?.name}</span>
                    <span className="text-sm">
                      ({event.minute}'{event.half === 2 && ' 2nd'})
                    </span>
                    {event.assist_player && (
                      <span className="text-sm text-black/60">
                        (A: {event.assist_player.name})
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Stadium Goal Celebration with Lottie Animation */}
      <StadiumGoalCelebration
        show={celebrationData.show}
        playerName={celebrationData.playerName}
        playerImage={celebrationData.playerImage}
        assistName={celebrationData.assistName}
        assistImage={celebrationData.assistImage}
        teamName={celebrationData.teamName}
        rank={celebrationData.rank}
      />
    </div>
  )
}