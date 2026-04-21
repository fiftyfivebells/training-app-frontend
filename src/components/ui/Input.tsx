import { StyleSheet, type TextInputProps, View } from 'react-native'

import { useTheme } from '@/theme/useTheme'

import { ThemedText } from './ThemedText'
import { ThemedTextInput } from './ThemedTextInput'

interface InputProps extends TextInputProps {
  label: string
  error?: string
  disabled?: boolean
  rightElement?: React.ReactNode
}

export function Input({
  label,
  error,
  disabled,
  rightElement,
  style,
  ...props
}: InputProps) {
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
      
      <View style={{ position: 'relative', justifyContent: 'center' }}>
        <ThemedTextInput
          style={[
            styles.inputBase,
            {
              backgroundColor: colors.background.surface,
              borderColor: colors.border.default,
              borderRadius: radius.md,
              paddingLeft: space[4],
              paddingRight: rightElement ? space[12] : space[4],
              paddingVertical: space[2],
              color: colors.text.primary,
            },
            error && {
              borderColor: colors.mood.highTough,
              borderWidth: 2,
            },
            disabled && {
              backgroundColor: colors.background.input,
              opacity: 0.6,
            },
            style,
          ]}
          editable={!disabled}
          autoCorrect={false}
          {...props}
        />

        {rightElement && (
          <View
            style={{
              position: 'absolute',
              right: space[4],
              justifyContent: 'center',
            }}
          >
            {rightElement}
          </View>
        )}
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
  inputBase: {
    borderWidth: 1,
    minHeight: 48,
  },
})
