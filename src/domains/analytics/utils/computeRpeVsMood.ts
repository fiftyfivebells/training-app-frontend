import type { Mood, MoodCategoryKey } from '@/domains/moods/moods.types'
import type { RunResponse } from '@/domains/runs/api/runsApi'

import { filterRunsToRange } from './groupByWeek'
import type { Sentiment, TimeRange } from './types'

export type RpeVsMoodGrid = {
  highRpeGood: number
  highRpeTough: number
  lowRpeGood: number
  lowRpeTough: number
}

export type RpeVsMoodResult = {
  grid: RpeVsMoodGrid
  total: number
  isWarning: boolean
  headline: string
  sub: string
  sentiment: Sentiment
  hasEnoughData: boolean
}

export function computeRpeVsMood(
  runs: RunResponse[],
  timeRange: TimeRange,
  moods: Mood[],
): RpeVsMoodResult {
  const moodMap = new Map(moods.map((m) => [m.id, m.quadrant] as [number, MoodCategoryKey]))
  const filtered = filterRunsToRange(runs, timeRange)
  const total = filtered.length

  const emptyGrid: RpeVsMoodGrid = { highRpeGood: 0, highRpeTough: 0, lowRpeGood: 0, lowRpeTough: 0 }

  if (total < 5) {
    return {
      grid: emptyGrid,
      total,
      isWarning: false,
      headline: 'Not enough data yet',
      sub: '',
      sentiment: 'neutral',
      hasEnoughData: false,
    }
  }

  const grid = { ...emptyGrid }

  for (const run of filtered) {
    const quadrant = moodMap.get(run.moodId)
    if (!quadrant) continue

    const isHighRpe = run.exertionRating >= 6
    const isGoodMood = quadrant === 'high-pleasant' || quadrant === 'low-pleasant'

    if (isHighRpe && isGoodMood) grid.highRpeGood++
    else if (isHighRpe && !isGoodMood) grid.highRpeTough++
    else if (!isHighRpe && isGoodMood) grid.lowRpeGood++
    else grid.lowRpeTough++
  }

  const gridTotal = grid.highRpeGood + grid.highRpeTough + grid.lowRpeGood + grid.lowRpeTough
  const isWarning = grid.lowRpeTough > 3 || (gridTotal > 0 && grid.lowRpeTough / gridTotal > 0.15)

  let headline: string
  let sub: string
  let sentiment: Sentiment

  if (isWarning) {
    headline = 'Watch the low RPE · tough'
    sub = `${grid.lowRpeTough} easy ${grid.lowRpeTough === 1 ? 'run' : 'runs'} felt hard`
    sentiment = 'warning'
  } else {
    headline = 'RPE and mood are balanced'
    const gridTotal = grid.highRpeGood + grid.highRpeTough + grid.lowRpeGood + grid.lowRpeTough
    const goodPct = gridTotal > 0 ? (grid.highRpeGood + grid.lowRpeGood) / gridTotal : 0
    sub = 'Looking good'
    sentiment = goodPct > 0.6 ? 'positive' : 'neutral'
  }

  return { grid, total, isWarning, headline, sub, sentiment, hasEnoughData: true }
}
