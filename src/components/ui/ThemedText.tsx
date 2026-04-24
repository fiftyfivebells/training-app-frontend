import { Text, TextProps } from 'react-native'

import { useTheme } from '@/theme/useTheme'

export function ThemedText({ style, ...props }: TextProps) {
  const { text } = useTheme()

  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: 'Manrope',
          fontWeight: '400',
          fontSize: 15,
          color: text.primary,
        },
        style,
      ]}
    />
  )
}
