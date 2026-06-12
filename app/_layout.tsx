import '@/lib/api/setup'
import { AppState, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { AlertProvider } from '@components/ui'
import { AuthProvider } from '@domains/auth/context/AuthContext'
import { Fraunces_400Regular, Fraunces_400Regular_Italic } from '@expo-google-fonts/fraunces'
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { SessionChecker } from '@/domains/auth/components/SessionChecker'
import { useBlockThemeSync } from '@/domains/blocks/hooks/useBlockThemeSync'
import { useTheme } from '@/theme/useTheme'
import { BaseThemeProvider } from '@/theme/ThemeContext'
import { AuthGate } from '@/domains/auth/context/AuthGate'

focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (state) => {
    handleFocus(state === 'active')
  })
  return () => subscription.remove()
})

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
  const { bg } = useTheme()
  useBlockThemeSync()

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: bg.base }}>
      <SessionChecker />
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: bg.base },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(modals)/log" options={{ presentation: 'fullScreenModal', headerShown: false }} />
        <Stack.Screen name="(modals)/mood-picker" options={{ presentation: 'fullScreenModal', headerShown: false }} />
        <Stack.Screen name="(modals)/block-create" options={{ presentation: 'fullScreenModal', headerShown: false }} />
        <Stack.Screen name="(modals)/pending-runs" options={{ presentation: 'card', headerShown: false }} />
        <Stack.Screen name="(modals)/profile" options={{ presentation: 'card', headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  )
}

