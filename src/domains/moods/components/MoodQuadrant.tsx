import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import type { MoodCategoryKey } from '../moods.types'
import type { MoodCategory } from '../moods.constants'
import { colors } from '@/theme/colors'

import { ThemedText } from '@/components/ui/ThemedText'

type MoodQuadrantProps = {
  category: MoodCategory
  isSelected: boolean
  onPress: () => void
}

const quadrantEmoji: Record<MoodCategoryKey, string> = {
  'high-pleasant': '⚡️😊',
  'high-challenging': '⚡️😓',
  'low-pleasant': '😌✨',
  'low-challenging': '😴😞',
}

// Map your MoodCategoryKey -> theme colors
const quadrantPalette: Record<
  MoodCategoryKey,
  { bg: string; border: string; text: string }
> = {
  'high-pleasant': {
    bg: colors.mood.highGreat.bg,
    border: colors.mood.highGreat.border,
    text: colors.mood.highGreat.text,
  },
  'high-challenging': {
    bg: colors.mood.highTough.bg,
    border: colors.mood.highTough.border,
    text: colors.mood.highTough.text,
  },
  'low-pleasant': {
    bg: colors.mood.lowGreat.bg,
    border: colors.mood.lowGreat.border,
    text: colors.mood.lowGreat.text,
  },
  'low-challenging': {
    bg: colors.mood.lowTough.bg,
    border: colors.mood.lowTough.border,
    text: colors.mood.lowTough.text,
  },
}

export const MoodQuadrant: React.FC<MoodQuadrantProps> = ({
  category,
  isSelected,
  onPress,
}) => {
  const emoji = quadrantEmoji[category.key]
  const palette = quadrantPalette[category.key]

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
        },
        isSelected && styles.containerSelected,
        pressed && styles.containerPressed,
      ]}
    >
      <View style={styles.emojiWrapper}>
        <ThemedText style={styles.emoji}>{emoji}</ThemedText>
      </View>
      <ThemedText style={[styles.title, { color: palette.text }]}>
        {category.title}
      </ThemedText>
      <ThemedText style={[styles.description, { color: palette.text }]}>
        {category.description}
      </ThemedText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerSelected: {
    borderWidth: 3,
    transform: [{ scale: 1.02 }],
  },
  containerPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  emojiWrapper: {
    marginBottom: 8,
  },
  emoji: {
    fontSize: 32,
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    textAlign: 'center',
    fontSize: 14,
  },
})
