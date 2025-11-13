import React from 'react'
import { View, StyleSheet } from 'react-native'
import type { Mood } from '../moods.types'
import type { MoodCategoryKey } from '../moods.types'
import { colors } from '@/theme/colors'

import { ThemedText } from '@/components/ui/ThemedText'

const quadrantEmoji: Record<MoodCategoryKey, string> = {
  'high-pleasant': '⚡️😊',
  'high-challenging': '⚡️😓',
  'low-pleasant': '😌✨',
  'low-challenging': '😴😞',
}

const quadrantPalette: Record<
  MoodCategoryKey,
  { bg: string; border: string; text: string }
> = {
  'high-pleasant': colors.mood.highGreat,
  'high-challenging': colors.mood.highTough,
  'low-pleasant': colors.mood.lowGreat,
  'low-challenging': colors.mood.lowTough,
}

type Props = {
  mood: Mood
}

export const MoodSelectedChip: React.FC<Props> = ({ mood }) => {
  const palette = quadrantPalette[mood.quadrant]
  const emoji = quadrantEmoji[mood.quadrant]

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.bg, borderColor: palette.border },
      ]}
    >
      <ThemedText style={[styles.emoji]}>{emoji}</ThemedText>
      <ThemedText style={[styles.label, { color: palette.text }]}>
        {mood.label}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
})
