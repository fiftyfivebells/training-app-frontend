import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import type { Mood } from '@/domains/moods/moods.types'
import { useTheme } from '@/theme/useTheme'

type MoodSelectedBoxProps = {
  mood: Mood | null
  moodColor: string | null
  moodBgColor: string | null
  onPress: () => void
}

export function MoodSelectedBox({ mood, moodColor, moodBgColor, onPress }: MoodSelectedBoxProps) {
  const { text, rule, radius } = useTheme()

  if (!mood || !moodColor || !moodBgColor) {
    return (
      <TouchableOpacity
        style={[styles.moodBox, styles.moodBoxEmpty, { borderColor: rule.strong, borderRadius: radius.sm }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.moodBoxEmptyText, { color: text.tertiary }]}>
          Nothing yet — tap a type below
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      style={[
        styles.moodBox,
        styles.moodBoxSelected,
        { borderColor: moodColor, backgroundColor: moodBgColor, borderRadius: radius.sm },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.moodIcon, { borderColor: moodColor, borderRadius: radius.sm }]}>
        <View style={[styles.moodIconInner, { backgroundColor: moodColor, borderRadius: radius.xs }]} />
      </View>
      <View style={styles.moodBoxText}>
        <Text style={[styles.moodBoxWord, { color: moodColor }]}>{mood.label}</Text>
        <Text style={[styles.moodBoxDef, { color: moodColor }]}>{mood.description}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  moodBox: {
    minHeight: 44,
    justifyContent: 'center',
  },
  moodBoxEmpty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  moodBoxEmptyText: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 14,
  },
  moodBoxSelected: {
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moodIcon: {
    width: 36,
    height: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  moodIconInner: {
    width: 10,
    height: 10,
  },
  moodBoxText: {
    flex: 1,
    gap: 2,
  },
  moodBoxWord: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 22,
    lineHeight: 26,
  },
  moodBoxDef: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.04 * 10,
    opacity: 0.85,
  },
})
