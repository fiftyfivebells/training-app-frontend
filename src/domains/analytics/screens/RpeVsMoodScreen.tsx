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
import { QuadrantGrid } from '@/domains/analytics/components/charts/QuadrantGrid'
import { computeRpeVsMood } from '@/domains/analytics/utils'

const RANGE_LABELS = {
  '4w': '4w',
  '8w': '8w',
  '12w': '12w',
  all: 'All',
}

export function RpeVsMoodScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { timeRange, setTimeRange } = useAnalyticsStore()
  const { data: runs = [] } = useRuns()
  const { data: moods = [] } = useGetAllMoods()

  const rpeVsMood = computeRpeVsMood(runs, timeRange, moods)

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background.base }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.headerLeft}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>RPE vs mood</Text>
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
          headline={rpeVsMood.headline}
          body={rpeVsMood.sub}
          sentiment={rpeVsMood.sentiment}
        />

        <View
          style={[
            styles.chartCard,
            { backgroundColor: colors.background.surface, borderColor: colors.border.subtle },
          ]}
        >
          <QuadrantGrid grid={rpeVsMood.grid} isWarning={rpeVsMood.isWarning} compact={false} />
        </View>

        <View style={[styles.explanationCard, { backgroundColor: colors.background.surface }]}>
          <Text style={[styles.explanationText, { color: colors.text.secondary }]}>
            High RPE · Good — working hard and thriving.
          </Text>
          <Text style={[styles.explanationText, { color: colors.text.secondary }]}>
            High RPE · Tough — pushing through difficulty. Normal occasionally.
          </Text>
          <Text style={[styles.explanationText, { color: colors.text.secondary }]}>
            Low RPE · Good — your aerobic base is in great shape.
          </Text>
          <Text style={[styles.explanationText, { color: colors.text.secondary }]}>
            Low RPE · Tough — easy runs feeling hard. Often signals fatigue accumulation.
          </Text>
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
    overflow: 'hidden',
    marginBottom: 16,
  },
  explanationCard: {
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  explanationText: {
    fontWeight: '400',
    fontSize: 11,
    lineHeight: 16.5,
  },
})
