import { View, type ViewProps } from 'react-native'

import { useTheme } from '@/theme/useTheme'

export function Rule({ style, ...props }: ViewProps) {
  const { rule } = useTheme()

  return (
    <View
      {...props}
      style={[{ height: 1, backgroundColor: rule.default }, style]}
    />
  )
}

export function DoubleRule({ style, ...props }: ViewProps) {
  const { rule } = useTheme()

  return (
    <View
      {...props}
      style={[
        {
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderTopColor: rule.default,
          borderBottomColor: rule.default,
          paddingVertical: 3,
        },
        style,
      ]}
    />
  )
}
