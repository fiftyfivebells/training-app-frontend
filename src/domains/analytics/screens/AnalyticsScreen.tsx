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
import { InsightCard } from '@/domains/analytics/components/InsightCard'
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

const RANGE_LABELS = {
  '4w': 'Last 4 weeks',
  '8w': 'Last 8 weeks',
  '12w': 'Last 12 weeks',
  all: 'All time',
}

export function AnalyticsScreen() {
  const { bg, text, rule, accent, mood, moodBg, semantic } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { timeRange, setTimeRange } = useAnalyticsStore()
  const { data: runs = [], isLoading: runsLoading } = useRuns()
  const { data: moods = [], isLoading: moodsLoading } = useGetAllMoods()

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

  if (runsLoading || moodsLoading) {
    return <View style={[styles.container, { backgroundColor: bg.base }]} />
  }

  if (runs.length < 5) {
    return (
      <View style={[styles.container, styles.empty, { backgroundColor: bg.base }]}>
        <Text style={[styles.emptyText, { color: text.secondary }]}>
          Log more runs to start seeing patterns in your training.
        </Text>
      </View>
    )
  }

  const moodTrends = computeMoodTrends(runs, timeRange, moods)
  const moodByType = computeMoodByRunType(runs, timeRange, moods)
  const rpeVsMood = computeRpeVsMood(runs, timeRange, moods)
  const volumeVsMood = computeVolumeVsMood(runs, timeRange, moods)

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg.base }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={[styles.title, { color: text.primary }]}>Analytics</Text>
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

      <InsightCard
        label="Mood trends"
        headline={moodTrends.headline}
        sub={moodTrends.sub}
        sentiment={moodTrends.sentiment}
        hasEnoughData={moodTrends.weeklyData.length >= 2}
        onPress={() => router.push('/analytics/mood-trends')}
      >
        <StackedBarChart weeklyData={moodTrends.weeklyData} compact />
      </InsightCard>

      <InsightCard
        label="Mood by run type"
        headline={moodByType.headline}
        sub={moodByType.sub}
        sentiment={moodByType.sentiment}
        hasEnoughData={moodByType.byType.length >= 2}
        onPress={() => router.push('/analytics/mood-by-run-type')}
      >
        <HorizontalStackedBars byType={moodByType.byType} compact />
      </InsightCard>

      <InsightCard
        label="RPE vs mood"
        headline={rpeVsMood.headline}
        sub={rpeVsMood.sub}
        sentiment={rpeVsMood.sentiment}
        hasEnoughData={runs.length >= 5}
        onPress={() => router.push('/analytics/rpe-vs-mood')}
      >
        <QuadrantGrid grid={rpeVsMood.grid} isWarning={rpeVsMood.isWarning} compact />
      </InsightCard>

      <InsightCard
        label="Volume vs mood"
        headline={volumeVsMood.headline}
        sub={volumeVsMood.sub}
        sentiment={volumeVsMood.sentiment}
        hasEnoughData={volumeVsMood.weeklyData.length >= 4}
        onPress={() => router.push('/analytics/volume-vs-mood')}
      >
        <DualAxisChart weeklyData={volumeVsMood.weeklyData} compact />
      </InsightCard>
      
      <View style={{ height: insets.bottom + 24 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '600',
    fontSize: 28,
    letterSpacing: -0.5,
  },
  rangePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  rangeLabel: {
    fontWeight: '500',
    fontSize: 12,
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
})
