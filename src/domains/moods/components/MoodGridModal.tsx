import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import type { Mood, MoodCategoryKey } from '@/domains/moods/moods.types'
import { QUADRANT_COLOR_KEY } from '@/domains/moods/moods.constants'
import { Dateline } from '@/components/ui'
import { useTheme } from '@/theme/useTheme'

// ---------- Canvas geometry ----------

const { width: DEVICE_W } = Dimensions.get('window')
const CANVAS_W = 504
const CANVAS_H = 812
const QUADRANT_H = 380
const AXIS_ROW_H = 32
const MIN_X = -(CANVAS_W - DEVICE_W)
const FRICTION = 0.88
const STOP_THRESHOLD = 0.3

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

// ---------- Focus positions ----------

function getFocusPan(
  quadrant: MoodCategoryKey,
  minY: number,
): { x: number; y: number } {
  switch (quadrant) {
    case 'high-challenging': return { x: 0,     y: 0    }
    case 'high-pleasant':    return { x: MIN_X, y: 0    }
    case 'low-challenging':  return { x: 0,     y: minY }
    case 'low-pleasant':     return { x: MIN_X, y: minY }
  }
}

// ---------- Quadrant labels ----------

const QUADRANT_LABEL: Record<MoodCategoryKey, string> = {
  'high-challenging': 'HIGH · TOUGH',
  'high-pleasant':    'HIGH · GOOD',
  'low-challenging':  'LOW · TOUGH',
  'low-pleasant':     'LOW · GOOD',
}

const QUADRANT_SUBTITLE: Record<MoodCategoryKey, string> = {
  'high-challenging': 'Hard work & grit',
  'high-pleasant':    'Energized & thriving',
  'low-challenging':  'Drained & heavy',
  'low-pleasant':     'Calm & restorative',
}

// ---------- WordRow ----------

type WordRowProps = {
  mood: Mood
  isSelected: boolean
  moodColor: string
  onPress: () => void
}

function WordRow({ mood, isSelected, moodColor, onPress }: WordRowProps) {
  const { text } = useTheme()
  const anim = useRef(new Animated.Value(isSelected ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isSelected ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [isSelected, anim])

  const fontSize = anim.interpolate({ inputRange: [0, 1], outputRange: [20, 26] })
  const paddingV = anim.interpolate({ inputRange: [0, 1], outputRange: [8, 10] })

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View
        style={[
          styles.wordRow,
          {
            backgroundColor: isSelected ? moodColor + '1F' : 'transparent',
            borderBottomColor: isSelected ? moodColor + '30' : 'rgba(255,255,255,0.05)',
          },
        ]}
      >
        <View
          style={[
            styles.wordSpine,
            { backgroundColor: isSelected ? moodColor : 'transparent' },
          ]}
        />
        <Animated.View
          style={[styles.wordContent, { paddingTop: paddingV, paddingBottom: paddingV }]}
        >
          <Animated.Text
            style={[
              styles.wordText,
              { fontSize, color: isSelected ? moodColor : text.primary },
            ]}
          >
            {mood.label}{isSelected ? '.' : ''}
          </Animated.Text>
          {isSelected && mood.description ? (
            <Text style={[styles.wordDef, { color: moodColor, opacity: 0.8 }]}>
              {mood.description}
            </Text>
          ) : null}
        </Animated.View>
      </View>
    </TouchableOpacity>
  )
}

// ---------- QuadrantSection ----------

type QuadrantSectionProps = {
  quadrant: MoodCategoryKey
  moods: Mood[]
  selectedMoodId: number | null
  onSelect: (mood: Mood) => void
}

function QuadrantSection({ quadrant, moods, selectedMoodId, onSelect }: QuadrantSectionProps) {
  const { text, rule, moodBg, mood: moodTokens } = useTheme()
  const colorKey = QUADRANT_COLOR_KEY[quadrant]
  const moodColor = moodTokens[colorKey]

  const sorted = useMemo(
    () =>
      moods
        .filter((m) => m.quadrant === quadrant)
        .sort((a, b) =>
          b.experienceQuality !== a.experienceQuality
            ? b.experienceQuality - a.experienceQuality
            : b.energyLevel - a.energyLevel,
        ),
    [moods, quadrant],
  )

  return (
    <View
      style={[
        styles.quadrant,
        {
          backgroundColor: moodBg[colorKey],
          borderRightWidth: quadrant === 'high-challenging' || quadrant === 'low-challenging' ? 1 : 0,
          borderRightColor: rule.default,
        },
      ]}
    >
      <View style={styles.quadrantHeader}>
        <Dateline style={{ color: moodColor }}>{QUADRANT_LABEL[quadrant]}</Dateline>
        <Text style={[styles.quadrantSubtitle, { color: text.secondary }]}>
          {QUADRANT_SUBTITLE[quadrant]}
        </Text>
      </View>
      {sorted.map((m) => (
        <WordRow
          key={m.id}
          mood={m}
          isSelected={m.id === selectedMoodId}
          moodColor={moodColor}
          onPress={() => onSelect(m)}
        />
      ))}
    </View>
  )
}

