import type { Mood, MoodCategoryKey } from '@/domains/moods/moods.types'
import type { RunResponse } from '@/domains/runs/api/runsApi'

export type QuadrantBreakdown = {
  key: MoodCategoryKey
  count: number
  percentage: number
}

export type MoodAnalytics = {
  totalRuns: number
  breakdown: QuadrantBreakdown[]
  topQuadrant: MoodCategoryKey | null
}

const QUADRANT_ORDER: MoodCategoryKey[] = [
  'high-challenging',
  'high-pleasant',
  'low-challenging',
  'low-pleasant',
]

export function computeMoodAnalytics(runs: RunResponse[], moods: Mood[]): MoodAnalytics {
  const counts: Record<MoodCategoryKey, number> = {
    'high-challenging': 0,
    'high-pleasant': 0,
    'low-challenging': 0,
    'low-pleasant': 0,
  }

  for (const run of runs) {
    const mood = moods.find((m) => m.id === run.moodId)
    if (!mood) continue
    counts[mood.quadrant]++
  }

  const totalRuns = QUADRANT_ORDER.reduce((sum, key) => sum + counts[key], 0)

  const breakdown: QuadrantBreakdown[] = QUADRANT_ORDER.map((key) => ({
    key,
    count: counts[key],
    percentage: totalRuns === 0 ? 0 : Math.round((counts[key] / totalRuns) * 100),
  }))

  const topQuadrant: MoodCategoryKey | null =
    totalRuns === 0
      ? null
      : breakdown.reduce((best, row) => (row.count > best.count ? row : best)).key

  return { totalRuns, breakdown, topQuadrant }
}
