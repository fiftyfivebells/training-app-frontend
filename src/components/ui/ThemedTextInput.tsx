import { TextInput, TextInputProps } from 'react-native'

import { useTheme } from '@/theme/useTheme'
import React from 'react'

export const ThemedTextInput = React.forwardRef<TextInput, TextInputProps>(
  ({ style, ...props }, ref) => {
    const { colors } = useTheme()

    return (
      <TextInput
        {...props}
        ref={ref}
        style={[
          {
            fontFamily: 'Manrope',
            fontWeight: '400',
            fontSize: 15,
            color: colors.text.primary,
          },
          style,
        ]}
        placeholderTextColor={colors.text.tertiary}
      />
    )
  },
)
