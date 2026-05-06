import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/theme/useTheme'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { useRuns } from '@/domains/runs/hooks/useRuns'
import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import { Dateline, DoubleRule } from '@/components/ui'
import { RangePills } from '../components/RangePills'
import { StackedBarChart } from '@/domains/analytics/components/charts/StackedBarChart'
import { HorizontalStackedBars } from '@/domains/analytics/components/charts/HorizontalStackedBars'
import { QuadrantGrid } from '@/domains/analytics/components/charts/QuadrantGrid'
import { DualAxisChart } from '@/domains/analytics/components/charts/DualAxisChart'
import {
  computeMoodTrends,
  computeMoodByRunType,
  computeRpeVsMood,
  computeVolumeVsMood,
} from '@/domains/analytics/utils'

export function AnalyticsScreen() {
  const { bg, text, rule, accent, mood } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { timeRange, setTimeRange } = useAnalyticsStore()
  const { data: runs = [], isLoading: runsLoading } = useRuns()
  const { data: moods = [], isLoading: moodsLoading } = useGetAllMoods()

  if (runsLoading || moodsLoading) {
    return <View style={[styles.container, { backgroundColor: bg.base }]} />
  }

  const moodTrends = runs.length >= 5 ? computeMoodTrends(runs, timeRange, moods) : null
  const moodByType = runs.length >= 5 ? computeMoodByRunType(runs, timeRange, moods) : null
  const rpeVsMood = runs.length >= 5 ? computeRpeVsMood(runs, timeRange, moods) : null
  const volumeVsMood = runs.length >= 5 ? computeVolumeVsMood(runs, timeRange, moods) : null

  const rows = moodTrends && moodByType && rpeVsMood && volumeVsMood ? [
    {
      label: 'MOOD TRENDS',
      headline: moodTrends.headline,
      stat: `${moodTrends.pctGood}%`,
      spineColor: mood.highGood,
      chart: <StackedBarChart weeklyData={moodTrends.weeklyData} compact />,
      onPress: () => router.push('/analytics/mood-trends'),
    },
    {
      label: 'MOOD BY RUN TYPE',
      headline: moodByType.headline,
      stat: `${moodByType.pctGood}%`,
      spineColor: mood.lowGood,
      chart: <HorizontalStackedBars byType={moodByType.byType} compact />,
      onPress: () => router.push('/analytics/mood-by-run-type'),
    },
    {
      label: 'RPE VS MOOD',
      headline: rpeVsMood.headline,
      stat: String(rpeVsMood.total),
      spineColor: mood.highTough,
      chart: <QuadrantGrid grid={rpeVsMood.grid} isWarning={rpeVsMood.isWarning} compact />,
      onPress: () => router.push('/analytics/rpe-vs-mood'),
    },
    {
      label: 'VOLUME VS MOOD',
      headline: volumeVsMood.headline,
      stat: `${volumeVsMood.avgKm} km`,
      spineColor: accent.default,
      chart: <DualAxisChart weeklyData={volumeVsMood.weeklyData} compact />,
      onPress: () => router.push('/analytics/volume-vs-mood'),
    },
  ] : null

  return (
    <View style={[styles.container, { backgroundColor: bg.base }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <Dateline>PATTERNS</Dateline>
          <RangePills value={timeRange} onChange={setTimeRange} />
        </View>
        <Text style={[styles.title, { color: text.primary, fontVariationSettings: '"opsz" 144' } as any]}>Analytics.</Text>
        <DoubleRule />
      </View>

      {rows ? (
        <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          {rows.map((row) => (
            <TouchableOpacity
              key={row.label}
              activeOpacity={0.7}
              onPress={row.onPress}
              style={[styles.row, { borderBottomColor: rule.subtle }]}
            >
              <View style={[styles.spine, { backgroundColor: row.spineColor }]} />
              <View style={styles.rowContent}>
                <View style={styles.rowText}>
                  <Dateline style={styles.rowLabel}>{row.label}</Dateline>
                  <Text style={[styles.rowHeadline, { color: text.primary }]}>{row.headline}</Text>
                  <Text style={[styles.rowStat, { color: row.spineColor }]}>{row.stat}</Text>
                </View>
                <View style={styles.chartThumbnail}>{row.chart}</View>
                <Ionicons name="chevron-forward" size={12} color={text.tertiary} style={styles.chevron} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: text.secondary }]}>
            Log more runs to start seeing patterns in your training.
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 32,
    letterSpacing: -0.02 * 32,
    lineHeight: 32,
    marginBottom: 10,
  },
  scrollArea: {
    flex: 1,
  },
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
  },
  spine: {
    width: 3,
    flexShrink: 0,
  },
  rowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    marginBottom: 3,
  },
  rowHeadline: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 13,
    lineHeight: 13 * 1.3,
    letterSpacing: -0.01 * 13,
  },
  rowStat: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 18,
    letterSpacing: -0.02 * 18,
    lineHeight: 18,
    fontVariant: ['tabular-nums', 'lining-nums'],
    marginTop: 4,
  },
  chartThumbnail: {
    width: 72,
    flexShrink: 0,
  },
  chevron: {
    flexShrink: 0,
  },
})
