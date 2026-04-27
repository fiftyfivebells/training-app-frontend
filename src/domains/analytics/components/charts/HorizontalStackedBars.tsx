import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import type { MoodCategoryKey } from '@/domains/moods/moods.types'
import type { RunTypeBreakdown } from '@/domains/analytics/utils'

export type HorizontalStackedBarsProps = {
  byType: RunTypeBreakdown[]
  compact: boolean
}

const SEGMENT_ORDER: MoodCategoryKey[] = [
  'high-pleasant',
  'low-pleasant',
  'high-challenging',
  'low-challenging',
]

export function HorizontalStackedBars({ byType, compact }: HorizontalStackedBarsProps) {
  const { text, mood } = useTheme()

  const SEGMENT_COLORS: Record<MoodCategoryKey, string> = {
    'high-pleasant': mood.highGood,
    'low-pleasant': mood.lowGood,
    'high-challenging': mood.highTough,
    'low-challenging': mood.lowTough,
  }

  if (compact) {
    return (
      <View style={styles.container}>
        {byType.map((row, i) => (
          <View key={i} style={styles.compactBar}>
            {SEGMENT_ORDER.map((key) => {
              const pct = row.percentages[key]
              if (pct === 0) return null
              return (
                <View
                  key={key}
                  style={[
                    styles.segment,
                    { width: `${pct}%`, backgroundColor: SEGMENT_COLORS[key] },
                  ]}
                />
              )
            })}
          </View>
        ))}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {byType.map((row, i) => (
        <View key={i} style={styles.expandedRow}>
          <Text style={[styles.expandedLabel, { color: text.tertiary }]}>
            {row.runType}
          </Text>
          <View style={styles.expandedBar}>
            {SEGMENT_ORDER.map((key) => {
              const pct = row.percentages[key]
              if (pct === 0) return null
              return (
                <View
                  key={key}
                  style={[
                    styles.segment,
                    { width: `${pct}%`, backgroundColor: SEGMENT_COLORS[key] },
                  ]}
                />
              )
            })}
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  compactBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  segment: {
    height: '100%',
  },
  expandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  expandedLabel: {
    fontFamily: 'Manrope',
    width: 52,
    fontWeight: '500',
    fontSize: 10,
  },
  expandedBar: {
    flex: 1,
    flexDirection: 'row',
    height: 12,
    borderRadius: 4,
    overflow: 'hidden',
  },
})
