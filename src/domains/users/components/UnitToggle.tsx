import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/ThemeProvider'

import type { DistanceUnitPreference } from '../hooks/useDistanceUnitPreference'

const OPTIONS: { label: string; value: DistanceUnitPreference }[] = [
  { label: 'Imperial (mi)', value: 'imperial' },
  { label: 'Metric (km)', value: 'metric' },
]

export function UnitToggle({
  value,
  onChange,
}: {
  value: DistanceUnitPreference
  onChange: (unit: DistanceUnitPreference) => void
}) {
  const theme = useTheme()

  return (
    <View
      style={[
        styles.toggleRow,
        {
          backgroundColor: theme.semantic.surface.cardAlt,
          borderRadius: theme.radius.md,
          borderColor: theme.semantic.border.default,
          padding: theme.spacing.xs,
        },
      ]}
    >
      {OPTIONS.map((option) => {
        const active = value === option.value
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.toggleOption,
              {
                borderRadius: theme.radius.sm,
                paddingVertical: theme.spacing.sm,
              },
              active && {
                backgroundColor: theme.semantic.surface.card,
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 1 },
                elevation: 2,
              },
            ]}
          >
            <ThemedText
              style={{
                fontSize: theme.typography.size.sm,
                fontWeight: active
                  ? theme.typography.weights.semibold
                  : theme.typography.weights.regular,
                color: active ? theme.semantic.text.primary : theme.semantic.text.secondary,
                textAlign: 'center',
              }}
            >
              {option.label}
            </ThemedText>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    borderWidth: 1,
  },
  toggleOption: {
    flex: 1,
  },
})
