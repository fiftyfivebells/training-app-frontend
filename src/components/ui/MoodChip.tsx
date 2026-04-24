import { Pressable, Text, type PressableProps } from 'react-native'

import type { MoodCategoryKey } from '@/domains/moods/moods.types'
import { useTheme } from '@/theme/useTheme'

const MOOD_LABELS: Record<MoodCategoryKey, string> = {
  'high-pleasant': 'Strong',
  'high-challenging': 'Fired',
  'low-pleasant': 'Easy',
  'low-challenging': 'Heavy',
}

const MOOD_TOKEN_KEY: Record<MoodCategoryKey, 'highGood' | 'highTough' | 'lowGood' | 'lowTough'> = {
  'high-pleasant': 'highGood',
  'high-challenging': 'highTough',
  'low-pleasant': 'lowGood',
  'low-challenging': 'lowTough',
}

interface MoodChipProps extends Omit<PressableProps, 'style'> {
  mood: MoodCategoryKey
  size?: 'sm' | 'md'
  selected?: boolean
  label?: string
}

export function MoodChip({ mood, size = 'md', selected = false, label, ...props }: MoodChipProps) {
  const { mood: moodTokens, moodBg } = useTheme()

  const tokenKey = MOOD_TOKEN_KEY[mood]
  const color = moodTokens[tokenKey]
  const displayLabel = label ?? MOOD_LABELS[mood]

  return (
    <Pressable
      {...props}
      style={[
        size === 'md' && {
          backgroundColor: selected ? moodBg[tokenKey] : 'transparent',
          borderWidth: selected ? 2 : 1,
          borderColor: color,
          borderRadius: 4,
          paddingHorizontal: 12,
          paddingVertical: 6,
        },
      ]}
    >
      <Text
        style={{
          fontFamily: selected ? 'ManropeSemiBold' : 'Manrope',
          fontSize: size === 'sm' ? 13 : 15,
          color,
          opacity: selected ? 1 : 0.6,
        }}
      >
        {displayLabel}
      </Text>
    </Pressable>
  )
}
