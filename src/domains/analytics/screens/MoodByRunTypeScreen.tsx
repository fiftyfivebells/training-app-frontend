import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme/useTheme'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { useRuns } from '@/domains/runs/hooks/useRuns'
import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import { computeMoodByRunType } from '@/domains/analytics/utils'
import { Dateline } from '@/components/ui'
import { DetailHeader } from '../components/DetailHeader'
import { InsightSummaryCard } from '../components/InsightSummaryCard'
import { HorizontalStackedBars } from '../components/charts/HorizontalStackedBars'
import { MoodLegend } from '../components/MoodLegend'
import { StatCells } from '../components/StatCells'

export function MoodByRunTypeScreen() {
  const { bg, text, rule, mood } = useTheme()
  const insets = useSafeAreaInsets()
  const { timeRange } = useAnalyticsStore()
  const { data: runs = [] } = useRuns()
  const { data: moods = [] } = useGetAllMoods()

  const moodByType = computeMoodByRunType(runs, timeRange, moods)

  const totalRuns = moodByType.byType.reduce((sum, t) => sum + t.total, 0)

  const bestType = moodByType.byType.length > 0
    ? moodByType.byType.reduce((best, t) =>
        t.percentages['high-pleasant'] + t.percentages['low-pleasant'] >
        best.percentages['high-pleasant'] + best.percentages['low-pleasant']
          ? t
          : best
      )
    : null

  const toughestType = moodByType.byType.length > 0
    ? moodByType.byType.reduce((tough, t) =>
        t.percentages['high-challenging'] + t.percentages['low-challenging'] >
        tough.percentages['high-challenging'] + tough.percentages['low-challenging']
          ? t
          : tough
      )
    : null

  const bestTypePct = bestType
    ? bestType.percentages['high-pleasant'] + bestType.percentages['low-pleasant']
    : null

  const toughestTypePct = toughestType
    ? toughestType.percentages['high-challenging'] + toughestType.percentages['low-challenging']
    : null

  return (
    <View style={[styles.container, { backgroundColor: bg.base }]}>
      <DetailHeader title="Mood by run type" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={styles.topSection}>
          <InsightSummaryCard
            headline={moodByType.headline}
            body={moodByType.sub}
            sentiment={moodByType.sentiment}
          />
          <HorizontalStackedBars byType={moodByType.byType} compact={false} />
          <MoodLegend />
        </View>

        <StatCells
          cells={[
            {
              label: 'BEST TYPE',
              value: bestType?.runType ?? '—',
              sub: bestTypePct != null ? `${bestTypePct}% good mood` : undefined,
              color: mood.highGood,
            },
            {
              label: 'TOUGHEST',
              value: toughestType?.runType ?? '—',
              sub: toughestTypePct != null ? `${toughestTypePct}% tough` : undefined,
              color: mood.highTough,
            },
            {
              label: 'TOTAL RUNS',
              value: String(totalRuns),
              sub: 'this period',
              color: text.primary,
            },
          ]}
        />

        <View style={styles.breakdownHeader}>
          <Dateline style={{ marginBottom: 8 }}>BREAKDOWN</Dateline>
        </View>
        {moodByType.byType.map((t) => (
          <View
            key={t.runType}
            style={[styles.breakdownRow, { borderBottomColor: rule.subtle }]}
          >
            <View style={styles.breakdownLeft}>
              <Text style={[styles.typeLabel, { color: text.primary }]}>{t.runType}</Text>
              <Text style={[styles.runCount, { color: text.tertiary }]}>{t.total} runs</Text>
            </View>
            <View style={styles.breakdownChart}>
              <HorizontalStackedBars byType={[t]} compact />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    padding: 20,
  },
  breakdownHeader: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  breakdownLeft: {
    width: 72,
    flexShrink: 0,
  },
  typeLabel: {
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '600',
  },
  runCount: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 11,
  },
  breakdownChart: {
    flex: 1,
  },
})
