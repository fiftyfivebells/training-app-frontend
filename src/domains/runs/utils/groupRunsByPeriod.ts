import type { RunResponse } from '../api/runsApi'

export type PeriodType = 'current-week' | 'week' | 'month'

export type Period = {
  key: string
  label: string
  type: PeriodType
  runs: RunResponse[]
  totalMeters: number
}

const FULL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function groupRunsByPeriod(runs: RunResponse[], today = new Date()): Period[] {
  const base = new Date(today)
  base.setHours(0, 0, 0, 0)

  const daysFromMonday = (base.getDay() + 6) % 7
  const thisMonday = new Date(base)
  thisMonday.setDate(base.getDate() - daysFromMonday)

  const lastMonday = new Date(thisMonday)
  lastMonday.setDate(thisMonday.getDate() - 7)

  const sorted = [...runs].sort((a, b) => b.date.localeCompare(a.date))
  const map = new Map<string, Period>()

  for (const run of sorted) {
    const runDate = parseDate(run.date)
    let key: string
    let label: string
    let type: PeriodType

    if (runDate >= thisMonday) {
      key = 'current-week'
      label = 'This week'
      type = 'current-week'
    } else if (runDate >= lastMonday) {
      key = 'last-week'
      label = 'Last week'
      type = 'week'
    } else {
      const yr = runDate.getFullYear()
      const mo = runDate.getMonth()
      key = `${yr}-${String(mo + 1).padStart(2, '0')}`
      label = `${FULL_MONTHS[mo]} ${yr}`
      type = 'month'
    }

    if (!map.has(key)) {
      map.set(key, { key, label, type, runs: [], totalMeters: 0 })
    }
    const period = map.get(key)!
    period.runs.push(run)
    period.totalMeters += run.distanceMeters
  }

  return Array.from(map.values())
}
