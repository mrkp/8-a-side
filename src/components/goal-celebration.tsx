"use client"

import { useEffect, useState } from "react"
import Lottie from "lottie-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface GoalCelebrationProps {
  show: boolean
  playerName: string
  playerImage?: string
  teamName: string
  rank?: string
  onComplete: () => void
}

// Using a football/soccer celebration animation from Lottie Files
// Backup animations in case the primary fails
const LOTTIE_ANIMATION_URLS = [
  "https://assets4.lottiefiles.com/packages/lf20_jyu1kpvq.json", // Soccer ball
  "https://assets10.lottiefiles.com/packages/lf20_b88nh30c.json", // Confetti
  "https://assets3.lottiefiles.com/packages/lf20_aEFaHc.json" // Trophy
]

export function GoalCelebration({
  show,
  playerName,
  playerImage,
  teamName,
  rank,
  onComplete
}: GoalCelebrationProps) {
  const [animationComplete, setAnimationComplete] = useState(false)
  const [animationData, setAnimationData] = useState<any>(null)

  useEffect(() => {
    // Try to fetch animation data from multiple sources
    const tryFetchAnimation = async () => {
      for (const url of LOTTIE_ANIMATION_URLS) {
        try {
          const response = await fetch(url)
          if (response.ok) {
            const data = await response.json()
            setAnimationData(data)
            return
          }
        } catch (error) {
          console.log(`Failed to load animation from ${url}`)
        }
      }
      // If all fail, set animation complete to show player info
      setAnimationComplete(true)
    }
    
    tryFetchAnimation()
  }, [])

  useEffect(() => {
    if (show) {
      setAnimationComplete(false)
      // Total duration: 4 seconds (2s animation + 2s player info)
      const timer = setTimeout(() => {
        onComplete()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        >
          {/* Lottie Animation or Fallback */}
          {!animationComplete && (
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {animationData ? (
                <Lottie
                  animationData={animationData}
                  loop={false}
                  style={{ height: '400px', width: '400px' }}
                  onComplete={() => setAnimationComplete(true)}
                />
              ) : (
                // Fallback CSS animation
                <motion.div
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  onAnimationComplete={() => setAnimationComplete(true)}
                  className="text-9xl"
                >
                  ⚽
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Player Info */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: animationComplete ? 1 : 0, 
              opacity: animationComplete ? 1 : 0 
            }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-6 bg-gradient-to-b from-green-900/50 to-transparent p-12 rounded-2xl"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Avatar className="h-32 w-32 ring-4 ring-green-500 ring-offset-4 ring-offset-black">
                <AvatarImage src={playerImage} />
                <AvatarFallback>
                  <User className="h-16 w-16" />
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-3"
            >
              <h2 className="text-5xl font-bold text-white animate-pulse">
                GOAL!
              </h2>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-white">{playerName}</p>
                <p className="text-xl text-gray-300">{teamName}</p>
                {rank && (
                  <Badge 
                    variant={rank === 'A' ? 'destructive' : rank === 'B' ? 'secondary' : 'default'}
                    className="text-lg px-4 py-1"
                  >
                    Rank {rank}
                  </Badge>
                )}
              </div>
            </motion.div>

            {/* Celebration Text */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-center"
            >
              <p className="text-2xl text-yellow-400 font-bold animate-bounce">
                ⚽ What a strike! ⚽
              </p>
            </motion.div>
          </motion.div>

          {/* Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 100
                }}
                animate={{ 
                  y: -100,
                  x: Math.random() * window.innerWidth
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                className="absolute text-4xl"
              >
                ⚽
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}