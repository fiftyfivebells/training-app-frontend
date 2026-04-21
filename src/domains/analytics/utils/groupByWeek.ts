import type { RunResponse } from '@/domains/runs/api/runsApi'

import type { TimeRange, WeeklyBucket } from './types'

function getMondayOf(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/**
 * Filter runs to within the selected time range.
 * '4w' = last 28 days, '8w' = last 56 days, '12w' = last 84 days, 'all' = everything.
 */
export function filterRunsToRange(runs: RunResponse[], timeRange: TimeRange): RunResponse[] {
  if (timeRange === 'all') return runs
  const weeks = parseInt(timeRange, 10)
  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - weeks * 7)
  return runs.filter((r) => parseLocalDate(r.date) >= cutoff)
}

/**
 * Build weekly buckets (Monday–Sunday) for the selected time range.
 * The most recent bucket is always labelled 'Now'; prior buckets are 'W1', 'W2', …
 * For 'all', runs are required to determine the earliest week.
 */
export function getWeekBuckets(timeRange: TimeRange, runs: RunResponse[]): WeeklyBucket[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentMonday = getMondayOf(today)

  let startMonday: Date

  if (timeRange === 'all') {
    if (runs.length === 0) return []
    const earliest = runs.reduce<Date>((min, r) => {
      const d = parseLocalDate(r.date)
      return d < min ? d : min
    }, parseLocalDate(runs[0].date))
    startMonday = getMondayOf(earliest)
  } else {
    const weeks = parseInt(timeRange, 10)
    startMonday = new Date(currentMonday)
    startMonday.setDate(startMonday.getDate() - (weeks - 1) * 7)
  }

  const buckets: WeeklyBucket[] = []
  const cursor = new Date(startMonday)

  while (cursor <= currentMonday) {
    const weekStart = new Date(cursor)
    const weekEnd = new Date(cursor)
    weekEnd.setDate(weekEnd.getDate() + 6)
    buckets.push({ weekLabel: '', weekStart, weekEnd })
    cursor.setDate(cursor.getDate() + 7)
  }

  // Last bucket = 'Now', rest = 'W1', 'W2', ...
  buckets.forEach((b, i) => {
    b.weekLabel = i === buckets.length - 1 ? 'Now' : `W${i + 1}`
  })

  return buckets
}

/**
 * Return the index of the bucket containing the run's date, or -1 if none.
 */
export function assignRunToWeek(run: RunResponse, buckets: WeeklyBucket[]): number {
  const runDate = parseLocalDate(run.date)
  for (let i = 0; i < buckets.length; i++) {
    if (runDate >= buckets[i].weekStart && runDate <= buckets[i].weekEnd) return i
  }
  return -1
}
