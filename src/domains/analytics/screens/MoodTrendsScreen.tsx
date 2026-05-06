import { ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme/useTheme'
import { useRuns } from '@/domains/runs/hooks/useRuns'
import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { computeMoodTrends } from '@/domains/analytics/utils'
import { StackedBarChart } from '@/domains/analytics/components/charts/StackedBarChart'
import { DetailHeader } from '../components/DetailHeader'
import { InsightSummaryCard } from '../components/InsightSummaryCard'
import { StatCells } from '../components/StatCells'
import { MoodLegend } from '../components/MoodLegend'

export function MoodTrendsScreen() {
  const { bg, mood } = useTheme()
  const insets = useSafeAreaInsets()
  const { timeRange } = useAnalyticsStore()
  const { data: runs = [] } = useRuns()
  const { data: moods = [] } = useGetAllMoods()

  const moodTrends = computeMoodTrends(runs, timeRange, moods)

  const bestWeek = moodTrends.weeklyData.reduce((best, week) => {
    const goodPct = week.counts['high-pleasant'] + week.counts['low-pleasant']
    const total = Object.values(week.counts).reduce((a, b) => a + b, 0)
    const pct = total > 0 ? (goodPct / total) * 100 : 0
    return pct > (best?.pct ?? -1) ? { week, pct } : best
  }, null as { week: (typeof moodTrends.weeklyData)[0]; pct: number } | null)

  const toughestWeek = moodTrends.weeklyData.reduce((tough, week) => {
    const toughPct = week.counts['high-challenging'] + week.counts['low-challenging']
    const total = Object.values(week.counts).reduce((a, b) => a + b, 0)
    const pct = total > 0 ? (toughPct / total) * 100 : 0
    return pct > (tough?.pct ?? -1) ? { week, pct } : tough
  }, null as { week: (typeof moodTrends.weeklyData)[0]; pct: number } | null)

  return (
    <View style={[styles.container, { backgroundColor: bg.base }]}>
      <DetailHeader title="Mood trends" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
      >
        <InsightSummaryCard
          headline={moodTrends.headline}
          body={moodTrends.sub}
          sentiment={moodTrends.sentiment}
        />

        <StackedBarChart weeklyData={moodTrends.weeklyData} compact={false} />

        <MoodLegend />

        <StatCells
          cells={[
            {
              label: 'BEST WEEK',
              value: bestWeek?.week.weekLabel ?? '—',
              sub: bestWeek ? `${Math.round(bestWeek.pct)}% good mood` : undefined,
              color: mood.highGood,
            },
            {
              label: 'TOUGHEST WEEK',
              value: toughestWeek?.week.weekLabel ?? '—',
              sub: toughestWeek ? `${Math.round(toughestWeek.pct)}% tough` : undefined,
              color: mood.highTough,
            },
            {
              label: 'AVG GOOD',
              value: `${moodTrends.pctGood ?? '—'}%`,
              sub: 'of all runs',
              color: mood.highGood,
            },
          ]}
        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
})
