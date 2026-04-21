import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { AlertProvider } from '@components/ui'
import { AuthProvider } from '@domains/auth/context/AuthContext'
import { Fraunces_400Regular, Fraunces_400Regular_Italic } from '@expo-google-fonts/fraunces'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { SessionChecker } from '@/domains/auth/components/SessionChecker'
import { useTheme } from '@/theme/useTheme'
import { BaseThemeProvider } from '@/theme/ThemeContext'
import { AuthGate } from '@/domains/auth/context/AuthGate'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
})

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope: require('../assets/static/Manrope-Regular.ttf'),
    ManropeBold: require('../assets/static/Manrope-Bold.ttf'),
    ManropeSemiBold: require('../assets/static/Manrope-SemiBold.ttf'),
    ManropeMedium: require('../assets/static/Manrope-Medium.ttf'),
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
  })

  if (!fontsLoaded) return null

  return (
    <BaseThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthGate>
            <AlertProvider>
              <ThemedAppShell />
            </AlertProvider>
          </AuthGate>
        </AuthProvider>
      </QueryClientProvider>
    </BaseThemeProvider>
  )
}

function ThemedAppShell() {
  const { colors } = useTheme()

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background.base }}>
      <SessionChecker />
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.base },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(modals)/log" options={{ presentation: 'fullScreenModal', headerShown: false }} />
        <Stack.Screen name="(modals)/mood-picker" options={{ presentation: 'fullScreenModal', headerShown: false }} />
        <Stack.Screen name="(modals)/block-create" options={{ presentation: 'fullScreenModal', headerShown: false }} />
        <Stack.Screen name="(modals)/profile" options={{ presentation: 'card', headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  )
}
