import {
  Canvas,
  DashPathEffect,
  Group,
  Path,
  Text as SkiaText,
  useFont,
  type SkFont,
} from '@shopify/react-native-skia'
import { router } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Ionicons } from '@expo/vector-icons'
import { Inter_400Regular } from '@expo-google-fonts/inter'

import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import type { MoodCategoryKey } from '@/domains/moods/moods.types'
import {
  CANVAS_H,
  CANVAS_MID_X,
  CANVAS_MID_Y,
  CANVAS_W,
  DIM_FILL,
  QUADRANT_LABELS,
  R,
  R_SELECTED,
} from '@/domains/moods/moods.constants'
import { useMoodSelectionStore } from '@/store/moodSelectionStore'
import { useTheme } from '@/theme/useTheme'

import { MoodSelectionBar } from '../components/MoodSelectionBar'
import { type Cell, makeHexPath, makeLinePath, moodToCanvas } from '../utils/canvas'

export function MoodPickerScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  const { data: moods = [] } = useGetAllMoods()

  const storeMoodId = useMoodSelectionStore((s) => s.moodId)
  const storeSet = useMoodSelectionStore((s) => s.set)

  const [selectedId, setSelectedId] = useState<number | null>(storeMoodId)

  const tx = useSharedValue(0)
  const ty = useSharedValue(0)
  const startTx = useSharedValue(0)
  const startTy = useSharedValue(0)

  const dotScale = useSharedValue(1)
  const dotAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: dotScale.value }] }))

  const [layoutReady, setLayoutReady] = useState(false)

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout
      tx.value = (width - CANVAS_W) / 2
      ty.value = (height - CANVAS_H) / 2
      setLayoutReady(true)
    },
    [tx, ty],
  )

  const transform = useDerivedValue(() => [
    { translateX: tx.value },
    { translateY: ty.value },
  ])

  const cells = useMemo<Cell[]>(
    () => moods.map((mood) => ({ ...moodToCanvas(mood), mood })),
    [moods],
  )

  const selected = cells.find((c) => c.mood.id === selectedId) ?? null

  const { restingPaths, selectedPaths, vAxisPath, hAxisPath } = useMemo(() => {
    const resting = cells.map((c) => makeHexPath(c.x, c.y, R))
    const sel = cells.map((c) => makeHexPath(c.x, c.y, R_SELECTED))
    const vAxis = makeLinePath(CANVAS_MID_X, 0, CANVAS_MID_X, CANVAS_H)
    const hAxis = makeLinePath(0, CANVAS_MID_Y, CANVAS_W, CANVAS_MID_Y)
    return { restingPaths: resting, selectedPaths: sel, vAxisPath: vAxis, hAxisPath: hAxis }
  }, [cells])

  const clusterCenters = useMemo(() => {
    const groups: Partial<Record<MoodCategoryKey, { sumX: number; sumY: number; count: number; minY: number }>> = {}
    for (const cell of cells) {
      const q = cell.mood.quadrant
      if (!groups[q]) groups[q] = { sumX: 0, sumY: 0, count: 0, minY: Infinity }
      groups[q]!.sumX += cell.x
      groups[q]!.sumY += cell.y
      groups[q]!.count++
      if (cell.y < groups[q]!.minY) groups[q]!.minY = cell.y
    }
    const centers: Partial<Record<MoodCategoryKey, { x: number; y: number; minY: number }>> = {}
    for (const [q, g] of Object.entries(groups) as [MoodCategoryKey, { sumX: number; sumY: number; count: number; minY: number }][]) {
      centers[q] = { x: g.sumX / g.count, y: g.sumY / g.count, minY: g.minY }
    }
    return centers
  }, [cells])

  const hexFont = useFont(Inter_400Regular, 8)
  const axisFont = useFont(Inter_400Regular, 9)

  const pan = Gesture.Pan()
    .onBegin(() => {
      startTx.value = tx.value
      startTy.value = ty.value
    })
    .onUpdate((e) => {
      tx.value = startTx.value + e.translationX
      ty.value = startTy.value + e.translationY
    })

  const tap = Gesture.Tap()
    .runOnJS(true)
    .onEnd((e, success) => {
      if (!success) return
      const cx = e.x - tx.value
      const cy = e.y - ty.value
      for (const cell of cells) {
        const dx = cx - cell.x
        const dy = cy - cell.y
        if (Math.sqrt(dx * dx + dy * dy) < R + 2) {
          setSelectedId(cell.mood.id)
          dotScale.value = withSequence(
            withSpring(1.3, { damping: 8, stiffness: 200 }),
            withSpring(1.0, { damping: 12, stiffness: 200 }),
          )
          return
        }
      }
    })

  const gesture = Gesture.Simultaneous(pan, tap)

  const handleConfirm = useCallback(() => {
    if (!selected) return
    storeSet(selected.mood.id)
    router.back()
  }, [selected, storeSet])

  const quadColor = useCallback(
    (q: MoodCategoryKey) => {
      const map: Record<MoodCategoryKey, string> = {
        'high-pleasant':    colors.mood.highGood,
        'high-challenging': colors.mood.highTough,
        'low-pleasant':     colors.mood.lowGood,
        'low-challenging':  colors.mood.lowTough,
      }
      return map[q]
    },
    [colors],
  )

  const textWidth = useCallback(
    (text: string, font: SkFont) => font.measureText(text).width,
    [],
  )

  return (
    <View style={[styles.screen, { backgroundColor: colors.background.base }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            borderBottomColor: colors.border.subtle,
            backgroundColor: colors.background.base,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          How did it feel?
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Canvas area */}
      <View style={styles.canvasArea} onLayout={handleLayout}>
        {layoutReady && (
          <GestureDetector gesture={gesture}>
            <Canvas style={StyleSheet.absoluteFill}>
              <Group transform={transform}>
                {/* Axis lines */}
                <Path path={vAxisPath} style="stroke" strokeWidth={1} color="#1E2230">
                  <DashPathEffect intervals={[5, 7]} phase={0} />
                </Path>
                <Path path={hAxisPath} style="stroke" strokeWidth={1} color="#1E2230">
                  <DashPathEffect intervals={[5, 7]} phase={0} />
                </Path>

                {/* Axis direction labels */}
                {axisFont && (
                  <>
                    <SkiaText
                      x={CANVAS_MID_X - textWidth('HIGH ENERGY', axisFont) / 2}
                      y={20}
                      text="HIGH ENERGY"
                      font={axisFont}
                      color="#2A2F48"
                    />
                    <SkiaText
                      x={CANVAS_MID_X - textWidth('LOW ENERGY', axisFont) / 2}
                      y={CANVAS_H - 10}
                      text="LOW ENERGY"
                      font={axisFont}
                      color="#2A2F48"
                    />
                    <SkiaText
                      x={12}
                      y={CANVAS_MID_Y + 2}
                      text="TOUGH"
                      font={axisFont}
                      color="#2A2F48"
                    />
                    <SkiaText
                      x={CANVAS_W - textWidth('GOOD', axisFont) - 12}
                      y={CANVAS_MID_Y + 2}
                      text="GOOD"
                      font={axisFont}
                      color="#2A2F48"
                    />
                  </>
                )}

                {/* Quadrant name labels — above each cluster centroid */}
                {axisFont &&
                  (Object.keys(QUADRANT_LABELS) as MoodCategoryKey[]).map((q) => {
                    const center = clusterCenters[q]
                    if (!center) return null
                    const label = QUADRANT_LABELS[q]
                    return (
                      <Group key={q} opacity={0.44}>
                        <SkiaText
                          x={center.x - textWidth(label, axisFont) / 2}
                          y={center.minY - R - 8}
                          text={label}
                          font={axisFont}
                          color={quadColor(q)}
                        />
                      </Group>
                    )
                  })}

                {/* Hex cells */}
                {cells.map((cell, i) => {
                  const sel = cell.mood.id === selectedId
                  const qColor = quadColor(cell.mood.quadrant)
                  const path = sel ? selectedPaths[i] : restingPaths[i]
                  return (
                    <Group key={cell.mood.id}>
                      <Path path={path} color={sel ? qColor : DIM_FILL[cell.mood.quadrant]} />
                      <Path
                        path={path}
                        style="stroke"
                        strokeWidth={sel ? 2 : 1}
                        color={qColor}
                      />
                      {hexFont && (
                        <SkiaText
                          x={cell.x - textWidth(cell.mood.label, hexFont) / 2}
                          y={cell.y + 3}
                          text={cell.mood.label}
                          font={hexFont}
                          color={sel ? colors.background.base : qColor}
                        />
                      )}
                    </Group>
                  )
                })}
              </Group>
            </Canvas>
          </GestureDetector>
        )}
      </View>

      <MoodSelectionBar
        selected={selected}
        quadColor={quadColor}
        dotAnimStyle={dotAnimStyle}
        onConfirm={handleConfirm}
        paddingBottom={insets.bottom + 8}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 48,
  },
  canvasArea: {
    flex: 1,
  },
})
