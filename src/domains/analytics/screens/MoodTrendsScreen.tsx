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
import { StackedBarChart } from '@/domains/analytics/components/charts/StackedBarChart'
import { computeMoodTrends } from '@/domains/analytics/utils'

const RANGE_LABELS = {
  '4w': '4w',
  '8w': '8w',
  '12w': '12w',
  all: 'All',
}

export function MoodTrendsScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { timeRange, setTimeRange } = useAnalyticsStore()
  const { data: runs = [] } = useRuns()
  const { data: moods = [] } = useGetAllMoods()

  const moodTrends = computeMoodTrends(runs, timeRange, moods)

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

  const bestWeek = moodTrends.weeklyData.reduce((best, week) => {
    const goodPct =
      week.counts['high-pleasant'] + week.counts['low-pleasant']
    const total = Object.values(week.counts).reduce((a, b) => a + b, 0)
    const pct = total > 0 ? (goodPct / total) * 100 : 0
    return pct > (best?.pct ?? -1) ? { week, pct } : best
  }, null as { week: any; pct: number } | null)

  const toughestWeek = moodTrends.weeklyData.reduce((tough, week) => {
    const toughPct =
      week.counts['high-challenging'] + week.counts['low-challenging']
    const total = Object.values(week.counts).reduce((a, b) => a + b, 0)
    const pct = total > 0 ? (toughPct / total) * 100 : 0
    return pct > (tough?.pct ?? -1) ? { week, pct } : tough
  }, null as { week: any; pct: number } | null)

  return (
    <View style={[styles.container, { backgroundColor: colors.background.base }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerLeft}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Mood trends</Text>
        <Pressable
          onPress={handleRangePress}
          style={[
            styles.rangePicker,
            { backgroundColor: colors.background.surface, borderColor: colors.border.default },
          ]}
        >
          <Text style={[styles.rangeLabel, { color: colors.copper.default }]}>
            {RANGE_LABELS[timeRange]}
          </Text>
          <Ionicons name="chevron-down" size={12} color={colors.text.tertiary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}>
        <InsightSummaryCard
          headline={moodTrends.headline}
          body={moodTrends.sub}
          sentiment={moodTrends.sentiment}
        />

        <View
          style={[
            styles.chartCard,
            { backgroundColor: colors.background.surface, borderColor: colors.border.subtle },
          ]}
        >
          <StackedBarChart weeklyData={moodTrends.weeklyData} compact={false} />
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCell, { backgroundColor: colors.background.surface, borderColor: colors.border.subtle }]}>
            <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>BEST WEEK</Text>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {bestWeek?.week.weekLabel ?? '—'}
            </Text>
            <Text style={[styles.statSub, { color: colors.mood.highGood }]}>
              {bestWeek ? `${Math.round(bestWeek.pct)}% good mood` : 'No data'}
            </Text>
          </View>
          <View style={[styles.statCell, { backgroundColor: colors.background.surface, borderColor: colors.border.subtle }]}>
            <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>TOUGHEST WEEK</Text>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {toughestWeek?.week.weekLabel ?? '—'}
            </Text>
            <Text style={[styles.statSub, { color: colors.mood.lowTough }]}>
              {toughestWeek ? `${Math.round(toughestWeek.pct)}% tough mood` : 'No data'}
            </Text>
          </View>
        </View>
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
    fontWeight: '600',
    fontSize: 17,
  },
  rangePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    minWidth: 50,
    justifyContent: 'center',
  },
  rangeLabel: {
    fontWeight: '500',
    fontSize: 12,
  },
  scrollContent: {
    padding: 16,
  },
  chartCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCell: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statLabel: {
    fontWeight: '500',
    fontSize: 8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontWeight: '600',
    fontSize: 16,
  },
  statSub: {
    fontWeight: '400',
    fontSize: 10,
    marginTop: 2,
  },
})
