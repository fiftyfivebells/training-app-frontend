import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/theme/useTheme'
import { useAnalyticsStore } from '@/store/analyticsStore'
import { useRuns } from '@/domains/runs/hooks/useRuns'
import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import { InsightSummaryCard } from '@/domains/analytics/components/InsightSummaryCard'
import { DualAxisChart } from '@/domains/analytics/components/charts/DualAxisChart'
import { computeVolumeVsMood } from '@/domains/analytics/utils'
import { Dateline } from '@/components/ui'

const RANGE_LABELS = {
  '4w': '4w',
  '8w': '8w',
  '12w': '12w',
  all: 'All',
}

export function VolumeVsMoodScreen() {
  const { bg, text, rule, accent } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { timeRange, setTimeRange } = useAnalyticsStore()
  const { data: runs = [] } = useRuns()
  const { data: moods = [] } = useGetAllMoods()

  const volumeVsMood = computeVolumeVsMood(runs, timeRange, moods)

  const handleRangePress = () => {
    const options = ['Cancel', 'Last 4 weeks', 'Last 8 weeks', 'Last 12 weeks', 'All time']
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 0 },
        (buttonIndex) => {
          if (buttonIndex === 1) setTimeRange('4w')
          if (buttonIndex === 2) setTimeRange('8w')
          if (buttonIndex === 3) setTimeRange('12w')
          if (buttonIndex === 4) setTimeRange('all')
        }
      )
    } else {
      Alert.alert('Select range', '', [
        { text: 'Last 4 weeks', onPress: () => setTimeRange('4w') },
        { text: 'Last 8 weeks', onPress: () => setTimeRange('8w') },
        { text: 'Last 12 weeks', onPress: () => setTimeRange('12w') },
        { text: 'All time', onPress: () => setTimeRange('all') },
        { text: 'Cancel', style: 'cancel' },
      ])
    }
  }

  const avgKm = volumeVsMood.weeklyData.length > 0
    ? volumeVsMood.weeklyData.reduce((acc, w) => acc + w.distanceKm, 0) / volumeVsMood.weeklyData.length
    : 0

  const bestMoodWeek = volumeVsMood.weeklyData.reduce((best, week) => {
    return (week.goodMoodPct > (best?.goodMoodPct ?? -1)) ? week : best
  }, null as any)

  const highestVolumeWeek = volumeVsMood.weeklyData.reduce((highest, week) => {
    return (week.distanceKm > (highest?.distanceKm ?? -1)) ? week : highest
  }, null as any)

  return (
    <View style={[styles.container, { backgroundColor: bg.base }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerLeft}>
          <Ionicons name="arrow-back" size={24} color={text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: text.primary }]}>Volume vs mood</Text>
        <Pressable
          onPress={handleRangePress}
          style={[
            styles.rangePicker,
            { backgroundColor: bg.surface, borderColor: rule.default },
          ]}
        >
          <Text style={[styles.rangeLabel, { color: accent.default }]}>
            {RANGE_LABELS[timeRange]}
          </Text>
          <Ionicons name="chevron-down" size={12} color={text.tertiary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}>
        <InsightSummaryCard
          headline={volumeVsMood.headline}
          body={volumeVsMood.sub}
          sentiment={volumeVsMood.sentiment}
        />

        <View
          style={[
            styles.chartCard,
            { backgroundColor: bg.surface, borderColor: rule.subtle },
          ]}
        >
          <DualAxisChart weeklyData={volumeVsMood.weeklyData} compact={false} />
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCell, { backgroundColor: bg.surface, borderColor: rule.subtle }]}>
            <Dateline>AVG WEEKLY</Dateline>
            <Text style={[styles.statValue, { color: text.primary }]}>
              {avgKm.toFixed(1)}<Text style={styles.unit}>km</Text>
            </Text>
          </View>
          <View style={[styles.statCell, { backgroundColor: bg.surface, borderColor: rule.subtle }]}>
            <Dateline>BEST MOOD</Dateline>
            <Text style={[styles.statValue, { color: text.primary }]}>
              {bestMoodWeek?.weekLabel ?? '—'}
            </Text>
            <Text style={[styles.statSub, { color: text.tertiary }]}>
              {bestMoodWeek ? `${bestMoodWeek.distanceKm.toFixed(1)}km` : 'No data'}
            </Text>
          </View>
          <View style={[styles.statCell, { backgroundColor: bg.surface, borderColor: rule.subtle }]}>
            <Dateline>HIGHEST VOL</Dateline>
            <Text style={[styles.statValue, { color: text.primary }]}>
              {highestVolumeWeek?.weekLabel ?? '—'}
            </Text>
            <Text style={[styles.statSub, { color: text.tertiary }]}>
              {highestVolumeWeek ? `${Math.round(highestVolumeWeek.goodMoodPct)}% good` : 'No data'}
            </Text>
          </View>
        </View>

        <Text style={[styles.contextNote, { color: text.tertiary }]}>
          Based on your last {volumeVsMood.weeklyData.length} weeks. Patterns become clearer with more data.
        </Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerLeft: {
    width: 40,
  },
  headerTitle: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 17,
  },
  rangePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
    minWidth: 50,
    justifyContent: 'center',
  },
  rangeLabel: {
    fontFamily: 'Manrope',
    fontWeight: '500',
    fontSize: 12,
  },
  scrollContent: {
    padding: 16,
  },
  chartCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statCell: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  statValue: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 14,
  },
  unit: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '400',
  },
  statSub: {
    fontFamily: 'Manrope',
    fontWeight: '400',
    fontSize: 9,
    marginTop: 2,
  },
  contextNote: {
    fontFamily: 'Manrope',
    fontWeight: '400',
    fontSize: 10,
    textAlign: 'center',
  },
})
