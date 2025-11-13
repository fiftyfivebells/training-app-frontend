import DateTimePicker, {
  type AndroidNativeProps,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker'
import { colors, spacing, typography } from '@theme/index'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Platform,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native'

import { Button } from './Button'

export interface DatePickerProps {
  label?: string
  value?: Date | null
  onChange: (date: Date) => void
  minimumDate?: Date
  maximumDate?: Date
  disabled?: boolean
  error?: string
  helperText?: string
  placeholder?: string
  displayFormatOptions?: Intl.DateTimeFormatOptions
  confirmLabel?: string
  mode?: AndroidNativeProps['mode']
  style?: StyleProp<ViewStyle>
}

const defaultFormat: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}

export function DatePicker({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  disabled = false,
  error,
  helperText,
  placeholder = 'Select a date',
  displayFormatOptions = defaultFormat,
  confirmLabel = 'Done',
  mode = 'date',
  style,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const isWeb = Platform.OS === 'web'
  const [webInputValue, setWebInputValue] = useState(() =>
    value ? formatDateForInput(value) : '',
  )
  const isEditingWebInput = useRef(false)

  const formatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, displayFormatOptions),
    [displayFormatOptions],
  )

  const selectedDate = value ?? new Date()
  const hasValue = Boolean(value)
  const formattedValue = hasValue ? formatter.format(selectedDate) : placeholder

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false)
    }

    if (event.type === 'dismissed') {
      return
    }

    if (selected) {
      onChange(selected)
    }
  }

  useEffect(() => {
    if (!isWeb) {
      return
    }
    if (isEditingWebInput.current) {
      return
    }
    setWebInputValue(value ? formatDateForInput(value) : '')
  }, [value, isWeb])

  const handleWebInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    setWebInputValue(nextValue)
    if (isCompleteDateInput(nextValue)) {
      onChange(parseInputDate(nextValue))
    }
  }

  const handleWebInputBlur = () => {
    isEditingWebInput.current = false
    if (!isCompleteDateInput(webInputValue)) {
      setWebInputValue(value ? formatDateForInput(value) : '')
    }
  }

  const handleWebInputFocus = () => {
    isEditingWebInput.current = true
  }

  return (
    <View style={style}>
      {label && <Text style={styles.label}>{label}</Text>}
      {isWeb ? (
        <input
          type="date"
          disabled={disabled}
          value={webInputValue}
          min={minimumDate ? formatDateForInput(minimumDate) : undefined}
          max={maximumDate ? formatDateForInput(maximumDate) : undefined}
          placeholder={placeholder}
          onChange={handleWebInputChange}
          onFocus={handleWebInputFocus}
          onBlur={handleWebInputBlur}
          style={{
            ...webInputStyle,
            ...(disabled ? webInputDisabledStyle : {}),
            ...(error ? webInputErrorStyle : {}),
          }}
        />
      ) : (
        <>
          <Pressable
            onPress={() => !disabled && setShowPicker(true)}
            disabled={disabled}
            style={[
              styles.input,
              disabled && styles.inputDisabled,
              error && styles.inputError,
            ]}
          >
            <Text
              style={[
                styles.inputText,
                !hasValue && styles.placeholderText,
                disabled && styles.disabledText,
              ]}
            >
              {formattedValue}
            </Text>
          </Pressable>
          {showPicker && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={selectedDate}
                mode={mode}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
              />
              {Platform.OS === 'ios' && (
                <Button
                  title={confirmLabel}
                  onPress={() => {
                    setShowPicker(false)
                  }}
                  style={styles.doneButton}
                />
              )}
            </View>
          )}
        </>
      )}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: colors.sand,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  inputText: {
    fontSize: typography.sizes.base,
    color: colors.charcoal,
  },
  placeholderText: {
    color: colors.stone.light,
  },
  disabledText: {
    color: colors.stone.light,
  },
  helperText: {
    fontSize: typography.sizes.xs,
    color: colors.stone.DEFAULT,
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  pickerContainer: {
    marginTop: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.white,
  },
  doneButton: {
    marginTop: spacing.sm,
  },
})

const webInputStyle: React.CSSProperties = {
  width: '100%',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: colors.sand,
  borderRadius: 8,
  padding: spacing.sm,
  fontSize: typography.sizes.base,
  fontFamily: 'inherit',
  backgroundColor: colors.white,
  color: colors.charcoal,
  minHeight: 48,
  boxSizing: 'border-box',
}

const webInputDisabledStyle: React.CSSProperties = {
  opacity: 0.6,
  cursor: 'not-allowed',
  backgroundColor: colors.sand,
}

const webInputErrorStyle: React.CSSProperties = {
  borderColor: colors.error,
  borderWidth: 2,
}

function formatDateForInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseInputDate(value: string) {
  const [year, month, day] = value.split('-').map((part) => parseInt(part, 10))
  return new Date(year, (month || 1) - 1, day || 1)
}

function isCompleteDateInput(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}
