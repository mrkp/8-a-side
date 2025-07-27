"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRealtimeFixture } from "@/hooks/useRealtimeFixture"
import { StadiumGoalCelebration } from "@/components/stadium-goal-celebration"

interface ScoreboardClientProps {
  fixtureId: string
}

export function ScoreboardClient({ fixtureId }: ScoreboardClientProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
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
  
  // Debug celebration state
  useEffect(() => {
    console.log('Celebration data updated:', celebrationData)
  }, [celebrationData])

  const { fixture, events, isConnected, lastGoal } = useRealtimeFixture({ fixtureId })
  const [previousScore, setPreviousScore] = useState<{ teamA: number; teamB: number } | null>(null)

  // Handle score changes
  useEffect(() => {
    if (fixture?.score && previousScore) {
      const scoreChanged = 
        fixture.score.teamA !== previousScore.teamA || 
        fixture.score.teamB !== previousScore.teamB
      
      if (scoreChanged) {
        console.log('Score changed! Previous:', previousScore, 'New:', fixture.score)
        
        // Find the most recent goal event
        const mostRecentGoal = events.find(e => e.type === 'goal')
        
        if (mostRecentGoal && mostRecentGoal.player) {
          console.log('Triggering celebration for:', mostRecentGoal.player.name)
          setCelebrationData({
            show: true,
            playerName: mostRecentGoal.player.name,
            playerImage: mostRecentGoal.player.image_url,
            assistName: mostRecentGoal.assist_player?.name,
            assistImage: mostRecentGoal.assist_player?.image_url,
            teamName: mostRecentGoal.team.name,
            rank: mostRecentGoal.player.rank
          })
          
          // Auto-hide after 10 seconds
          setTimeout(() => {
            console.log('Hiding celebration')
            setCelebrationData(prev => ({ ...prev, show: false }))
          }, 10000)
        }
      }
    }
    
    // Update previous score
    if (fixture?.score) {
      setPreviousScore(fixture.score)
    }
  }, [fixture?.score, events])

  // Also handle lastGoal from real-time events
  useEffect(() => {
    console.log('Goal celebration effect triggered, lastGoal:', lastGoal)
    if (lastGoal && lastGoal.player) {
      console.log('Setting celebration data for player:', lastGoal.player.name)
      setCelebrationData({
        show: true,
        playerName: lastGoal.player.name,
        playerImage: lastGoal.player.image_url,
        assistName: lastGoal.assist_player?.name,
        assistImage: lastGoal.assist_player?.image_url,
        teamName: lastGoal.team.name,
        rank: lastGoal.player.rank
      })
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        console.log('Hiding celebration')
        setCelebrationData(prev => ({ ...prev, show: false }))
      }, 10000)
      
      return () => clearTimeout(timer)
    }
  }, [lastGoal])

  useEffect(() => {
    // Update timer based on match status
    if (fixture?.status === 'live') {
      setIsTimerRunning(true)
    } else {
      setIsTimerRunning(false)
    }
  }, [fixture?.status])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

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
                    <span className="text-sm">({event.minute}')</span>
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
                <div className="mt-8 text-5xl font-mono animate-pulse">
                  {formatTime(elapsedTime)}
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
                    <span className="text-sm">({event.minute}')</span>
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