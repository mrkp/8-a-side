import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parse, startOfWeek, endOfWeek } from "date-fns"
import { formatTimeInTimezone, formatDateInTimezone } from "@/utils/date-helpers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { QPCCHeader } from "@/components/qpcc-header"
import { Separator } from "@/components/ui/separator"
import { TeamLogo } from "@/components/team-logo"

interface PageProps {
  searchParams: Promise<{
    month?: string
  }>
}

export default async function FixturesCalendarPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const params = await searchParams

  // Parse the month from query params or use current month
  const currentDate = params.month 
    ? parse(params.month, 'yyyy-MM', new Date())
    : new Date()

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  // Get fixtures for the calendar month
  const { data: fixtures } = await supabase
    .from("fixtures")
    .select(`
      *,
      teamA:teams!fixtures_team_a_fkey(id, name, logo),
      teamB:teams!fixtures_team_b_fkey(id, name, logo)
    `)
    .gte("date", calendarStart.toISOString())
    .lte("date", calendarEnd.toISOString())
    .order("date", { ascending: true })

  // Get all days to display (includes partial weeks)
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Group fixtures by date
  const fixturesByDate = fixtures?.reduce((acc, fixture) => {
    const dateKey = format(new Date(fixture.date), 'yyyy-MM-dd')
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(fixture)
    return acc
  }, {} as Record<string, any[]>) || {}

  // Navigation helpers
  const prevMonth = subMonths(currentDate, 1)
  const nextMonth = addMonths(currentDate, 1)
  const today = new Date()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <QPCCHeader />
              <Separator orientation="vertical" className="h-8" />
              <h1 className="text-xl font-bold">Fixtures Calendar</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/fixtures">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  List View
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between bg-card rounded-lg p-4 shadow-sm">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/fixtures/calendar?month=${format(prevMonth, 'yyyy-MM')}`}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              {!isSameMonth(currentDate, today) && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/fixtures/calendar">
                    Today
                  </Link>
                </Button>
              )}
            </div>

            <Button variant="outline" size="icon" asChild>
              <Link href={`/fixtures/calendar?month=${format(nextMonth, 'yyyy-MM')}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Calendar Grid */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-7">
                {/* Weekday headers */}
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium border-b bg-muted/50">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.slice(0, 3)}</span>
                  </div>
                ))}

                {/* Calendar days */}
                {days.map((day, index) => {
                  const dateKey = format(day, 'yyyy-MM-dd')
                  const dayFixtures = fixturesByDate[dateKey] || []
                  const isToday = isSameDay(day, today)
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const hasFixtures = dayFixtures.length > 0

                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        min-h-[100px] sm:min-h-[120px] p-2 border-b border-r relative
                        ${index % 7 === 0 ? 'border-l' : ''}
                        ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''}
                        ${isToday ? 'bg-primary/5 ring-2 ring-primary/20' : ''}
                        ${hasFixtures ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                          {format(day, 'd')}
                        </span>
                        {hasFixtures && (
                          <Badge variant="secondary" className="text-xs px-1">
                            {dayFixtures.length}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {dayFixtures.slice(0, 3).map((fixture: any, idx: number) => (
                          <Link
                            key={fixture.id}
                            href={`/live/${fixture.id}`}
                            className="block group"
                          >
                            <div className="text-xs p-1.5 bg-card rounded border hover:border-primary transition-colors">
                              {fixture.status === 'live' && (
                                <Badge variant="destructive" className="text-[10px] px-1 mb-1">
                                  LIVE
                                </Badge>
                              )}
                              <div className="font-medium truncate">
                                {fixture.teamA?.name?.split(' ')[0]} vs {fixture.teamB?.name?.split(' ')[0]}
                              </div>
                              <div className="text-muted-foreground flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                {formatTimeInTimezone(fixture.date)}
                              </div>
                              {fixture.venue && (
                                <div className="text-[10px] text-muted-foreground truncate">
                                  {fixture.venue}
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                        
                        {dayFixtures.length > 3 && (
                          <Link
                            href={`/fixtures?date=${dateKey}`}
                            className="text-xs text-primary hover:underline font-medium"
                          >
                            +{dayFixtures.length - 3} more
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Day's Fixtures Detail */}
          {fixtures && fixtures.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">All Fixtures This Month</h3>
              
              {/* Group fixtures by date */}
              {(Object.entries(
                fixtures.reduce((acc, fixture) => {
                  const date = format(new Date(fixture.date), 'yyyy-MM-dd')
                  if (!acc[date]) acc[date] = []
                  acc[date].push(fixture)
                  return acc
                }, {} as Record<string, any[]>)
              ) as [string, any[]][]).map(([date, dayFixtures]) => (
                <div key={date} className="space-y-3">
                  <h4 className="font-medium text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(date), 'EEEE, MMMM d')}
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {dayFixtures.map((fixture: any) => (
                      <Link key={fixture.id} href={`/live/${fixture.id}`}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <Badge variant={
                                fixture.stage === 'final' ? 'destructive' :
                                fixture.stage === 'semifinal' ? 'secondary' :
                                'default'
                              }>
                                {fixture.stage === 'group' ? 'Group Stage' : fixture.stage}
                              </Badge>
                              {fixture.status === 'live' && (
                                <Badge variant="destructive" className="animate-pulse">
                                  LIVE
                                </Badge>
                              )}
                              {fixture.status === 'completed' && (
                                <Badge variant="secondary">
                                  FT
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1">
                                  <TeamLogo 
                                    src={fixture.teamA?.logo} 
                                    alt={fixture.teamA?.name || ''} 
                                    size="xs"
                                  />
                                  <span className="font-medium text-sm">{fixture.teamA?.name}</span>
                                </div>
                                {fixture.status !== 'upcoming' && (
                                  <span className="text-lg font-bold">{fixture.score?.teamA || 0}</span>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1">
                                  <TeamLogo 
                                    src={fixture.teamB?.logo} 
                                    alt={fixture.teamB?.name || ''} 
                                    size="xs"
                                  />
                                  <span className="font-medium text-sm">{fixture.teamB?.name}</span>
                                </div>
                                {fixture.status !== 'upcoming' && (
                                  <span className="text-lg font-bold">{fixture.score?.teamB || 0}</span>
                                )}
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                              <div className="flex items-center justify-between">
                                <span>{formatTimeInTimezone(fixture.date)}</span>
                                {fixture.venue && <span>{fixture.venue}</span>}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}