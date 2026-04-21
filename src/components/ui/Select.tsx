import { Picker } from '@react-native-picker/picker'
import { Platform, StyleSheet, View } from 'react-native'

import { useTheme } from '@/theme/useTheme'

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
  const { colors, space, radius } = useTheme()

  return (
    <View style={{ marginBottom: space[4] }}>
      <ThemedText
        style={{
          fontSize: 13,
          fontWeight: '500',
          color: colors.text.primary,
          marginBottom: space[1],
        }}
      >
        {label}
      </ThemedText>
      <View
        style={[
          styles.selectContainer,
          {
            backgroundColor: colors.background.surface,
            borderColor: colors.border.default,
            borderRadius: radius.md,
          },
          disabled && {
            backgroundColor: colors.background.input,
            opacity: 0.6,
          },
          error && {
            borderColor: colors.mood.highTough,
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
            { color: colors.text.primary },
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
            fontSize: 12,
            color: colors.mood.highTough,
            marginTop: space[1],
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
