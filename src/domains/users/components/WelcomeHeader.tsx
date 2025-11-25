import React from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/ThemeProvider'

interface WelcomeHeaderProps {
  userName: string
  currentBlock?: {
    name: string
    daysRemaining: number
  }
}

export function WelcomeHeader({ userName, currentBlock }: WelcomeHeaderProps) {
  const theme = useTheme()

  return (
    <View style={[styles.container, { marginBottom: theme.spacing.lg }]}>
      <ThemedText
        style={{
          fontSize: theme.typography.size.xxxl,
          fontWeight: theme.typography.weights.bold,
          color: theme.semantic.text.primary,
          marginBottom: theme.spacing.xs,
        }}
      >
        Welcome back, {userName}!
      </ThemedText>
      {currentBlock && (
        <ThemedText
          style={{
            fontSize: theme.typography.size.md,
            color: theme.semantic.text.secondary,
            fontWeight: theme.typography.weights.medium,
          }}
        >
          {currentBlock.name} • {currentBlock.daysRemaining} days remaining
        </ThemedText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
})
