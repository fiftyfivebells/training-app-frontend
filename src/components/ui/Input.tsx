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
  const { bg, text, rule, semantic, space, radius } = useTheme()

  return (
    <View style={{ marginBottom: space[4] }}>
      <ThemedText
        style={{
          fontSize: 11,
          fontFamily: 'ManropeSemiBold',
          letterSpacing: 0.14 * 11,
          textTransform: 'uppercase',
          color: text.secondary,
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
              backgroundColor: bg.input,
              borderColor: error ? semantic.error : rule.default,
              borderRadius: radius.sm,
              paddingLeft: space[3],
              paddingRight: rightElement ? space[10] : space[3],
              paddingVertical: space[3],
              color: text.primary,
            },
            disabled && {
              color: text.disabled,
              opacity: 0.6,
            },
            style,
          ]}
          editable={!disabled}
          autoCorrect={false}
          {...props}
        />

        {rightElement && (
          <View style={{ position: 'absolute', right: space[3], justifyContent: 'center' }}>
            {rightElement}
          </View>
        )}
      </View>

      {error && (
        <ThemedText style={{ fontSize: 12, color: semantic.error, marginTop: space[1] }}>
          {error}
        </ThemedText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  inputBase: {
    borderWidth: 1,
    minHeight: 44,
  },
})
