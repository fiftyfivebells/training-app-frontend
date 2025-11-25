import React, { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/ThemeProvider'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  subtext?: string
  variant?: 'default' | 'accent'
}

export function StatCard({
  icon,
  label,
  value,
  subtext,
  variant = 'default',
}: StatCardProps) {
  const theme = useTheme()
  const isAccent = variant === 'accent'

  return (
    <View
      style={[
        theme.card.base,
        styles.card,
        isAccent && {
          backgroundColor: theme.semantic.surface.cardAlt,
          borderColor: theme.semantic.button.primary.bg,
        },
      ]}
    >
      <View style={{ marginBottom: theme.spacing.sm }}>{icon}</View>
      <ThemedText
        style={{
          fontSize: theme.typography.size.xxl,
          fontWeight: theme.typography.weights.bold,
          color: theme.semantic.text.primary,
          marginBottom: theme.spacing.xs,
        }}
      >
        {value}
      </ThemedText>
      <ThemedText
        style={{
          fontSize: theme.typography.size.sm,
          fontWeight: theme.typography.weights.medium,
          color: theme.semantic.text.secondary,
          textAlign: 'center',
        }}
      >
        {label}
      </ThemedText>
      {subtext && (
        <ThemedText
          style={{
            fontSize: theme.typography.size.xs,
            color: theme.semantic.text.secondary,
            marginTop: theme.spacing.xs,
            textAlign: 'center',
          }}
        >
          {subtext}
        </ThemedText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
  },
})
