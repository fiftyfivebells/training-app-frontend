import type { Mood, MoodCategoryKey } from '@/domains/moods/moods.types'
import type { RunResponse } from '@/domains/runs/api/runsApi'

import { filterRunsToRange } from './groupByWeek'
import type { Sentiment, TimeRange } from './types'

export type RunTypeBreakdown = {
  runType: string
  total: number
  goodRuns: number
  counts: Record<MoodCategoryKey, number>
  percentages: Record<MoodCategoryKey, number>
}

export type MoodByRunTypeResult = {
  byType: RunTypeBreakdown[]
  headline: string
  sub: string
  sentiment: Sentiment
  hasEnoughData: boolean
  pctGood: number
}

function emptyQuadrantCounts(): Record<MoodCategoryKey, number> {
  return {
    'high-pleasant': 0,
    'high-challenging': 0,
    'low-pleasant': 0,
    'low-challenging': 0,
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function computeMoodByRunType(
  runs: RunResponse[],
  timeRange: TimeRange,
  moods: Mood[],
): MoodByRunTypeResult {
  const moodMap = new Map(moods.map((m) => [m.id, m.quadrant] as [number, MoodCategoryKey]))
  const filtered = filterRunsToRange(runs, timeRange)

  const typeCounts = new Map<string, { counts: Record<MoodCategoryKey, number>; total: number }>()

  for (const run of filtered) {
    const runType = run.runType || 'unknown'
    if (!typeCounts.has(runType)) {
      typeCounts.set(runType, { counts: emptyQuadrantCounts(), total: 0 })
    }
    const entry = typeCounts.get(runType)!
    entry.total++
    const quadrant = moodMap.get(run.moodId)
    if (quadrant) entry.counts[quadrant]++
  }

  const totalRuns = filtered.length
  const numTypes = typeCounts.size

  if (totalRuns < 3 || numTypes < 2) {
    return {
      byType: [],
      headline: 'Not enough data yet',
      sub: '',
      sentiment: 'neutral',
      hasEnoughData: false,
      pctGood: 0,
    }
  }

  const byType: RunTypeBreakdown[] = Array.from(typeCounts.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .map(([runType, { counts, total }]) => ({
      runType,
      total,
      goodRuns: counts['high-pleasant'] + counts['low-pleasant'],
      counts,
      percentages: {
        'high-pleasant': total > 0 ? Math.round((counts['high-pleasant'] / total) * 100) : 0,
        'high-challenging': total > 0 ? Math.round((counts['high-challenging'] / total) * 100) : 0,
        'low-pleasant': total > 0 ? Math.round((counts['low-pleasant'] / total) * 100) : 0,
        'low-challenging': total > 0 ? Math.round((counts['low-challenging'] / total) * 100) : 0,
      },
    }))

  const bestType = byType.reduce((best, t) =>
    t.percentages['high-pleasant'] + t.percentages['low-pleasant'] >
    best.percentages['high-pleasant'] + best.percentages['low-pleasant']
      ? t
      : best,
  )
  const toughType = byType.reduce((tough, t) =>
    t.percentages['high-challenging'] + t.percentages['low-challenging'] >
    tough.percentages['high-challenging'] + tough.percentages['low-challenging']
      ? t
      : tough,
  )

  const bestGoodPct = bestType.percentages['high-pleasant'] + bestType.percentages['low-pleasant']

  let headline: string
  let sentiment: Sentiment

  if (bestType.runType === toughType.runType) {
    headline = `${capitalize(bestType.runType)} runs are your mixed bag`
    sentiment = 'neutral'
  } else if (bestGoodPct > 70) {
    headline = `${capitalize(bestType.runType)} runs feel great`
    sentiment = 'positive'
  } else {
    headline = `${capitalize(bestType.runType)} runs feel good · ${capitalize(toughType.runType)} skews tough`
    sentiment = 'neutral'
  }

  const totalGoodRuns = byType.reduce((sum, t) => sum + t.goodRuns, 0)
  const totalAllRuns = byType.reduce((sum, t) => sum + t.total, 0)
  const pctGood = totalAllRuns > 0 ? Math.round((totalGoodRuns / totalAllRuns) * 100) : 0

  return {
    byType,
    headline,
    sub: `Based on ${totalRuns} runs`,
    sentiment,
    hasEnoughData: true,
    pctGood,
  }
}
