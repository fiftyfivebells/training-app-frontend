import { parseISO } from 'date-fns'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useMemo, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import { DIM_FILL, QUADRANT_LABELS } from '@/domains/moods/moods.constants'
import type { MoodCategoryKey } from '@/domains/moods/moods.types'
import type { RunResponse } from '@/domains/runs/api/runsApi'
import { formatDateLabel } from '@/domains/runs/utils/datetime'
import { useTheme } from '@/theme/useTheme'

const BREAKDOWN_ORDER: MoodCategoryKey[] = [
  'high-pleasant',
  'low-pleasant',
  'high-challenging',
  'low-challenging',
]

type Props = {
  blockRuns: RunResponse[]
}

export function MoodTimelineCard({ blockRuns }: Props) {
  const { bg, text, rule, accent, mood, moodBg, semantic } = useTheme()
  const { data: moods = [] } = useGetAllMoods()

  const [timelineContainerWidth, setTimelineContainerWidth] = useState(0)
  const [timelineContentWidth, setTimelineContentWidth] = useState(0)

  const moodQuadrantMap = useMemo(
    () => new Map(moods.map((m) => [m.id, m.quadrant] as [number, MoodCategoryKey])),
    [moods],
  )

  const QUAD_COLOR: Record<MoodCategoryKey, string> = {
    'high-pleasant': mood.highGood,
    'high-challenging': mood.highTough,
    'low-pleasant': mood.lowGood,
    'low-challenging': mood.lowTough,
  }

  const timelineRuns = useMemo(() => [...blockRuns].reverse(), [blockRuns])

  const quadrantCounts = useMemo(() => {
    const counts: Record<MoodCategoryKey, number> = {
      'high-pleasant': 0,
      'high-challenging': 0,
      'low-pleasant': 0,
      'low-challenging': 0,
    }
    for (const run of blockRuns) {
      const q = moodQuadrantMap.get(run.moodId)
      if (q) counts[q]++
    }
    return counts
  }, [blockRuns, moodQuadrantMap])

  const showTimelineFade = timelineContentWidth > timelineContainerWidth

  if (blockRuns.length === 0) return null

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: bg.surface,
          borderColor: rule.subtle,
        },
      ]}
    >
      <Text style={[styles.sectionLabel, { color: text.tertiary }]}>
        HOW IT FELT
      </Text>

      <View
        style={styles.timelineWrapper}
        onLayout={(e) => setTimelineContainerWidth(e.nativeEvent.layout.width)}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timelineContent}
          onContentSizeChange={(w) => setTimelineContentWidth(w)}
        >
          {timelineRuns.map((run, index) => {
            const quadrant = moodQuadrantMap.get(run.moodId)
            if (!quadrant) return null
            const dotColor = QUAD_COLOR[quadrant]
            const isNewest = index === timelineRuns.length - 1
            return (
              <TouchableOpacity
                key={run.id}
                onPress={() => router.push(`/runs/${run.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Run on ${formatDateLabel(new Date(run.date))}`}
              >
                {isNewest ? (
                  <View style={[styles.dotRing, { borderColor: dotColor }]}>
                    <View style={[styles.dot22, { backgroundColor: dotColor }]} />
                  </View>
                ) : (
                  <View style={[styles.dot22, { backgroundColor: dotColor }]} />
                )}
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {showTimelineFade && (
          <LinearGradient
            colors={['transparent', bg.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.timelineFade}
            pointerEvents="none"
          />
        )}
      </View>

      <View style={styles.axisRow}>
        <Text style={[styles.axisLabel, { color: text.tertiary }]}>Start</Text>
        <Text style={[styles.axisLabel, { color: text.tertiary }]}>Today</Text>
      </View>

      <View style={styles.breakdownGrid}>
        {([
          ['high-pleasant', 'low-pleasant'],
          ['high-challenging', 'low-challenging'],
        ] as MoodCategoryKey[][]).map((row, rowIndex) => (
          <View key={rowIndex} style={styles.breakdownRow}>
            {row.map((key) => {
              const count = quadrantCounts[key]
              return (
                <View
                  key={key}
                  style={[
                    styles.breakdownCell,
                    {
                      backgroundColor: DIM_FILL[key],
                      borderColor: QUAD_COLOR[key] + '26',
                    },
                  ]}
                >
                  <View style={styles.breakdownCellHeader}>
                    <View style={[styles.dot10, { backgroundColor: QUAD_COLOR[key] }]} />
                    <Text
                      style={[styles.breakdownLabel, { color: text.tertiary }]}
                    >
                      {QUADRANT_LABELS[key]}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.breakdownCount,
                      { color: count > 0 ? QUAD_COLOR[key] : text.tertiary },
                    ]}
                  >
                    {count === 1 ? '1 run' : `${count} runs`}
                  </Text>
                </View>
              )
            })}
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.06,
    marginBottom: 10,
  },
  timelineWrapper: {
    position: 'relative',
  },
  timelineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingRight: 32,
  },
  dot22: {
    width: 22,
    height: 22,
    borderRadius: 11,
    flexShrink: 0,
  },
  dotRing: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  timelineFade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 32,
  },
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  axisLabel: {
    fontSize: 10,
  },
  breakdownGrid: {
    gap: 6,
    marginTop: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    gap: 6,
  },
  breakdownCell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  breakdownCellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  dot10: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  breakdownLabel: {
    fontSize: 10,
    flex: 1,
  },
  breakdownCount: {
    fontSize: 14,
    fontWeight: '600',
  },
})
