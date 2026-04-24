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
  cancelAnimation,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDecay,
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
  CLUSTER_CENTERS,
  DIM_FILL,
  QUADRANT_LABELS,
  R,
  R_SELECTED,
  ROW,
} from '@/domains/moods/moods.constants'
import { useMoodSelectionStore } from '@/store/moodSelectionStore'
import { useTheme } from '@/theme/useTheme'

import { MoodSelectionBar } from '../components/MoodSelectionBar'
import { type Cell, layoutMoods, makeHexPath, makeLinePath } from '../utils/canvas'

export function MoodPickerScreen() {
  const { bg, text, rule, accent, mood, moodBg, semantic } = useTheme()
  const insets = useSafeAreaInsets()

  const { data: moods = [] } = useGetAllMoods()

  const storeMoodId = useMoodSelectionStore((s) => s.moodId)
  const storeSet = useMoodSelectionStore((s) => s.set)

  const [selectedId, setSelectedId] = useState<number | null>(storeMoodId)

  const tx = useSharedValue(0)
  const ty = useSharedValue(0)
  const vw = useSharedValue(0)
  const vh = useSharedValue(0)
  const startTx = useSharedValue(0)
  const startTy = useSharedValue(0)

  const dotScale = useSharedValue(1)
  const dotAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: dotScale.value }] }))

  const [layoutReady, setLayoutReady] = useState(false)

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout
      vw.value = width
      vh.value = height
      tx.value = (width - CANVAS_W) / 2
      ty.value = (height - CANVAS_H) / 2
      setLayoutReady(true)
    },
    [tx, ty, vw, vh],
  )

  const transform = useDerivedValue(() => [
    { translateX: tx.value },
    { translateY: ty.value },
  ])

  const cells = useMemo<Cell[]>(() => layoutMoods(moods), [moods])

  const selected = cells.find((c) => c.mood.id === selectedId) ?? null

  const { restingPaths, selectedPaths, vAxisPath, hAxisPath } = useMemo(() => {
    const resting = cells.map((c) => makeHexPath(c.x, c.y, R))
    const sel = cells.map((c) => makeHexPath(c.x, c.y, R_SELECTED))
    const vAxis = makeLinePath(CANVAS_MID_X, 0, CANVAS_MID_X, CANVAS_H)
    const hAxis = makeLinePath(0, CANVAS_MID_Y, CANVAS_W, CANVAS_MID_Y)
    return { restingPaths: resting, selectedPaths: sel, vAxisPath: vAxis, hAxisPath: hAxis }
  }, [cells])

  const hexFont = useFont(Inter_400Regular, 12)
  const axisFont = useFont(Inter_400Regular, 12)

  const BOUNDARY_MARGIN = 100

  const pan = Gesture.Pan()
    .onBegin(() => {
      cancelAnimation(tx)
      cancelAnimation(ty)
      startTx.value = tx.value
      startTy.value = ty.value
    })
    .onUpdate((e) => {
      const minTx = vw.value - CANVAS_W - BOUNDARY_MARGIN
      const minTy = vh.value - CANVAS_H - BOUNDARY_MARGIN
      const maxTx = BOUNDARY_MARGIN
      const maxTy = BOUNDARY_MARGIN

      tx.value = Math.min(maxTx, Math.max(minTx, startTx.value + e.translationX))
      ty.value = Math.min(maxTy, Math.max(minTy, startTy.value + e.translationY))
    })
    .onEnd((e) => {
      const minTx = vw.value - CANVAS_W - BOUNDARY_MARGIN
      const minTy = vh.value - CANVAS_H - BOUNDARY_MARGIN
      const maxTx = BOUNDARY_MARGIN
      const maxTy = BOUNDARY_MARGIN

      tx.value = withDecay({ velocity: e.velocityX, clamp: [minTx, maxTx] })
      ty.value = withDecay({ velocity: e.velocityY, clamp: [minTy, maxTy] })
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
        'high-pleasant':    mood.highGood,
        'high-challenging': mood.highTough,
        'low-pleasant':     mood.lowGood,
        'low-challenging':  mood.lowTough,
      }
      return map[q]
    },
    [mood],
  )

  const textWidth = useCallback(
    (text: string, font: SkFont) => font.measureText(text).width,
    [],
  )

  return (
    <View style={[styles.screen, { backgroundColor: bg.base }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            borderBottomColor: rule.subtle,
            backgroundColor: bg.base,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text.primary }]}>
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
                    const center = CLUSTER_CENTERS[q]
                    const label = QUADRANT_LABELS[q]
                    return (
                      <Group key={q} opacity={0.44}>
                        <SkiaText
                          x={center.x - textWidth(label, axisFont) / 2}
                          y={center.y - ROW - R - 8}
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
                          color={sel ? bg.base : qColor}
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
