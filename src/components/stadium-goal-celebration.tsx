"use client"

import { useEffect, useState } from "react"
import Lottie from "lottie-react"
import { motion, AnimatePresence } from "framer-motion"

interface StadiumGoalCelebrationProps {
  show: boolean
  playerName: string
  playerImage?: string
  assistName?: string
  assistImage?: string
  teamName: string
  rank?: string
}

// Use local Lottie animation file
const LOCAL_LOTTIE_PATH = "/congratulation.json"

export function StadiumGoalCelebration({
  show,
  playerName,
  playerImage,
  assistName,
  assistImage,
  teamName,
  rank
}: StadiumGoalCelebrationProps) {
  const [animationData, setAnimationData] = useState<any>(null)
  const [showPlayerInfo, setShowPlayerInfo] = useState(false)

  useEffect(() => {
    // Load local Lottie animation
    const loadAnimation = async () => {
      try {
        console.log('Loading local Lottie animation from:', LOCAL_LOTTIE_PATH)
        const response = await fetch(LOCAL_LOTTIE_PATH)
        if (response.ok) {
          const data = await response.json()
          console.log('Successfully loaded local Lottie animation')
          setAnimationData(data)
        } else {
          console.error('Failed to load local Lottie animation:', response.status)
        }
      } catch (error) {
        console.error('Error loading local Lottie animation:', error)
      }
    }
    
    loadAnimation()
  }, [])

  useEffect(() => {
    if (show) {
      setShowPlayerInfo(false)
      // Show player info after 1.5 seconds
      const timer = setTimeout(() => {
        setShowPlayerInfo(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [show])

  console.log('StadiumGoalCelebration render - show:', show, 'playerName:', playerName)
  
  if (!show) return null

  return (
    <>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#B34AFF] overflow-hidden"
          style={{ 
            zIndex: 9999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        >
        {/* Lottie Animation Background */}
        {animationData && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lottie
              animationData={animationData}
              loop={true}
              style={{ 
                height: '80vh', 
                width: '80vw',
                maxWidth: '1200px',
                maxHeight: '800px'
              }}
              className="opacity-90"
            />
          </div>
        )}

        <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
          {/* GOAL Text */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", damping: 10 }}
            className="text-[300px] font-black text-[#FFEE54] mb-8 leading-none relative z-20"
            style={{ 
              textShadow: '0 0 100px rgba(0, 0, 0, 0.8), 0 0 50px rgba(179, 74, 255, 0.8)',
              WebkitTextStroke: '4px black'
            }}
          >
            GOAL!
          </motion.div>

          {/* Player Info */}
          <AnimatePresence>
            {showPlayerInfo && (
              <motion.div
                initial={{ y: 100, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -100, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="text-center space-y-6 bg-black text-[#FFEE54] p-16 rounded-3xl shadow-2xl"
              >
                {playerImage && (
                  <motion.img 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    src={playerImage} 
                    alt={playerName}
                    className="h-80 w-80 rounded-full mx-auto border-8 border-[#FFEE54] object-cover"
                  />
                )}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <div className="text-8xl font-bold">{playerName}</div>
                  <div className="text-5xl">{teamName}</div>
                  {rank && (
                    <div className="text-4xl">Rank {rank}</div>
                  )}
                </motion.div>
                
                {assistName && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl mt-8 flex items-center justify-center gap-4"
                  >
                    {assistImage && (
                      <img 
                        src={assistImage} 
                        alt={assistName}
                        className="h-20 w-20 rounded-full border-4 border-[#FFEE54]"
                      />
                    )}
                    <span>Assist: {assistName}</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated footballs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                  y: -100,
                  rotate: 0
                }}
                animate={{ 
                  y: (typeof window !== 'undefined' ? window.innerHeight : 1080) + 100,
                  rotate: 360,
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920)
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 3
                }}
                className="absolute text-8xl"
              >
                ⚽
              </motion.div>
            ))}
          </div>

          {/* WAM Branding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 1 }}
            className="absolute bottom-10 right-10 text-black text-2xl font-bold"
          >
            Powered by WAM!
          </motion.div>
        </div>
      </motion.div>
      )}
    </>
  )
}