import { AlertProvider } from '@components/ui'
import { AuthProvider } from '@domains/auth/context/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { SessionChecker } from '@/domains/auth/components/SessionChecker'
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider'
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
  })

  if (!fontsLoaded) return null

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGate>
          <ThemeProvider>
            <AlertProvider>
              <ThemedAppShell />
            </AlertProvider>
          </ThemeProvider>
        </AuthGate>
      </AuthProvider>
    </QueryClientProvider>
  )
}

function ThemedAppShell() {
  const theme = useTheme()

  return (
    <>
      <SessionChecker />
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.semantic.surface.background },
        }}
      />
    </>
  )
}
