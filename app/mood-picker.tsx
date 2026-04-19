import { Skia, Canvas, Group, Path, Text as SkiaText, DashPathEffect, useFont, type SkFont } from '@shopify/react-native-skia'
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
import { type Mood, type MoodCategoryKey } from '@/domains/moods/moods.types'
import { useMoodSelectionStore } from '@/store/moodSelectionStore'
import { useTheme } from '@/theme/useTheme'

const R = 32
const R_SELECTED = R + 3
const CANVAS_W = 618
const CANVAS_H = 470
const CANVAS_MID_X = CANVAS_W / 2   // 309
const CANVAS_MID_Y = CANVAS_H / 2   // 235

const SCALE_X = (CANVAS_W / 2 - R - 20) / 6   // ≈ 42.8
const SCALE_Y = (CANVAS_H / 2 - R - 20) / 6   // ≈ 30.5

const DIM_FILL: Record<MoodCategoryKey, string> = {
  'high-pleasant':    '#1C1E10',
  'high-challenging': '#1E1510',
  'low-pleasant':     '#101C1E',
  'low-challenging':  '#16101E',
}

const QUADRANT_LABELS: Record<MoodCategoryKey, string> = {
  'high-pleasant':    'HIGH · GOOD',
  'high-challenging': 'HIGH · TOUGH',
  'low-pleasant':     'LOW · GOOD',
  'low-challenging':  'LOW · TOUGH',
}

function moodToCanvas(mood: Mood): { x: number; y: number } {
  return {
    x: CANVAS_MID_X + mood.energyLevel * SCALE_X,
    y: CANVAS_MID_Y - mood.experienceQuality * SCALE_Y,
  }
}

type Cell = {
  x: number
  y: number
  mood: Mood
}

function makeHexPath(cx: number, cy: number, r: number) {
  const path = Skia.Path.Make()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i)
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    if (i === 0) path.moveTo(x, y)
    else path.lineTo(x, y)
  }
  path.close()
  return path
}

function makeLinePath(x1: number, y1: number, x2: number, y2: number) {
  const path = Skia.Path.Make()
  path.moveTo(x1, y1)
  path.lineTo(x2, y2)
  return path
}

export default function MoodPickerScreen() {
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
                      {/* Fill */}
                      <Path path={path} color={sel ? qColor : DIM_FILL[cell.mood.quadrant]} />
                      {/* Stroke */}
                      <Path
                        path={path}
                        style="stroke"
                        strokeWidth={sel ? 2 : 1}
                        color={qColor}
                      />
                      {/* Label */}
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

      {/* Selection bar */}
      <View
        style={[
          styles.selectionBar,
          {
            backgroundColor: colors.background.surface,
            borderTopColor: colors.border.subtle,
            minHeight: 82,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        <View style={styles.selectionLeft}>
          <Animated.View
            style={[
              styles.selectionDot,
              selected
                ? { backgroundColor: quadColor(selected.mood.quadrant), borderWidth: 0 }
                : {
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderStyle: 'dashed',
                    borderColor: colors.border.default,
                  },
              dotAnimStyle,
            ]}
          />
          <View style={styles.selectionTextBlock}>
            {selected ? (
              <>
                <Text style={[styles.selectionName, { color: colors.text.primary }]}>
                  {selected.mood.label}
                </Text>
                <Text style={[styles.selectionDesc, { color: colors.text.secondary }]}>
                  {selected.mood.description}
                </Text>
              </>
            ) : (
              <Text style={[styles.selectionPrompt, { color: colors.text.tertiary }]}>
                Select how your run felt
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.confirmBtn,
            {
              backgroundColor: colors.copper.default,
              opacity: selected ? 1 : 0.3,
            },
          ]}
          onPress={handleConfirm}
          disabled={!selected}
          accessibilityLabel="Confirm mood selection"
          accessibilityRole="button"
        >
          <Text style={[styles.confirmBtnText, { color: colors.background.base }]}>Confirm</Text>
        </TouchableOpacity>
      </View>
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
    width: 48, // balances back button to keep title centered
  },
  canvasArea: {
    flex: 1,
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  selectionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 16,
  },
  selectionDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    flexShrink: 0,
  },
  selectionTextBlock: {
    flex: 1,
  },
  selectionPrompt: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectionDesc: {
    fontSize: 12,
    marginTop: 1,
  },
  confirmBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
})
