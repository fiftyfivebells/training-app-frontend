import { useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Canvas, Circle, Path, Rect } from '@shopify/react-native-skia'
import { Skia } from '@shopify/react-native-skia'
import { useTheme } from '@/theme/useTheme'
import type { VolumeWeekData } from '@/domains/analytics/utils'

export type DualAxisChartProps = {
  weeklyData: VolumeWeekData[]
  compact: boolean
}

export function DualAxisChart({ weeklyData, compact }: DualAxisChartProps) {
  const { text, rule, mood } = useTheme()
  const [containerWidth, setContainerWidth] = useState(0)

  const CHART_HEIGHT = compact ? 72 : 100

  const { bars, path, lastPoint } = useMemo<{
    bars: { x: number; y: number; width: number; height: number }[]
    path: import('@shopify/react-native-skia').SkPath | null
    lastPoint: { x: number; y: number } | null
  }>(() => {
    if (containerWidth === 0 || weeklyData.length === 0) {
      return { bars: [], path: null, lastPoint: null }
    }

    const slotWidth = containerWidth / weeklyData.length
    const barWidth = slotWidth * 0.6
    const maxKm = Math.max(...weeklyData.map((w) => w.distanceKm), 0.001)

    const bars = weeklyData.map((w, i) => {
      const x = i * slotWidth + (slotWidth - barWidth) / 2
      const barH = (w.distanceKm / maxKm) * CHART_HEIGHT
      const y = CHART_HEIGHT - barH
      return { x, y, width: barWidth, height: barH }
    })

    const p = Skia.Path.Make()
    let lastPoint: { x: number; y: number } | null = null

    weeklyData.forEach((w, i) => {
      const px = i * slotWidth + slotWidth / 2
      const py = CHART_HEIGHT - (w.goodMoodPct / 100) * CHART_HEIGHT
      if (i === 0) {
        p.moveTo(px, py)
      } else {
        p.lineTo(px, py)
      }
      if (i === weeklyData.length - 1) {
        lastPoint = { x: px, y: py }
      }
    })

    return { bars, path: p, lastPoint }
  }, [containerWidth, weeklyData, CHART_HEIGHT])

  return (
    <View style={styles.wrapper}>
      <View
        style={[styles.chartContainer, { height: CHART_HEIGHT }]}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {containerWidth > 0 && (
          <Canvas style={{ width: containerWidth, height: CHART_HEIGHT }}>
            {bars.map((bar, i) => (
              <Rect
                key={i}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                color={rule.subtle}
              />
            ))}
            {path && (
              <Path
                path={path}
                color={mood.highGood}
                style="stroke"
                strokeWidth={1.5}
              />
            )}
            {!compact && lastPoint ? (
              <Circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r={3}
                color={mood.highGood}
              />
            ) : null}
          </Canvas>
        )}
      </View>

      {!compact && containerWidth > 0 && (
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
                    color: isNow ? text.primary : text.tertiary,
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
      )}

      {compact && containerWidth > 0 && (
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.volumeLegendRect,
                { backgroundColor: rule.subtle },
              ]}
            />
            <Text style={[styles.legendText, { color: text.tertiary }]}>
              Volume
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.moodLegendContainer}>
              <View
                style={[
                  styles.moodLegendLine,
                  { backgroundColor: mood.highGood },
                ]}
              />
            </View>
            <Text style={[styles.legendText, { color: text.tertiary }]}>
              % good mood
            </Text>
          </View>
        </View>
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
    fontFamily: 'Manrope',
    textAlign: 'center',
    fontSize: 8,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  volumeLegendRect: {
    width: 12,
    height: 6,
  },
  moodLegendContainer: {
    width: 12,
    justifyContent: 'center',
  },
  moodLegendLine: {
    width: '100%',
    height: 1.5,
  },
  legendText: {
    fontFamily: 'Manrope',
    fontWeight: '400',
    fontSize: 9,
  },
})
