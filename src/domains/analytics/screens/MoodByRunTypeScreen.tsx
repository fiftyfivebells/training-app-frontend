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
import { HorizontalStackedBars } from '@/domains/analytics/components/charts/HorizontalStackedBars'
import { computeMoodByRunType } from '@/domains/analytics/utils'
import { Dateline } from '@/components/ui'

const RANGE_LABELS = {
  '4w': '4w',
  '8w': '8w',
  '12w': '12w',
  all: 'All',
}

export function MoodByRunTypeScreen() {
  const { bg, text, rule, accent, mood } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { timeRange, setTimeRange } = useAnalyticsStore()
  const { data: runs = [] } = useRuns()
  const { data: moods = [] } = useGetAllMoods()

  const moodByType = computeMoodByRunType(runs, timeRange, moods)

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

  const moodColors = {
    'high-pleasant': mood.highGood,
    'low-pleasant': mood.lowGood,
    'high-challenging': mood.highTough,
    'low-challenging': mood.lowTough,
  }

  return (
    <View style={[styles.container, { backgroundColor: bg.base }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerLeft}>
          <Ionicons name="arrow-back" size={24} color={text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: text.primary }]}>Mood by run type</Text>
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
          headline={moodByType.headline}
          body={moodByType.sub}
          sentiment={moodByType.sentiment}
        />

        <View
          style={[
            styles.chartCard,
            { backgroundColor: bg.surface, borderColor: rule.subtle },
          ]}
        >
          <HorizontalStackedBars byType={moodByType.byType} compact={false} />
          
          <View style={[styles.legend, { borderTopColor: rule.subtle }]}>
            {[
              { label: 'High energy · good', key: 'high-pleasant' as const },
              { label: 'Low energy · good', key: 'low-pleasant' as const },
              { label: 'High energy · tough', key: 'high-challenging' as const },
              { label: 'Low energy · tough', key: 'low-challenging' as const },
            ].map((item) => (
              <View key={item.key} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendSwatch,
                    { backgroundColor: moodColors[item.key] },
                  ]}
                />
                <Text style={[styles.legendText, { color: text.tertiary }]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Dateline style={{ marginBottom: 8, marginLeft: 4 }}>BREAKDOWN</Dateline>
        {moodByType.byType.map((type) => (
          <View
            key={type.runType}
            style={[
              styles.breakdownCard,
              { backgroundColor: bg.surface, borderColor: rule.subtle },
            ]}
          >
            <View style={styles.breakdownHeader}>
              <Text style={[styles.typeLabel, { color: text.primary }]}>
                {type.runType}
              </Text>
              <Text style={[styles.runCount, { color: text.tertiary }]}>
                {type.total} runs
              </Text>
            </View>
            <View style={styles.dotsRow}>
              {(['high-pleasant', 'low-pleasant', 'high-challenging', 'low-challenging'] as const).map(
                (key) => (
                  <View key={key} style={styles.dotGroup}>
                    <View style={[styles.dot, { backgroundColor: moodColors[key] }]} />
                    <Text style={[styles.dotCount, { color: text.primary }]}>
                      {type.counts[key]}
                    </Text>
                  </View>
                )
              )}
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
    marginBottom: 24,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  legendSwatch: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontFamily: 'Manrope',
    fontWeight: '400',
    fontSize: 9,
  },
  breakdownCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeLabel: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  runCount: {
    fontFamily: 'Manrope',
    fontWeight: '400',
    fontSize: 11,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dotGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotCount: {
    fontFamily: 'Manrope',
    fontWeight: '500',
    fontSize: 13,
  },
})
