import DateTimePicker, {
  type AndroidNativeProps,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Platform,
  Pressable,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native'

import { useTheme } from '@/theme/useTheme'
import type { ThemeTokens } from '@/theme/tokens'

import { Button } from './Button'
import { ThemedText } from './ThemedText'

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

  const theme = useTheme()
  const webInputStyles = useMemo(() => getWebInputStyles(theme), [theme])
  const inputBaseStyle = [
    styles.inputLayout,
    {
      backgroundColor: theme.colors.background.surface,
      borderColor: theme.colors.border.default,
      borderRadius: theme.radius.md,
      paddingVertical: theme.space[2],
      paddingHorizontal: theme.space[4],
      minHeight: 48,
    },
  ]

  return (
    <View style={style}>
      {label && (
        <ThemedText
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: theme.colors.text.primary,
            marginBottom: theme.space[1],
          }}
        >
          {label}
        </ThemedText>
      )}
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
            ...webInputStyles.base,
            ...(disabled ? webInputStyles.disabled : {}),
            ...(error ? webInputStyles.error : {}),
          } as any}
        />
      ) : (
        <>
          <Pressable
            onPress={() => !disabled && setShowPicker(true)}
            disabled={disabled}
            style={[
              ...inputBaseStyle,
              disabled && {
                opacity: 0.6,
                backgroundColor: theme.colors.background.input,
              },
              error && {
                borderColor: theme.colors.mood.highTough,
                borderWidth: 2,
              },
            ] as any}
          >
            <ThemedText
              style={[
                {
                  fontSize: 15,
                  color: theme.colors.text.primary,
                },
                !hasValue && { color: theme.colors.text.tertiary },
                disabled && { color: theme.colors.text.tertiary },
              ]}
            >
              {formattedValue}
            </ThemedText>
          </Pressable>
          {showPicker && (
            <View
              style={[
                styles.pickerContainer,
                {
                  marginTop: theme.space[2],
                  borderRadius: theme.radius.lg,
                  borderColor: theme.colors.border.default,
                  backgroundColor: theme.colors.background.surface,
                },
              ]}
            >
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
                  onPress={() => {
                    setShowPicker(false)
                  }}
                  style={{ marginTop: theme.space[2] }}
                >
                  {confirmLabel}
                </Button>
              )}
            </View>
          )}
        </>
      )}
      {helperText && !error && (
        <ThemedText
          style={{
            fontSize: 12,
            color: theme.colors.text.secondary,
            marginTop: theme.space[1],
          }}
        >
          {helperText}
        </ThemedText>
      )}
      {error && (
        <ThemedText
          style={{
            fontSize: 12,
            color: theme.colors.mood.highTough,
            marginTop: theme.space[1],
          }}
        >
          {error}
        </ThemedText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  inputLayout: {
    borderWidth: 1,
    justifyContent: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
  },
})

function getWebInputStyles(theme: ThemeTokens) {
  return {
    base: {
      width: '100%',
      borderWidth: 1,
      borderStyle: 'solid' as const,
      borderColor: theme.colors.border.default,
      borderRadius: theme.radius.md,
      padding: theme.space[2],
      fontSize: 15,
      fontFamily: 'Manrope',
      backgroundColor: theme.colors.background.surface,
      color: theme.colors.text.primary,
      minHeight: 48,
      boxSizing: 'border-box' as const,
    },
    disabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
      backgroundColor: theme.colors.background.input,
    },
    error: {
      borderColor: theme.colors.mood.highTough,
      borderWidth: 2,
    },
  }
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
