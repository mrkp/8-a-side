"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Trophy, Users, BarChart3, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function HomePageClient({ children }: { children: React.ReactNode }) {
  const [showHeader, setShowHeader] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show header when scrolled past the hero section buttons (approximately 500px)
      const scrollPosition = window.scrollY
      setShowHeader(scrollPosition > 500)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* Sticky Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b transition-transform duration-300",
        showHeader ? "translate-y-0" : "-translate-y-full"
      )}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3">
                <img 
                  src="/qpcc-logo.png" 
                  alt="QPCC"
                  className="h-10 w-auto"
                />
                <span className="font-bold text-lg hidden sm:inline">8-A-SIDE Tournament</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/fixtures">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Fixtures
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/standings">
                  <Trophy className="mr-2 h-4 w-4" />
                  Standings
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tournament">
                  <Users className="mr-2 h-4 w-4" />
                  Team Rosters
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/leaderboard">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Statistics
                </Link>
              </Button>
            </nav>

            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/fixtures">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Fixtures
                    </Link>
                  </Button>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/standings">
                      <Trophy className="mr-2 h-4 w-4" />
                      Standings
                    </Link>
                  </Button>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/tournament">
                      <Users className="mr-2 h-4 w-4" />
                      Team Rosters
                    </Link>
                  </Button>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/leaderboard">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Statistics
                    </Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {children}
    </>
  )
}