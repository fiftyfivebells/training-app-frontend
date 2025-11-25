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

import { useTheme } from '@/theme/ThemeProvider'
import type { Theme } from '@/theme/types'

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
      backgroundColor: theme.semantic.surface.card,
      borderColor: theme.semantic.border.default,
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      minHeight: theme.buttons.sizes.md.minHeight,
    },
  ]

  return (
    <View style={style}>
      {label && (
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
          }}
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
                backgroundColor: theme.semantic.surface.cardAlt,
              },
              error && {
                borderColor: theme.semantic.mood.highTough.border,
                borderWidth: 2,
              },
            ]}
          >
            <ThemedText
              style={[
                {
                  fontSize: theme.typography.size.md,
                  color: theme.semantic.text.primary,
                },
                !hasValue && { color: theme.semantic.text.muted },
                disabled && { color: theme.semantic.text.muted },
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
                  marginTop: theme.spacing.sm,
                  borderRadius: theme.radius.lg,
                  borderColor: theme.semantic.border.default,
                  backgroundColor: theme.semantic.surface.card,
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
                  title={confirmLabel}
                  onPress={() => {
                    setShowPicker(false)
                  }}
                  style={{ marginTop: theme.spacing.sm }}
                />
              )}
            </View>
          )}
        </>
      )}
      {helperText && !error && (
        <ThemedText
          style={{
            fontSize: theme.typography.size.xs,
            color: theme.semantic.text.secondary,
            marginTop: theme.spacing.xs,
          }}
        >
          {helperText}
        </ThemedText>
      )}
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
  inputLayout: {
    borderWidth: 1,
    justifyContent: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
  },
})

function getWebInputStyles(theme: Theme) {
  return {
    base: {
      width: '100%',
      borderWidth: 1,
      borderStyle: 'solid' as const,
      borderColor: theme.semantic.border.default,
      borderRadius: theme.radius.md,
      padding: theme.spacing.sm,
      fontSize: theme.typography.size.md,
      fontFamily: theme.typography.fontFamily,
      backgroundColor: theme.semantic.surface.card,
      color: theme.semantic.text.primary,
      minHeight: theme.buttons.sizes.md.minHeight,
      boxSizing: 'border-box' as const,
    },
    disabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
      backgroundColor: theme.semantic.surface.cardAlt,
    },
    error: {
      borderColor: theme.semantic.mood.highTough.border,
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
