import { useEffect, useState } from 'react'
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
} from 'react-native-reanimated'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'

import type { Mood, MoodCategoryKey } from '@/domains/moods/moods.types'
import { Dateline } from '@/components/ui'
import { useTheme } from '@/theme/useTheme'

// ---------- Canvas geometry ----------

const CANVAS_W = 504
const CANVAS_H = 740
const QUADRANT_W = 252
const QUADRANT_H = 356
const AXIS_ROW_H = 28
const VIEWPORT_H = 466  // 548 sheet − ~58 header − 24 axis bar
const MOOD_SQUARE = 66
const COL_GAP = 8
const ROW_GAP = 8        // reduced from spec's 18 to fit within QUADRANT_H
const SHEET_H = 548

const MIN_X = -(CANVAS_W - 320)    // −184
const MAX_X = 0
const MIN_Y = -(CANVAS_H - VIEWPORT_H) // −274
const MAX_Y = 0

// ---------- Quadrant metadata ----------

const QUADRANT_META: Record<
  MoodCategoryKey,
  { colorKey: 'highGood' | 'highTough' | 'lowGood' | 'lowTough'; label: string; sublabel: string }
> = {
  'high-challenging': { colorKey: 'highTough', label: 'HIGH · TOUGH', sublabel: 'Hard work & grit' },
  'high-pleasant':    { colorKey: 'highGood',  label: 'HIGH · GOOD',  sublabel: 'Energized & thriving' },
  'low-challenging':  { colorKey: 'lowTough',  label: 'LOW · TOUGH',  sublabel: 'Drained & heavy' },
  'low-pleasant':     { colorKey: 'lowGood',   label: 'LOW · GOOD',   sublabel: 'Calm & restorative' },
}

function initialOffset(quadrant: MoodCategoryKey | null): { x: number; y: number } {
  switch (quadrant) {
    case 'high-challenging': return { x: 0,    y: 0 }
    case 'high-pleasant':    return { x: -184, y: 0 }
    case 'low-challenging':  return { x: 0,    y: -274 }
    case 'low-pleasant':     return { x: -184, y: -274 }
    default:                 return { x: 0,    y: 0 }
  }
}

// ---------- MoodSquare ----------

type MoodSquareProps = {
  mood: Mood
  isSelected: boolean
  moodColor: string
  moodBgColor: string
  onPress: () => void
}

