import { METERS_PER_KM, METERS_PER_MILE } from './distance'

export function formatPace(meters: number, seconds: number, unit: 'km' | 'mi'): string {
  if (meters === 0 || seconds === 0) return '--:--'
  const distanceInUnit = unit === 'km' ? meters / METERS_PER_KM : meters / METERS_PER_MILE
  const totalSecondsPerUnit = Math.round(seconds / distanceInUnit)
  const m = Math.floor(totalSecondsPerUnit / 60)
  const s = totalSecondsPerUnit % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function generateRunTitle(runType?: string, moodLabel?: string): string {
  if (runType && moodLabel) return `${runType} · ${moodLabel}`
  if (runType) return `${runType} run`
  if (moodLabel) return `Run · ${moodLabel}`
  return 'Run'
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatRunDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number)
  const runDate = new Date(year, month - 1, day)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const runTime = runDate.getTime()
  if (runTime === today.getTime()) return 'Today'
  if (runTime === yesterday.getTime()) return 'Yesterday'

  // Monday of current ISO week
  const startOfWeek = new Date(today)
  const daysFromMonday = (today.getDay() + 6) % 7
  startOfWeek.setDate(today.getDate() - daysFromMonday)

  if (runDate >= startOfWeek) return WEEKDAYS[runDate.getDay()]

  return `${MONTHS[runDate.getMonth()]} ${runDate.getDate()}`
}
