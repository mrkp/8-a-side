import { NextResponse } from "next/server"
import { formatInTimeZone } from 'date-fns-tz'

export async function GET() {
  const testDate = '2025-09-02T17:40:00-04:00'
  const utcDate = new Date(testDate)
  
  return NextResponse.json({
    originalDate: testDate,
    utcTime: utcDate.toISOString(),
    astTime: formatInTimeZone(utcDate, 'America/Port_of_Spain', 'yyyy-MM-dd HH:mm:ss zzz'),
    displayTime: formatInTimeZone(utcDate, 'America/Port_of_Spain', 'EEEE, MMM d @ h:mm a'),
    note: "Tournament times are in Atlantic Standard Time (AST/UTC-4)"
  })
}