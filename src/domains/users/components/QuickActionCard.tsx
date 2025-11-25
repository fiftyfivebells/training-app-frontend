import React, { ReactNode } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/ThemeProvider'

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
  const theme = useTheme()

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.semantic.surface.card,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
          borderColor: theme.semantic.border.default,
          marginBottom: theme.spacing.md,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconWrapper,
          {
            borderRadius: theme.radius.full,
            backgroundColor: theme.semantic.surface.cardAlt,
            marginRight: theme.spacing.md,
          },
        ]}
      >
        {icon}
      </View>
      <View style={styles.content}>
        <ThemedText
          style={{
            fontSize: theme.typography.size.md,
            fontWeight: theme.typography.weights.semibold,
            color: theme.semantic.text.primary,
            marginBottom: theme.spacing.xs / 2,
          }}
        >
          {label}
        </ThemedText>
        <ThemedText
          style={{
            fontSize: theme.typography.size.sm,
            color: theme.semantic.text.secondary,
          }}
        >
          {description}
        </ThemedText>
      </View>
      <ThemedText
        style={{
          fontSize: theme.typography.size.xxxl,
          color: theme.semantic.text.secondary,
        }}
      >
        ›
      </ThemedText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
})
