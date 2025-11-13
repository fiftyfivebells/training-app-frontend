import { colors, spacing, typography } from '@theme/index'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'

interface DailyAffirmationProps {
  affirmation: string
  blockName?: string
}

export function DailyAffirmation({ affirmation, blockName }: DailyAffirmationProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.affirmation}>{affirmation}</ThemedText>
      {blockName && <ThemedText style={styles.blockName}>{blockName}</ThemedText>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary.DEFAULT + '15',
    borderRadius: 12,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.DEFAULT,
  },
  affirmation: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.charcoal,
    lineHeight: typography.sizes.lg * 1.5,
    marginBottom: spacing.xs,
  },
  blockName: {
    fontSize: typography.sizes.sm,
    color: colors.stone.DEFAULT,
    fontWeight: typography.weights.medium,
  },
})