function MoodSquare({ mood, isSelected, moodColor, moodBgColor, onPress }: MoodSquareProps) {
  const { text, rule, radius } = useTheme()
  const scale = useSharedValue(isSelected ? 1.14 : 1.0)

  useEffect(() => {
    scale.value = withSpring(isSelected ? 1.14 : 1.0, { damping: 14, stiffness: 200 })
  }, [isSelected, scale])

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={[{ zIndex: isSelected ? 2 : 1 }, animStyle]}>
      <TouchableOpacity
        style={[
          styles.moodSquare,
          {
            borderColor: isSelected ? moodColor : rule.default,
            borderWidth: isSelected ? 2.5 : 1,
            backgroundColor: isSelected ? moodBgColor : 'transparent',
            borderRadius: radius.sm,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.moodSquareText, { color: isSelected ? moodColor : text.primary }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {mood.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

// ---------- QuadrantSection ----------

type QuadrantSectionProps = {
  quadrant: MoodCategoryKey
  moods: Mood[]
  selectedMoodId: number | null
  onSelect: (mood: Mood) => void
  borderLeft?: boolean
}

function QuadrantSection({ quadrant, moods, selectedMoodId, onSelect, borderLeft }: QuadrantSectionProps) {
  const { text, mood: moodTokens, moodBg, rule } = useTheme()
  const meta = QUADRANT_META[quadrant]
  const moodColor = moodTokens[meta.colorKey]
  const moodBgColor = moodBg[meta.colorKey]
  const quadrantMoods = moods.filter((m) => m.quadrant === quadrant)

  return (
    <View
      style={[
        styles.quadrant,
        borderLeft && { borderLeftWidth: 1, borderLeftColor: rule.default },
      ]}
    >
      <View style={styles.quadrantHeader}>
        <Text style={[styles.quadrantLabel, { color: moodColor }]}>{meta.label}</Text>
        <Text style={[styles.quadrantSublabel, { color: text.secondary }]}>{meta.sublabel}</Text>
      </View>
      <View style={styles.squaresGrid}>
        {quadrantMoods.map((m) => (
          <MoodSquare
            key={m.id}
            mood={m}
            isSelected={m.id === selectedMoodId}
            moodColor={moodColor}
            moodBgColor={moodBgColor}
            onPress={() => onSelect(m)}
          />
        ))}
      </View>
    </View>
  )
}

// ---------- MoodGridModal ----------

type Props = {
  visible: boolean
  initialQuadrant: MoodCategoryKey | null
  initialMoodId: number | null
  moods: Mood[]
  onSelect: (mood: Mood) => void
  onDismiss: () => void
}

export function MoodGridModal({
  visible,
  initialQuadrant,
  initialMoodId,
  moods,
  onSelect,
  onDismiss,
}: Props) {
  const { bg, text, rule, accent, mood: moodTokens } = useTheme()
  const insets = useSafeAreaInsets()

  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)

  useEffect(() => {
    if (visible) {
      setSelectedMood(moods.find((m) => m.id === initialMoodId) ?? null)
    }
  }, [visible, initialMoodId, moods])

  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const startX = useSharedValue(0)
  const startY = useSharedValue(0)

  useEffect(() => {
    if (visible) {
      const { x, y } = initialOffset(initialQuadrant)
      translateX.value = x
      translateY.value = y
    }
  }, [visible, initialQuadrant, translateX, translateY])

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      cancelAnimation(translateX)
      cancelAnimation(translateY)
      startX.value = translateX.value
      startY.value = translateY.value
    })
    .onUpdate((e) => {
      translateX.value = Math.min(MAX_X, Math.max(MIN_X, startX.value + e.translationX))
      translateY.value = Math.min(MAX_Y, Math.max(MIN_Y, startY.value + e.translationY))
    })
    .onEnd((e) => {
      translateX.value = withDecay({ velocity: e.velocityX, clamp: [MIN_X, MAX_X] })
      translateY.value = withDecay({ velocity: e.velocityY, clamp: [MIN_Y, MAX_Y] })
    })

  const canvasStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }))

  const selectedMoodColor = selectedMood
    ? moodTokens[QUADRANT_META[selectedMood.quadrant].colorKey]
    : null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={styles.root}>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onDismiss} />

        {/* Sheet */}
        <View
          style={[
            styles.sheet,
            { backgroundColor: bg.surface, paddingBottom: insets.bottom },
          ]}
        >
          {/* Drag handle */}
          <View style={[styles.handle, { backgroundColor: rule.strong }]} />

          {/* Sheet header */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderLeft}>
              <Dateline style={styles.sheetDateline}>HOW DID IT FEEL?</Dateline>
              {selectedMood ? (
                <Text style={[styles.sheetMoodWord, { color: selectedMoodColor ?? undefined }]}>
                  {selectedMood.label}.
                </Text>
              ) : (
                <Text style={[styles.sheetPrompt, { color: text.secondary }]}>
                  Drag to explore · tap to pick
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={selectedMood ? () => onSelect(selectedMood) : onDismiss}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text
                style={[
                  styles.sheetAction,
                  { color: selectedMood ? accent.default : text.secondary },
                ]}
              >
                {selectedMood ? 'Done' : 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Axis label bar */}
          <View style={[styles.axisBar, { backgroundColor: bg.elevated, borderBottomColor: rule.default }]}>
            <View style={[styles.axisHalf, { borderRightWidth: 1, borderRightColor: rule.default }]}>
              <Text style={[styles.axisBarText, { color: text.tertiary }]}>← TOUGH</Text>
            </View>
            <View style={styles.axisHalf}>
              <Text style={[styles.axisBarText, { color: text.tertiary }]}>GOOD →</Text>
            </View>
          </View>

          {/* Pannable canvas */}
          <View style={styles.canvasViewport}>
            <GestureDetector gesture={panGesture}>
              <Animated.View style={[styles.canvas, canvasStyle]}>
                {/* Top row: high-energy quadrants */}
                <View style={styles.canvasRow}>
                  <QuadrantSection
                    quadrant="high-challenging"
                    moods={moods}
                    selectedMoodId={selectedMood?.id ?? null}
                    onSelect={(m) => setSelectedMood(m)}
                  />
                  <QuadrantSection
                    quadrant="high-pleasant"
                    moods={moods}
                    selectedMoodId={selectedMood?.id ?? null}
                    onSelect={(m) => setSelectedMood(m)}
                    borderLeft
                  />
                </View>

                {/* Horizontal axis divider */}
                <View
                  style={[
                    styles.axisDivider,
                    {
                      backgroundColor: bg.elevated,
                      borderTopColor: rule.default,
                      borderBottomColor: rule.default,
                    },
                  ]}
                >
                  <View style={[styles.axisDividerHalf, { borderRightWidth: 1, borderRightColor: rule.default }]}>
                    <Text style={[styles.axisDividerText, { color: text.tertiary }]}>HIGH ENERGY</Text>
                  </View>
                  <View style={styles.axisDividerHalf}>
                    <Text style={[styles.axisDividerText, { color: text.tertiary }]}>LOW ENERGY</Text>
                  </View>
                </View>

                {/* Bottom row: low-energy quadrants */}
                <View style={styles.canvasRow}>
                  <QuadrantSection
                    quadrant="low-challenging"
                    moods={moods}
                    selectedMoodId={selectedMood?.id ?? null}
                    onSelect={(m) => setSelectedMood(m)}
                  />
                  <QuadrantSection
                    quadrant="low-pleasant"
                    moods={moods}
                    selectedMoodId={selectedMood?.id ?? null}
                    onSelect={(m) => setSelectedMood(m)}
                    borderLeft
                  />
                </View>
              </Animated.View>
            </GestureDetector>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_H,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  handle: {
    width: 32,
    height: 3,
    borderRadius: 999,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  sheetHeaderLeft: {
    flex: 1,
    gap: 2,
  },
  sheetDateline: {
    fontSize: 9,
  },
  sheetMoodWord: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 22,
    lineHeight: 26,
  },
  sheetPrompt: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 15,
    lineHeight: 20,
  },
  sheetAction: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 2,
  },
  axisBar: {
    height: AXIS_ROW_H,
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  axisHalf: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  axisBarText: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 8,
    letterSpacing: 0.16 * 8,
  },
  canvasViewport: {
    flex: 1,
    overflow: 'hidden',
  },
  canvas: {
    width: CANVAS_W,
    height: CANVAS_H,
  },
  canvasRow: {
    flexDirection: 'row',
  },
  axisDivider: {
    height: AXIS_ROW_H,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  axisDividerHalf: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  axisDividerText: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 8,
    letterSpacing: 0.16 * 8,
  },
  quadrant: {
    width: QUADRANT_W,
    height: QUADRANT_H,
    padding: 14,
  },
  quadrantHeader: {
    gap: 2,
    marginBottom: 12,
  },
  quadrantLabel: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 9,
    letterSpacing: 0.16 * 9,
  },
  quadrantSublabel: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 12,
    lineHeight: 16,
  },
  squaresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: COL_GAP,
    rowGap: ROW_GAP,
  },
  moodSquare: {
    width: MOOD_SQUARE,
    height: MOOD_SQUARE,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  moodSquareText: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 12,
    textAlign: 'center',
  },
})
