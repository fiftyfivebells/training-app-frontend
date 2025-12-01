import { TextInput, TextInputProps } from 'react-native'

import { useTheme } from '@/theme/ThemeProvider'
import React from 'react'

export const ThemedTextInput = React.forwardRef<TextInput, TextInputProps>(
  ({ style, ...props }, ref) => {
    const theme = useTheme()

    return (
      <TextInput
        {...props}
        ref={ref}
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
  },
)
