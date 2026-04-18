import type { RunResponse } from '../api/runsApi'

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function computeWeeklyStats(
  runs: RunResponse[],
  activeBlockId: string | undefined,
): { weeklyDistanceMeters: number; streak: number; blockRunCount: number } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Monday of current ISO week
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  const monday = toDateString(startOfWeek)
  const sunday = toDateString(endOfWeek)

  // Weekly distance — ISO string comparison is safe for YYYY-MM-DD
  const weeklyDistanceMeters = runs
    .filter((r) => r.date >= monday && r.date <= sunday)
    .reduce((sum, r) => sum + r.distanceMeters, 0)

  // Streak: consecutive calendar days ending today with at least one run
  const runDates = new Set(runs.map((r) => r.date))
  let streak = 0
  const cursor = new Date(today)
  while (runDates.has(toDateString(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }

  // Block runs
  const blockRunCount = activeBlockId
    ? runs.filter((r) => r.blockId === activeBlockId).length
    : 0

  return { weeklyDistanceMeters, streak, blockRunCount }
}
