import { Text, TextProps } from 'react-native'

import { useTheme } from '@/theme/ThemeProvider'

export function ThemedText({ style, ...props }: TextProps) {
  const theme = useTheme()

  return (
    <Text
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
    />
  )
}
