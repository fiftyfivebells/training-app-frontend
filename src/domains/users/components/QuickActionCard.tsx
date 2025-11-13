import { colors, spacing, typography } from '@theme/index'
import React, { ReactNode } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'

interface QuickActionCardProps {
  icon: ReactNode
  label: string
  description: string
  onPress: () => void
}

export function QuickActionCard({
  icon,
  label,
  description,
  onPress,
}: QuickActionCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.content}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <ThemedText style={styles.description}>{description}</ThemedText>
      </View>
      <ThemedText style={styles.arrow}>›</ThemedText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.sand,
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.DEFAULT + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.charcoal,
    marginBottom: spacing.xs / 2,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.stone.DEFAULT,
  },
  arrow: {
    fontSize: typography.sizes['3xl'],
    color: colors.stone.DEFAULT,
  },
})
