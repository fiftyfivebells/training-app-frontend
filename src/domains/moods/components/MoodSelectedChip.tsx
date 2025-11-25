import React from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'
import { getMoodToken } from '@/domains/moods/utils/mood'
import { useTheme } from '@/theme/ThemeProvider'

import type { Mood, MoodCategoryKey } from '../moods.types'

const quadrantEmoji: Record<MoodCategoryKey, string> = {
  'high-pleasant': '⚡️😊',
  'high-challenging': '⚡️😓',
  'low-pleasant': '😌✨',
  'low-challenging': '😴😞',
}

type Props = {
  mood: Mood
}

export const MoodSelectedChip: React.FC<Props> = ({ mood }) => {
  const theme = useTheme()
  const palette = getMoodToken(theme, mood.quadrant)
  const emoji = quadrantEmoji[mood.quadrant]

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette?.bg ?? theme.semantic.surface.card,
          borderColor: palette?.border ?? theme.semantic.border.default,
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.md,
          marginTop: theme.spacing.sm,
        },
      ]}
    >
      <ThemedText
        style={{
          fontSize: theme.typography.size.lg,
          marginRight: theme.spacing.xs,
        }}
      >
        {emoji}
      </ThemedText>
      <ThemedText
        style={[
          {
            fontSize: theme.typography.size.sm,
            fontWeight: theme.typography.weights.semibold,
          },
          { color: palette?.text ?? theme.semantic.text.primary },
        ]}
      >
        {mood.label}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
})
