import { Stack } from 'expo-router'

import { useTheme } from '@/theme/ThemeProvider'

export default function AuthLayout() {
  const theme = useTheme()

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.semantic.surface.background,
        },
        animation: 'slide_from_right',
      }}
    />
  )
}
