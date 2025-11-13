import { colors, spacing, typography } from '@theme/index'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'

interface WelcomeHeaderProps {
  userName: string
  currentBlock?: {
    name: string
    daysRemaining: number
  }
}

export function WelcomeHeader({ userName, currentBlock }: WelcomeHeaderProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.greeting}>Welcome back, {userName}!</ThemedText>
      {currentBlock && (
        <ThemedText style={styles.blockInfo}>
          {currentBlock.name} • {currentBlock.daysRemaining} days remaining
        </ThemedText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.brown.DEFAULT,
    marginBottom: spacing.xs,
  },
  blockInfo: {
    fontSize: typography.sizes.base,
    color: colors.stone.DEFAULT,
    fontWeight: typography.weights.medium,
  },
})
