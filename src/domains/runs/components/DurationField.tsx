import React from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'
import { ThemedTextInput } from '@/components/ui/ThemedTextInput'
import { useTheme } from '@/theme/ThemeProvider'

type DurationFieldProps = {
  hours: string
  minutes: string
  seconds: string
  onChangeHours: (value: string) => void
  onChangeMinutes: (value: string) => void
  onChangeSeconds: (value: string) => void
  normalizedLabel: string
}

export const DurationField: React.FC<DurationFieldProps> = ({
  hours,
  minutes,
  seconds,
  onChangeHours,
  onChangeMinutes,
  onChangeSeconds,
  normalizedLabel,
}) => {
  const theme = useTheme()

  return (
    <>
      <ThemedText
        style={{
          fontSize: theme.typography.size.sm,
          fontWeight: theme.typography.weights.semibold,
          marginBottom: theme.spacing.xs,
          color: theme.semantic.text.primary,
        }}
      >
        Duration
      </ThemedText>

      <View style={styles.durationContainer}>
        <View style={styles.timeRow}>
          <ThemedTextInput
            style={[
              styles.timeInput,
              getInputStyle(theme),
              { marginRight: theme.spacing.xs },
            ]}
            value={hours}
            onChangeText={onChangeHours}
            placeholder="HH"
            keyboardType="number-pad"
            maxLength={2}
          />
          <ThemedText
            style={{
              fontSize: theme.typography.size.lg,
              fontWeight: theme.typography.weights.semibold,
              color: theme.semantic.text.primary,
              marginHorizontal: theme.spacing.xs,
            }}
          >
            :
          </ThemedText>

          <ThemedTextInput
            style={[
              styles.timeInput,
              getInputStyle(theme),
              { marginRight: theme.spacing.xs },
            ]}
            value={minutes}
            onChangeText={onChangeMinutes}
            placeholder="MM"
            keyboardType="number-pad"
            maxLength={2}
          />
          <ThemedText
            style={{
              fontSize: theme.typography.size.lg,
              fontWeight: theme.typography.weights.semibold,
              color: theme.semantic.text.primary,
              marginHorizontal: theme.spacing.xs,
            }}
          >
            :
          </ThemedText>

          <ThemedTextInput
            style={[styles.timeInput, getInputStyle(theme)]}
            value={seconds}
            onChangeText={onChangeSeconds}
            placeholder="SS"
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>

        <View
          style={[
            styles.totalTimeWrapper,
            { marginLeft: theme.spacing.md },
          ]}
        >
          <ThemedText
            style={{
              fontSize: theme.typography.size.xs,
              color: theme.semantic.text.secondary,
              marginBottom: theme.spacing.xs / 2,
            }}
          >
            Total
          </ThemedText>
          <ThemedText
            style={{
              fontSize: theme.typography.size.md,
              fontWeight: theme.typography.weights.semibold,
              color: theme.semantic.text.primary,
            }}
          >
            {normalizedLabel}
          </ThemedText>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeInput: { width: 60, textAlign: 'center', borderWidth: 1 },
  totalTimeWrapper: { alignItems: 'flex-start' },
})

function getInputStyle(theme: ReturnType<typeof useTheme>) {
  return {
    borderColor: theme.semantic.border.default,
    backgroundColor: theme.semantic.surface.card,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    fontSize: theme.typography.size.md,
  }
}
