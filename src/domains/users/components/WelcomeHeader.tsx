import { colors, spacing, typography } from '@theme/index'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

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
      <Text style={styles.greeting}>Welcome back, {userName}!</Text>
      {currentBlock && (
        <Text style={styles.blockInfo}>
          {currentBlock.name} • {currentBlock.daysRemaining} days remaining
        </Text>
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
