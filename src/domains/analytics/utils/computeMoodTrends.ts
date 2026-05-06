import type { Mood, MoodCategoryKey } from '@/domains/moods/moods.types'
import type { RunResponse } from '@/domains/runs/api/runsApi'

import { assignRunToWeek, getWeekBuckets } from './groupByWeek'
import type { Sentiment, TimeRange } from './types'

export type MoodTrendsResult = {
  weeklyData: { weekLabel: string; counts: Record<MoodCategoryKey, number> }[]
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

export function computeMoodTrends(
  runs: RunResponse[],
  timeRange: TimeRange,
  moods: Mood[],
): MoodTrendsResult {
  const moodMap = new Map(moods.map((m) => [m.id, m.quadrant] as [number, MoodCategoryKey]))
  const buckets = getWeekBuckets(timeRange, runs)

  if (buckets.length === 0) {
    return { weeklyData: [], headline: 'Not enough data yet', sub: '', sentiment: 'neutral', hasEnoughData: false, pctGood: 0 }
  }

  const weeklyData = buckets.map((b) => ({ weekLabel: b.weekLabel, counts: emptyQuadrantCounts() }))

  for (const run of runs) {
    const idx = assignRunToWeek(run, buckets)
    if (idx === -1) continue
    const quadrant = moodMap.get(run.moodId)
    if (!quadrant) continue
    weeklyData[idx].counts[quadrant]++
  }

  const weeksWithRuns = weeklyData.filter((w) => Object.values(w.counts).some((c) => c > 0))

  if (weeksWithRuns.length < 2) {
    return { weeklyData, headline: 'Not enough data yet', sub: '', sentiment: 'neutral', hasEnoughData: false, pctGood: 0 }
  }

  // Evaluate last 3 populated weeks for headline
  const last3 = weeksWithRuns.slice(-3)
  const totalInLast3 = last3.reduce(
    (sum, w) => sum + Object.values(w.counts).reduce((a, b) => a + b, 0),
    0,
  )
  const goodInLast3 = last3.reduce(
    (sum, w) => sum + w.counts['high-pleasant'] + w.counts['low-pleasant'],
    0,
  )
  const goodPct = totalInLast3 > 0 ? goodInLast3 / totalInLast3 : 0

  let headline: string
  let sub: string
  let sentiment: Sentiment

  if (goodPct > 0.6) {
    headline = 'Trending positive ↑'
    sentiment = 'positive'

    // Sub: % change in high-pleasant vs prior period
    const prior3 = weeksWithRuns.slice(-6, -3)
    if (prior3.length >= 1) {
      const priorHighGood = prior3.reduce((s, w) => s + w.counts['high-pleasant'], 0)
      const recentHighGood = last3.reduce((s, w) => s + w.counts['high-pleasant'], 0)
      if (priorHighGood > 0) {
        const pctChange = Math.round(((recentHighGood - priorHighGood) / priorHighGood) * 100)
        const sign = pctChange >= 0 ? '+' : ''
        sub = `High energy · good ${sign}${pctChange}%`
      } else {
        sub = `Based on your last ${weeksWithRuns.length} weeks`
      }
    } else {
      sub = `Based on your last ${weeksWithRuns.length} weeks`
    }
  } else {
    const toughCounts = last3.map((w) => w.counts['high-challenging'] + w.counts['low-challenging'])
    const toughIncreasing =
      toughCounts.length >= 2 &&
      toughCounts.every((val, i) => i === 0 || val > toughCounts[i - 1])

    if (toughIncreasing) {
      headline = 'Watch your energy ↓'
      sentiment = 'warning'
    } else {
      headline = 'Mixed mood picture'
      sentiment = 'neutral'
    }
    sub = `Based on your last ${weeksWithRuns.length} weeks`
  }

  const totalAllRuns = weeklyData.reduce(
    (sum, w) => sum + Object.values(w.counts).reduce((a, b) => a + b, 0),
    0,
  )
  const goodAllRuns = weeklyData.reduce(
    (sum, w) => sum + w.counts['high-pleasant'] + w.counts['low-pleasant'],
    0,
  )
  const pctGood = totalAllRuns > 0 ? Math.round((goodAllRuns / totalAllRuns) * 100) : 0

  return { weeklyData, headline, sub, sentiment, hasEnoughData: true, pctGood }
}
