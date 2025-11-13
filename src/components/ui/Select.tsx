import { Picker } from '@react-native-picker/picker'
import { colors, spacing, typography } from '@theme/index'
import { Platform, StyleSheet, View } from 'react-native'

import { ThemedText } from './ThemedText'

export interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  disabled?: boolean
  error?: string
}

export function Select({
  label,
  value,
  onValueChange,
  options,
  disabled,
  error,
}: SelectProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View
        style={[
          styles.pickerContainer,
          disabled && styles.pickerDisabled,
          error && styles.pickerError,
        ]}
      >
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          enabled={!disabled}
          style={styles.picker}
        >
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  pickerContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pickerDisabled: {
    backgroundColor: colors.sand,
    opacity: 0.6,
  },
  pickerError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  picker: {
    height: Platform.OS === 'ios' ? 150 : 50,
    color: colors.charcoal,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
})
