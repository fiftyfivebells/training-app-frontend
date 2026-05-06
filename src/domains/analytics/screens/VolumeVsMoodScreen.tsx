import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme/useTheme'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { useRuns } from '@/domains/runs/hooks/useRuns'
import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import { computeVolumeVsMood } from '@/domains/analytics/utils'
import { DetailHeader } from '../components/DetailHeader'
import { InsightSummaryCard } from '../components/InsightSummaryCard'
import { StatCells } from '../components/StatCells'
import { DualAxisChart } from '../components/charts/DualAxisChart'

export function VolumeVsMoodScreen() {
  const { bg, text, mood, accent } = useTheme()
  const insets = useSafeAreaInsets()
  const { timeRange } = useAnalyticsStore()
  const { data: runs = [] } = useRuns()
  const { data: moods = [] } = useGetAllMoods()

  const volumeVsMood = computeVolumeVsMood(runs, timeRange, moods)

  const bestMoodWeek = [...volumeVsMood.weeklyData].sort(
    (a, b) => b.goodMoodPct - a.goodMoodPct,
  )[0]
  const highestVolWeek = [...volumeVsMood.weeklyData].sort(
    (a, b) => b.distanceKm - a.distanceKm,
  )[0]

  const bestMoodKm = bestMoodWeek ? bestMoodWeek.distanceKm : undefined
  const highestVolPct = highestVolWeek ? highestVolWeek.goodMoodPct : undefined

  return (
    <View style={[styles.container, { backgroundColor: bg.base }]}>
      <DetailHeader title="Volume vs mood" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
      >
        <InsightSummaryCard
          headline={volumeVsMood.headline}
          body={volumeVsMood.sub}
          sentiment={volumeVsMood.sentiment}
        />

        {/* Chart legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendBarSwatch,
                { backgroundColor: mood.highGood },
              ]}
            />
            <Text style={[styles.legendLabel, { color: text.tertiary }]}>
              VOLUME
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendLineSwatch,
                { backgroundColor: mood.highGood },
              ]}
            />
            <Text style={[styles.legendLabel, { color: text.tertiary }]}>
              % GOOD MOOD
            </Text>
          </View>
        </View>

        <DualAxisChart weeklyData={volumeVsMood.weeklyData} compact={false} />

        <StatCells
          cells={[
            {
              label: 'AVG WEEKLY',
              value: String(volumeVsMood.avgKm),
              unit: 'km',
              sub: 'across period',
              color: text.primary,
            },
            {
              label: 'BEST MOOD WK',
              value: bestMoodWeek?.weekLabel ?? '—',
              sub: bestMoodKm !== undefined ? `${bestMoodKm} km that week` : undefined,
              color: mood.highGood,
            },
            {
              label: 'HIGHEST VOL',
              value: highestVolWeek?.weekLabel ?? '—',
              sub: highestVolPct !== undefined ? `${highestVolPct}% good mood` : undefined,
              color: accent.default,
            },
          ]}
        />

        <Text style={[styles.footnote, { color: text.tertiary }]}>
          {'Based on '}
          {volumeVsMood.weeklyData.length}
          {' weeks of data.\nPatterns strengthen with more runs.'}
        </Text>
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
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendBarSwatch: {
    width: 20,
    height: 8,
    borderRadius: 2,
    opacity: 0.4,
  },
  legendLineSwatch: {
    width: 20,
    height: 2,
    borderRadius: 1,
  },
  legendLabel: {
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.12 * 9,
    textTransform: 'uppercase',
  },
  footnote: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 12 * 1.5,
    marginTop: 8,
  },
})
