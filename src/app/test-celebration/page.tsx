"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { StadiumGoalCelebration } from "@/components/stadium-goal-celebration"

export default function TestCelebrationPage() {
  const [showCelebration, setShowCelebration] = useState(false)

  const triggerCelebration = () => {
    console.log("Triggering test celebration")
    setShowCelebration(true)
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      console.log("Hiding test celebration")
      setShowCelebration(false)
    }, 10000)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-4">Test Goal Celebration</h1>
      <Button onClick={triggerCelebration} size="lg">
        Trigger Goal Celebration
      </Button>
      
      <StadiumGoalCelebration
        show={showCelebration}
        playerName="Test Player"
        teamName="Test Team"
        assistName="Test Assist"
        rank="A"
      />
    </div>
  )
}