import { Text, TextProps } from 'react-native'

import { useTheme } from '@/theme/useTheme'

export function ThemedText({ style, ...props }: TextProps) {
  const { colors } = useTheme()

  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: 'Manrope',
          fontWeight: '400',
          fontSize: 15,
          color: colors.text.primary,
        },
        style,
      ]}
    />
  )
}
