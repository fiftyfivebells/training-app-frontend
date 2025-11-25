import React from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/ThemeProvider'

interface DailyAffirmationProps {
  affirmation: string
  blockName?: string
}

export function DailyAffirmation({ affirmation, blockName }: DailyAffirmationProps) {
  const theme = useTheme()

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.semantic.surface.cardAlt,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          borderLeftColor: theme.semantic.button.primary.bg,
        },
      ]}
    >
      <ThemedText
        style={{
          fontSize: theme.typography.size.lg,
          fontWeight: theme.typography.weights.medium,
          color: theme.semantic.text.primary,
          lineHeight: theme.typography.size.lg * 1.5,
          marginBottom: theme.spacing.xs,
        }}
      >
        {affirmation}
      </ThemedText>
      {blockName && (
        <ThemedText
          style={{
            fontSize: theme.typography.size.sm,
            color: theme.semantic.text.secondary,
            fontWeight: theme.typography.weights.medium,
          }}
        >
          {blockName}
        </ThemedText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { borderLeftWidth: 4 },
})
