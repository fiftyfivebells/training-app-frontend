import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'
import { getMoodToken } from '@/domains/moods/utils/mood'
import { useTheme } from '@/theme/ThemeProvider'

import type { MoodCategory } from '../moods.constants'
import type { MoodCategoryKey } from '../moods.types'

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

export const MoodQuadrant: React.FC<MoodQuadrantProps> = ({
  category,
  isSelected,
  onPress,
}) => {
  const theme = useTheme()
  const emoji = quadrantEmoji[category.key]
  const palette = getMoodToken(theme, category.key)

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: palette?.bg ?? theme.semantic.surface.card,
          borderColor: palette?.border ?? theme.semantic.border.default,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
        },
        isSelected && {
          borderWidth: 3,
          transform: [{ scale: 1.03 }],
          shadowColor: palette?.border,
          shadowOpacity: 0.25,
          shadowRadius: 12,
        },
        pressed && {
          opacity: 0.9,
          transform: [{ scale: 0.97 }],
        },
      ]}
    >
      <View style={{ marginBottom: theme.spacing.sm }}>
        <ThemedText style={{ fontSize: theme.typography.size.xxxl }}>{emoji}</ThemedText>
      </View>
      <ThemedText
        style={{
          textAlign: 'center',
          fontSize: theme.typography.size.md,
          fontWeight: theme.typography.weights.semibold,
          marginBottom: theme.spacing.xs,
          color: palette?.text ?? theme.semantic.text.primary,
        }}
      >
        {category.title}
      </ThemedText>
      <ThemedText
        style={{
          textAlign: 'center',
          fontSize: theme.typography.size.sm,
          color: palette?.text ?? theme.semantic.text.secondary,
        }}
      >
        {category.description}
      </ThemedText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
