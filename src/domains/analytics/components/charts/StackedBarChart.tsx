import React, { useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Canvas, Rect } from '@shopify/react-native-skia'
import { useTheme } from '@/theme/useTheme'
import type { MoodCategoryKey } from '@/domains/moods/moods.types'

type WeekData = {
  weekLabel: string
  counts: Record<MoodCategoryKey, number>
}

export type StackedBarChartProps = {
  weeklyData: WeekData[]
  compact: boolean
}

const SEGMENT_ORDER: MoodCategoryKey[] = [
  'high-pleasant',
  'low-pleasant',
  'high-challenging',
  'low-challenging',
]

export function StackedBarChart({ weeklyData, compact }: StackedBarChartProps) {
  const { colors } = useTheme()
  const [containerWidth, setContainerWidth] = useState(0)

  const CHART_HEIGHT = compact ? 72 : 100

  const SEGMENT_COLORS: Record<MoodCategoryKey, string> = {
    'high-pleasant': colors.mood.highGood,
    'low-pleasant': colors.mood.lowGood,
    'high-challenging': colors.mood.highTough,
    'low-challenging': colors.mood.lowTough,
  }

  const bars = useMemo(() => {
    if (containerWidth === 0 || weeklyData.length === 0) return []

    const slotWidth = containerWidth / weeklyData.length
    const barWidth = slotWidth * 0.6

    return weeklyData.map((week, i) => {
      const x = i * slotWidth + (slotWidth - barWidth) / 2
      const total =
        week.counts['high-pleasant'] +
        week.counts['low-pleasant'] +
        week.counts['high-challenging'] +
        week.counts['low-challenging']

      if (total === 0) {
        return {
          x,
          width: barWidth,
          segments: [
            {
              y: CHART_HEIGHT - 2,
              height: 2,
              color: colors.border.subtle,
            },
          ],
        }
      }

      let accumulated = 0
      const segments = SEGMENT_ORDER.map((key) => {
        const count = week.counts[key]
        if (count === 0) return null

        const segHeight = (count / total) * CHART_HEIGHT
        accumulated += segHeight
        return {
          y: CHART_HEIGHT - accumulated,
          height: segHeight,
          color: SEGMENT_COLORS[key],
        }
      }).filter((s): s is NonNullable<typeof s> => s !== null)

      return { x, width: barWidth, segments }
    })
  }, [containerWidth, weeklyData, CHART_HEIGHT, SEGMENT_COLORS, colors.border.subtle])

  return (
    <View style={styles.wrapper}>
      <View
        style={[styles.chartContainer, { height: CHART_HEIGHT }]}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {containerWidth > 0 && (
          <Canvas style={{ width: containerWidth, height: CHART_HEIGHT }}>
            {bars.map((bar, i) => (
              <React.Fragment key={i}>
                {bar.segments.map((seg, j) => (
                  <Rect
                    key={j}
                    x={bar.x}
                    y={seg.y}
                    width={bar.width}
                    height={seg.height}
                    color={seg.color}
                  />
                ))}
              </React.Fragment>
            ))}
          </Canvas>
        )}
      </View>

      {!compact && containerWidth > 0 && (
        <>
          <View style={styles.labelsRow}>
            {weeklyData.map((week, i) => {
              const isNow = week.weekLabel === 'Now'
              return (
                <Text
                  key={i}
                  style={[
                    styles.label,
                    {
                      width: containerWidth / weeklyData.length,
                      color: isNow ? colors.text.primary : colors.text.tertiary,
                      fontWeight: isNow ? '600' : '400',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {week.weekLabel}
                </Text>
              )
            })}
          </View>

          <View style={[styles.legend, { borderTopColor: colors.border.subtle }]}>
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
                    { backgroundColor: SEGMENT_COLORS[item.key] },
                  ]}
                />
                <Text style={[styles.legendText, { color: colors.text.tertiary }]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  chartContainer: {
    width: '100%',
  },
  labelsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  label: {
    textAlign: 'center',
    fontSize: 8,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
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
    fontWeight: '400',
    fontSize: 9,
  },
})
