import { Stack } from 'expo-router'

import { useTheme } from '@/theme/useTheme'

export default function AuthLayout() {
  const { bg, text, rule, accent, mood, moodBg, semantic } = useTheme()

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: bg.base,
        },
        animation: 'slide_from_right',
      }}
    />
  )
}

