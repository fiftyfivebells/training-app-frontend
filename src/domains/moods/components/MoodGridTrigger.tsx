import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import type { Mood, MoodCategoryKey } from '@/domains/moods/moods.types'
import { QUADRANT_COLOR_KEY } from '@/domains/moods/moods.constants'
import { useTheme } from '@/theme/useTheme'
import { Dateline } from '@/components/ui'

// ---------- Zone config ----------

const ZONE_KEYS: MoodCategoryKey[] = [
  'high-challenging',
  'high-pleasant',
  'low-challenging',
  'low-pleasant',
]

const ZONE_LABEL: Record<MoodCategoryKey, string> = {
  'high-challenging': 'HIGH · TOUGH',
  'high-pleasant':    'HIGH · GOOD',
  'low-challenging':  'LOW · TOUGH',
  'low-pleasant':     'LOW · GOOD',
}

const ZONE_SUBTITLES: Record<MoodCategoryKey, string> = {
  'high-challenging': 'Hard work & grit',
  'high-pleasant':    'Energized & thriving',
  'low-challenging':  'Drained & heavy',
  'low-pleasant':     'Calm & restorative',
}

// ---------- MoodGridTrigger ----------

type MoodGridTriggerProps = {
  selectedMood: Mood | null
  onZoneTap: (quadrant: MoodCategoryKey) => void
  onChangeTap: () => void
}

export function MoodGridTrigger({ selectedMood, onZoneTap, onChangeTap }: MoodGridTriggerProps) {
  const { text, rule, mood: moodTokens, moodBg, radius } = useTheme()

  const selectedColorKey = selectedMood ? QUADRANT_COLOR_KEY[selectedMood.quadrant] : null
  const selectedColor = selectedColorKey ? moodTokens[selectedColorKey] : null
  const selectedBg = selectedColorKey ? moodBg[selectedColorKey] : null

  return (
    <View style={styles.container}>
      <Dateline style={{ marginBottom: 10 }}>HOW DID IT FEEL?</Dateline>

      {/* Selected / placeholder card */}
      {selectedMood && selectedColor && selectedBg ? (
        <TouchableOpacity
          onPress={onChangeTap}
          activeOpacity={0.8}
          style={[
            styles.selectedCard,
            {
              borderColor: selectedColor,
              backgroundColor: selectedBg,
              borderRadius: radius.sm,
            },
          ]}
        >
          <View style={styles.selectedCardLeft}>
            <Text style={[styles.selectedWord, { color: selectedColor }]}>
              {selectedMood.label}.
            </Text>
            {selectedMood.description ? (
              <Text style={[styles.selectedDef, { color: selectedColor }]}>
                {selectedMood.description}
              </Text>
            ) : null}
          </View>
          <Text style={[styles.changeCta, { color: selectedColor }]}>tap to change</Text>
        </TouchableOpacity>
      ) : (
        <View
          style={[
            styles.placeholderCard,
            { borderColor: rule.strong, borderRadius: radius.sm },
          ]}
        >
          <Text style={[styles.placeholderText, { color: text.tertiary }]}>
            Nothing yet — tap a zone below
          </Text>
        </View>
      )}

      {/* 2×2 zone grid */}
      <View style={styles.zoneGrid}>
        {ZONE_KEYS.map((quadrant) => {
          const colorKey = QUADRANT_COLOR_KEY[quadrant]
          const moodColor = moodTokens[colorKey]
          const isActive = selectedMood?.quadrant === quadrant
          return (
            <TouchableOpacity
              key={quadrant}
              onPress={() => onZoneTap(quadrant)}
              activeOpacity={0.7}
              style={[
                styles.zoneCard,
                {
                  backgroundColor: isActive ? moodColor + '24' : moodColor + '0A',
                  borderColor: isActive ? moodColor : rule.default,
                  borderWidth: isActive ? 2 : 1,
                  borderRadius: 4,
                },
              ]}
            >
              <Dateline style={{ color: isActive ? moodColor : text.tertiary, marginBottom: 2 }}>
                {ZONE_LABEL[quadrant]}
              </Dateline>
              <Text
                style={[
                  styles.zoneSubtitle,
                  { color: isActive ? moodColor : text.secondary },
                ]}
              >
                {ZONE_SUBTITLES[quadrant]}
              </Text>
              <View
                style={[
                  styles.zoneColorBar,
                  { backgroundColor: isActive ? moodColor : moodColor + '40' },
                ]}
              />
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Axis labels */}
      <View style={styles.axisRow}>
        <Text style={[styles.axisLabel, { color: text.tertiary }]}>← TOUGH</Text>
        <Text style={[styles.axisLabel, { color: text.tertiary }]}>GOOD →</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  // Selected card
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectedCardLeft: {
    flex: 1,
    gap: 3,
    marginRight: 12,
  },
  selectedWord: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 24,
    lineHeight: 28,
  },
  selectedDef: {
    fontFamily: 'Manrope',
    fontSize: 10,
    lineHeight: 14,
    opacity: 0.75,
  },
  changeCta: {
    fontFamily: 'Manrope',
    fontSize: 10,
    opacity: 0.6,
    flexShrink: 0,
  },
  // Placeholder card
  placeholderCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 15,
  },
  // Zone grid
  zoneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  zoneCard: {
    width: '47.5%',
    paddingTop: 14,
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 4,
  },
  zoneSubtitle: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 18,
    lineHeight: 22,
  },
  zoneColorBar: {
    height: 2,
    borderRadius: 1,
    marginTop: 4,
  },
  // Axis
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  axisLabel: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 9,
    letterSpacing: 0.12 * 9,
  },
})
