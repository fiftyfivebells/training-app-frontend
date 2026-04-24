import { Text, type TextProps } from 'react-native'

import { useTheme } from '@/theme/useTheme'

export function Dateline({ style, ...props }: TextProps) {
  const { text } = useTheme()

  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: 'ManropeSemiBold',
          fontSize: 11,
          letterSpacing: 0.14 * 11,
          textTransform: 'uppercase',
          color: text.secondary,
        },
        style,
      ]}
    />
  )
}
