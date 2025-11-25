import { Picker } from '@react-native-picker/picker'
import { Platform, StyleSheet, View } from 'react-native'

import { useTheme } from '@/theme/ThemeProvider'

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
  const theme = useTheme()

  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <ThemedText
        style={{
          fontSize: theme.typography.size.sm,
          fontWeight: theme.typography.weights.medium,
          color: theme.semantic.text.primary,
          marginBottom: theme.spacing.xs,
        }}
      >
        {label}
      </ThemedText>
      <View
        style={[
          styles.selectContainer,
          {
            backgroundColor: theme.semantic.surface.card,
            borderColor: theme.semantic.border.default,
            borderRadius: theme.radius.md,
          },
          disabled && {
            backgroundColor: theme.semantic.surface.cardAlt,
            opacity: 0.6,
          },
          error && {
            borderColor: theme.semantic.mood.highTough.border,
            borderWidth: 2,
          },
        ]}
      >
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          enabled={!disabled}
          style={[
            styles.picker,
            Platform.OS === 'ios' ? styles.pickerIOS : styles.pickerAndroid,
            { color: theme.semantic.text.primary },
          ]}
        >
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>
      {error && (
        <ThemedText
          style={{
            fontSize: theme.typography.size.xs,
            color: theme.semantic.mood.highTough.text,
            marginTop: theme.spacing.xs,
          }}
        >
          {error}
        </ThemedText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  selectContainer: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
  },
  pickerIOS: {
    height: 150,
  },
  pickerAndroid: {
    height: 50,
  },
})
