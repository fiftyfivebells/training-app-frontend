import { View, Text, type ViewProps } from 'react-native'

import { useTheme } from '@/theme/useTheme'

interface ReadoutProps extends ViewProps {
  value: string
  unit?: string
  label?: string
  size?: 'lg' | 'md'
}

export function Readout({ value, unit, label, size = 'lg', style, ...props }: ReadoutProps) {
  const { text } = useTheme()

  const valueFontSize = size === 'lg' ? 56 : 28

  return (
    <View {...props} style={[{ gap: 2 }, style]}>
      {label && (
        <Text
          style={{
            fontFamily: 'ManropeSemiBold',
            fontSize: 11,
            letterSpacing: 0.14 * 11,
            textTransform: 'uppercase',
            color: text.secondary,
          }}
        >
          {label}
        </Text>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
        <Text
          style={{
            fontFamily: 'Fraunces_400Regular',
            fontSize: valueFontSize,
            color: text.primary,
            fontVariant: ['tabular-nums'],
          }}
        >
          {value}
        </Text>
        {unit && (
          <Text
            style={{
              fontFamily: 'Fraunces_400Regular_Italic',
              fontSize: valueFontSize * 0.4,
              color: text.secondary,
            }}
          >
            {unit}
          </Text>
        )}
      </View>
    </View>
  )
}
