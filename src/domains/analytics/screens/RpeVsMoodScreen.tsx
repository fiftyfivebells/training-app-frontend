import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme/useTheme'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { useRuns } from '@/domains/runs/hooks/useRuns'
import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import { computeRpeVsMood } from '@/domains/analytics/utils'
import { Dateline } from '@/components/ui'
import { DetailHeader } from '../components/DetailHeader'
import { InsightSummaryCard } from '../components/InsightSummaryCard'
import { StatCells } from '../components/StatCells'
import { QuadrantGrid } from '../components/charts/QuadrantGrid'

export function RpeVsMoodScreen() {
  const { bg, text, rule, mood } = useTheme()
  const insets = useSafeAreaInsets()
  const { timeRange } = useAnalyticsStore()
  const { data: runs = [] } = useRuns()
  const { data: moods = [] } = useGetAllMoods()

  const rpeVsMood = computeRpeVsMood(runs, timeRange, moods)

  const totalRuns = Object.values(rpeVsMood.grid).reduce((s, v) => s + v, 0)
  const highEffortRuns = rpeVsMood.grid.highRpeGood + rpeVsMood.grid.highRpeTough
  const goodMoodRuns = rpeVsMood.grid.highRpeGood + rpeVsMood.grid.lowRpeGood

  const explanations = [
    { label: 'HIGH · GOOD', color: mood.highGood, text: 'Working hard and thriving. A great sign.' },
    { label: 'HIGH · TOUGH', color: mood.highTough, text: 'Pushed through difficulty. Normal occasionally.' },
    { label: 'LOW · GOOD', color: mood.lowGood, text: 'Aerobic base in shape — easy runs feel easy.' },
    { label: 'LOW · TOUGH', color: mood.lowTough, text: 'Easy runs feeling hard. Often signals fatigue.' },
  ]

  return (
    <View style={[styles.container, { backgroundColor: bg.base }]}>
      <DetailHeader title="RPE vs mood" />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
      >
        <InsightSummaryCard
          headline={rpeVsMood.headline}
          body={rpeVsMood.sub}
          sentiment={rpeVsMood.sentiment}
        />

        <View style={styles.gridWrapper}>
          <QuadrantGrid grid={rpeVsMood.grid} isWarning={rpeVsMood.isWarning} compact={false} />
        </View>

        <StatCells
          cells={[
            { label: 'TOTAL RUNS', value: String(totalRuns), sub: 'this period', color: text.primary },
            { label: 'HIGH EFFORT', value: String(highEffortRuns), sub: 'high RPE runs', color: mood.highTough },
            { label: 'GOOD MOOD', value: String(goodMoodRuns), sub: 'felt good', color: mood.highGood },
          ]}
        />

        <Dateline style={{ marginBottom: 10 }}>HOW TO READ THIS</Dateline>

        {explanations.map((e, i) => (
          <View
            key={i}
            style={[styles.explanationRow, { borderBottomColor: rule.subtle }]}
          >
            <View style={[styles.spine, { backgroundColor: e.color }]} />
            <View style={styles.explanationBody}>
              <Text style={[styles.explanationLabel, { color: e.color }]}>{e.label}</Text>
              <Text style={[styles.explanationText, { color: text.secondary }]}>{e.text}</Text>
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
  scrollContent: {
    padding: 20,
  },
  gridWrapper: {
    marginBottom: 16,
  },
  explanationRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  spine: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
    flexShrink: 0,
  },
  explanationBody: {
    flex: 1,
  },
  explanationLabel: {
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.12 * 9,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  explanationText: {
    fontFamily: 'Manrope',
    fontSize: 11,
    lineHeight: 11 * 1.4,
  },
})