// ---------- MoodGridModal ----------

type MoodGridModalProps = {
  visible: boolean
  focusQuadrant: MoodCategoryKey | null
  initialMoodId: number | null
  onSelect: (mood: Mood) => void
  onDismiss: () => void
}

export function MoodGridModal({
  visible,
  focusQuadrant,
  initialMoodId,
  onSelect,
  onDismiss,
}: MoodGridModalProps) {
  const { bg, text, rule, mood: moodTokens } = useTheme()
  const insets = useSafeAreaInsets()

  const { data: moods = [] } = useGetAllMoods()

  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)

  // Sync selection and snap canvas on open
  useEffect(() => {
    if (visible) {
      const initial = moods.find((m) => m.id === initialMoodId) ?? null
      setSelectedMood(initial)
      const snap = focusQuadrant ? getFocusPan(focusQuadrant, minYRef.current) : { x: 0, y: 0 }
      posRef.current = snap
      panXAnim.setValue(snap.x)
      panYAnim.setValue(snap.y)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  // Canvas pan state
  const minYRef = useRef(-(CANVAS_H - 576))
  const viewportHRef = useRef(576)
  const canvasHRef = useRef(CANVAS_H)
  const panXAnim = useRef(new Animated.Value(0)).current
  const panYAnim = useRef(new Animated.Value(0)).current
  const posRef = useRef({ x: 0, y: 0 })
  const offsetRef = useRef({ x: 0, y: 0 })
  const velRef = useRef({ x: 0, y: 0 })
  const lastMoveRef = useRef({ x: 0, y: 0, time: 0 })
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null)

  function updateMinY() {
    minYRef.current = Math.min(0, -(canvasHRef.current - viewportHRef.current))
  }

  function onViewportLayout(e: { nativeEvent: { layout: { height: number } } }) {
    viewportHRef.current = e.nativeEvent.layout.height
    updateMinY()
  }

  function onCanvasLayout(e: { nativeEvent: { layout: { height: number } } }) {
    canvasHRef.current = e.nativeEvent.layout.height
    updateMinY()
  }

  function stopMomentum() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  function startMomentum() {
    const loop = () => {
      velRef.current.x *= FRICTION
      velRef.current.y *= FRICTION
      if (
        Math.abs(velRef.current.x) < STOP_THRESHOLD &&
        Math.abs(velRef.current.y) < STOP_THRESHOLD
      ) {
        rafRef.current = null
        return
      }
      const nx = clamp(posRef.current.x + velRef.current.x, MIN_X, 0)
      const ny = clamp(posRef.current.y + velRef.current.y, minYRef.current, 0)
      posRef.current = { x: nx, y: ny }
      panXAnim.setValue(nx)
      panYAnim.setValue(ny)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
      onPanResponderGrant: () => {
        stopMomentum()
        offsetRef.current = { x: posRef.current.x, y: posRef.current.y }
        lastMoveRef.current = { x: posRef.current.x, y: posRef.current.y, time: Date.now() }
        velRef.current = { x: 0, y: 0 }
      },
      onPanResponderMove: (_, gs) => {
        const now = Date.now()
        const nx = clamp(offsetRef.current.x + gs.dx, MIN_X, 0)
        const ny = clamp(offsetRef.current.y + gs.dy, minYRef.current, 0)
        const dt = Math.max(now - lastMoveRef.current.time, 1)
        velRef.current = {
          x: ((nx - lastMoveRef.current.x) / dt) * 16.67,
          y: ((ny - lastMoveRef.current.y) / dt) * 16.67,
        }
        lastMoveRef.current = { x: nx, y: ny, time: now }
        posRef.current = { x: nx, y: ny }
        panXAnim.setValue(nx)
        panYAnim.setValue(ny)
      },
      onPanResponderRelease: () => startMomentum(),
      onPanResponderTerminate: () => stopMomentum(),
    }),
  ).current

  // Header background animation
  const headerBgOpacity = useRef(new Animated.Value(0)).current
  const [headerBgColor, setHeaderBgColor] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (selectedMood) {
      const colorKey = QUADRANT_COLOR_KEY[selectedMood.quadrant]
      setHeaderBgColor(moodTokens[colorKey] + '1A')
      Animated.timing(headerBgOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(headerBgOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [selectedMood, headerBgOpacity, moodTokens])

  const selectedMoodColor = selectedMood
    ? moodTokens[QUADRANT_COLOR_KEY[selectedMood.quadrant]]
    : null

  const canvasStyle = {
    transform: [
      { translateX: panXAnim },
      { translateY: panYAnim },
    ],
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.root}>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onDismiss} />

        {/* Sheet */}
        <View
          style={[
            styles.sheet,
            { backgroundColor: bg.base, paddingBottom: insets.bottom, top: insets.top + 10 },
          ]}
        >
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: rule.strong }]} />

          {/* Header */}
          <View style={styles.headerWrap}>
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: headerBgColor, opacity: headerBgOpacity },
              ]}
              pointerEvents="none"
            />
            <View style={styles.headerInner}>
              <View style={styles.headerLeft}>
                <Dateline>HOW DID IT FEEL?</Dateline>
                {selectedMood ? (
                  <Text style={[styles.selectedWord, { color: selectedMoodColor ?? text.primary }]}>
                    {selectedMood.label}.
                  </Text>
                ) : (
                  <Text style={[styles.placeholder, { color: text.secondary }]}>
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
                    styles.doneBtn,
                    { color: selectedMood ? (selectedMoodColor ?? text.secondary) : text.secondary },
                  ]}
                >
                  {selectedMood ? 'Done' : 'Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Axis label bar */}
          <View
            style={[
              styles.axisBar,
              { backgroundColor: bg.elevated, borderBottomColor: rule.default },
            ]}
          >
            <View style={[styles.axisHalf, { borderRightWidth: 1, borderRightColor: rule.default }]}>
              <Text style={[styles.axisBarText, { color: text.tertiary }]}>← TOUGH</Text>
            </View>
            <View style={styles.axisHalf}>
              <Text style={[styles.axisBarText, { color: text.tertiary }]}>GOOD →</Text>
            </View>
          </View>

          {/* Pannable viewport */}
          <View style={styles.viewport} onLayout={onViewportLayout} {...panResponder.panHandlers}>
            <Animated.View style={[styles.canvas, canvasStyle]} onLayout={onCanvasLayout}>
              {/* Top row — high energy */}
              <View style={styles.canvasRow}>
                <QuadrantSection
                  quadrant="high-challenging"
                  moods={moods}
                  selectedMoodId={selectedMood?.id ?? null}
                  onSelect={setSelectedMood}
                />
                <QuadrantSection
                  quadrant="high-pleasant"
                  moods={moods}
                  selectedMoodId={selectedMood?.id ?? null}
                  onSelect={setSelectedMood}
                />
              </View>

              {/* Axis divider */}
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
                <View
                  style={[
                    styles.axisDividerHalf,
                    { borderRightWidth: 1, borderRightColor: rule.default },
                  ]}
                >
                  <Text style={[styles.axisDividerText, { color: text.tertiary }]}>↑ HIGH ENERGY</Text>
                </View>
                <View style={styles.axisDividerHalf}>
                  <Text style={[styles.axisDividerText, { color: text.tertiary }]}>↓ LOW ENERGY</Text>
                </View>
              </View>

              {/* Bottom row — low energy */}
              <View style={styles.canvasRow}>
                <QuadrantSection
                  quadrant="low-challenging"
                  moods={moods}
                  selectedMoodId={selectedMood?.id ?? null}
                  onSelect={setSelectedMood}
                />
                <QuadrantSection
                  quadrant="low-pleasant"
                  moods={moods}
                  selectedMoodId={selectedMood?.id ?? null}
                  onSelect={setSelectedMood}
                />
              </View>
            </Animated.View>

            {/* Right edge hint */}
            <LinearGradient
              colors={[`${bg.base}00`, `${bg.base}80`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.edgeRight}
              pointerEvents="none"
            />

            {/* Bottom edge hint */}
            <LinearGradient
              colors={[`${bg.base}00`, `${bg.base}66`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.edgeBottom}
              pointerEvents="none"
            />
          </View>
        </View>
      </View>
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
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
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
  headerWrap: {
    overflow: 'hidden',
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    minHeight: 72,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
    marginRight: 12,
  },
  selectedWord: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 24,
    lineHeight: 30,
  },
  placeholder: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 15,
    lineHeight: 20,
  },
  doneBtn: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 15,
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
  viewport: {
    flex: 1,
    overflow: 'hidden',
  },
  canvas: {
    width: CANVAS_W,
  },
  canvasRow: {
    flexDirection: 'row',
  },
  quadrant: {
    width: 252,
    minHeight: QUADRANT_H,
    paddingTop: 14,
    paddingBottom: 14,
  },
  quadrantHeader: {
    paddingHorizontal: 14,
    paddingBottom: 6,
    gap: 3,
  },
  quadrantSubtitle: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 13,
    lineHeight: 17,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
  },
  wordSpine: {
    width: 3,
    borderRadius: 2,
  },
  wordContent: {
    flex: 1,
    paddingHorizontal: 14,
  },
  wordText: {
    fontFamily: 'Fraunces_400Regular_Italic',
    lineHeight: 28,
  },
  wordDef: {
    fontFamily: 'Manrope',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
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
  edgeRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 40,
  },
  edgeBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
  },
})
