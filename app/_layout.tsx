import { AlertProvider } from '@components/ui'
import { AuthProvider } from '@domains/auth/context/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useFonts } from 'expo-font'

import { SessionChecker } from '@/domains/auth/components/SessionChecker'

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
    <SafeAreaProvider>
      <AlertProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SessionChecker />
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#FAF8F5' },
              }}
            />
          </AuthProvider>
        </QueryClientProvider>
      </AlertProvider>
    </SafeAreaProvider>
  )
}
