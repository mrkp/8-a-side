import { format, parseISO } from 'date-fns'
import { toZonedTime, formatInTimeZone } from 'date-fns-tz'

// Default timezone for the tournament (Trinidad and Tobago)
const DEFAULT_TIMEZONE = 'America/Port_of_Spain'

/**
 * Format a date to the tournament's local timezone
 * @param date - The date to format (can be string or Date)
 * @param formatString - The format string (default: 'PPP p')
 * @param timezone - The timezone to use (default: Trinidad)
 * @returns Formatted date string
 */
export function formatInTimezone(
  date: string | Date, 
  formatString: string = 'PPP p',
  timezone: string = DEFAULT_TIMEZONE
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return formatInTimeZone(dateObj, timezone, formatString)
}

/**
 * Format time only in the tournament's timezone
 * @param date - The date to format
 * @param timezone - The timezone to use
 * @returns Time string (e.g., "5:40 PM")
 */
export function formatTimeInTimezone(
  date: string | Date,
  timezone: string = DEFAULT_TIMEZONE
): string {
  return formatInTimezone(date, 'h:mm a', timezone)
}

/**
 * Format date only in the tournament's timezone
 * @param date - The date to format
 * @param timezone - The timezone to use
 * @returns Date string (e.g., "Sep 2, 2025")
 */
export function formatDateInTimezone(
  date: string | Date,
  timezone: string = DEFAULT_TIMEZONE
): string {
  return formatInTimezone(date, 'MMM d, yyyy', timezone)
}

/**
 * Get day of week in the tournament's timezone
 * @param date - The date to format
 * @param timezone - The timezone to use
 * @returns Day string (e.g., "Tuesday")
 */
export function getDayInTimezone(
  date: string | Date,
  timezone: string = DEFAULT_TIMEZONE
): string {
  return formatInTimezone(date, 'EEEE', timezone)
}

/**
 * Format fixture date/time for display
 * @param date - The fixture date
 * @returns Formatted string for fixture display
 */
export function formatFixtureDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  // Format as "Tuesday, Sep 2 @ 5:40 PM"
  return formatInTimeZone(dateObj, DEFAULT_TIMEZONE, "EEEE, MMM d '@' h:mm a")
}