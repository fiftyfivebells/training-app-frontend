import { TextInput, TextInputProps } from 'react-native'

import { useTheme } from '@/theme/ThemeProvider'

export function ThemedTextInput({ style, ...props }: TextInputProps) {
  const theme = useTheme()

  return (
    <TextInput
      {...props}
      style={[
        {
          fontFamily: theme.typography.fontFamily,
          fontWeight: theme.typography.weights.regular,
          fontSize: theme.typography.size.md,
          color: theme.semantic.text.primary,
        },
        style,
      ]}
      placeholderTextColor={theme.semantic.text.muted}
    />
  )
}
