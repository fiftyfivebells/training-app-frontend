import { StyleSheet, type TextInputProps, View } from 'react-native'

import { useTheme } from '@/theme/ThemeProvider'

import { ThemedText } from './ThemedText'
import { ThemedTextInput } from './ThemedTextInput'

interface InputProps extends TextInputProps {
  label: string
  error?: string
  disabled?: boolean
}

export function Input({ label, error, disabled, style, ...props }: InputProps) {
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
      <ThemedTextInput
        style={[
          styles.inputBase,
          {
            backgroundColor: theme.semantic.surface.card,
            borderColor: theme.semantic.border.default,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            color: theme.semantic.text.primary,
          },
          error && {
            borderColor: theme.semantic.mood.highTough.border,
            borderWidth: 2,
          },
          disabled && {
            backgroundColor: theme.semantic.surface.cardAlt,
            opacity: 0.6,
          },
          style,
        ]}
        editable={!disabled}
        autoCorrect={false}
        {...props}
      />
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
  inputBase: {
    borderWidth: 1,
    minHeight: 48,
  },
})
