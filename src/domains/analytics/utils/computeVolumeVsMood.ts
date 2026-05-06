import type { Mood, MoodCategoryKey } from '@/domains/moods/moods.types'
import type { RunResponse } from '@/domains/runs/api/runsApi'

import { assignRunToWeek, getWeekBuckets } from './groupByWeek'
import type { Sentiment, TimeRange } from './types'

export type VolumeWeekData = {
  weekLabel: string
  distanceKm: number
  goodMoodPct: number
  runCount: number
}

export type VolumeVsMoodResult = {
  weeklyData: VolumeWeekData[]
  correlation: number
  headline: string
  sub: string
  sentiment: Sentiment
  hasEnoughData: boolean
  avgKm: number
}

function pearsonCorrelation(xs: number[], ys: number[]): number {
  const n = xs.length
  if (n < 2) return 0

  const meanX = xs.reduce((a, b) => a + b, 0) / n
  const meanY = ys.reduce((a, b) => a + b, 0) / n

  const num = xs.reduce((sum, x, i) => sum + (x - meanX) * (ys[i] - meanY), 0)
  const denomX = Math.sqrt(xs.reduce((sum, x) => sum + (x - meanX) ** 2, 0))
  const denomY = Math.sqrt(ys.reduce((sum, y) => sum + (y - meanY) ** 2, 0))
  const denom = denomX * denomY

  return denom === 0 ? 0 : num / denom
}

export function computeVolumeVsMood(
  runs: RunResponse[],
  timeRange: TimeRange,
  moods: Mood[],
): VolumeVsMoodResult {
  const moodMap = new Map(moods.map((m) => [m.id, m.quadrant] as [number, MoodCategoryKey]))
  const buckets = getWeekBuckets(timeRange, runs)

  if (buckets.length === 0) {
    return {
      weeklyData: [],
      correlation: 0,
      headline: 'Not enough data yet',
      sub: '',
      sentiment: 'neutral',
      hasEnoughData: false,
      avgKm: 0,
    }
  }

  const bucketData = buckets.map((b) => ({
    weekLabel: b.weekLabel,
    distanceMeters: 0,
    goodRuns: 0,
    totalRuns: 0,
  }))

  for (const run of runs) {
    const idx = assignRunToWeek(run, buckets)
    if (idx === -1) continue
    bucketData[idx].distanceMeters += run.distanceMeters
    const quadrant = moodMap.get(run.moodId)
    if (quadrant) {
      bucketData[idx].totalRuns++
      if (quadrant === 'high-pleasant' || quadrant === 'low-pleasant') {
        bucketData[idx].goodRuns++
      }
    }
  }

  const weeklyData: VolumeWeekData[] = bucketData.map((b) => ({
    weekLabel: b.weekLabel,
    distanceKm: Math.round((b.distanceMeters / 1000) * 10) / 10,
    goodMoodPct: b.totalRuns > 0 ? Math.round((b.goodRuns / b.totalRuns) * 100) : 0,
    runCount: b.totalRuns,
  }))

  const populated = weeklyData.filter((w) => w.runCount > 0)

  if (populated.length < 4) {
    return {
      weeklyData,
      correlation: 0,
      headline: 'Not enough data yet',
      sub: `Based on your last ${populated.length} ${populated.length === 1 ? 'week' : 'weeks'}`,
      sentiment: 'neutral',
      hasEnoughData: false,
      avgKm: populated.length > 0
        ? Math.round(populated.reduce((sum, w) => sum + w.distanceKm, 0) / populated.length)
        : 0,
    }
  }

  const correlation = pearsonCorrelation(
    populated.map((w) => w.distanceKm),
    populated.map((w) => w.goodMoodPct),
  )

  let headline: string
  let sentiment: Sentiment

  if (correlation > 0.3) {
    headline = 'More km, better mood'
    sentiment = 'positive'
  } else if (correlation < -0.3) {
    headline = 'High volume weeks, tougher mood'
    sentiment = 'warning'
  } else {
    headline = 'No clear volume-mood pattern yet'
    sentiment = 'neutral'
  }

  const avgKm = Math.round(populated.reduce((sum, w) => sum + w.distanceKm, 0) / populated.length)

  return {
    weeklyData,
    correlation: Math.round(correlation * 100) / 100,
    headline,
    sub: `Based on your last ${populated.length} weeks`,
    sentiment,
    hasEnoughData: true,
    avgKm,
  }
}
