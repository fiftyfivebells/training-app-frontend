// app/index.tsx
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'

import { tokenStorage } from '../src/domains/auth/utils/tokenStorage'
import { colors } from '../src/theme'

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      // Check if user has a token
      const token = await tokenStorage.getAccessToken()

      if (token) {
        // User is logged in - go to main app
        router.replace('/(tabs)')
      } else {
        // User is not logged in - go to auth
        router.replace('/(auth)/login')
      }
    } catch (_) {
      // Error checking auth - default to login
      router.replace('/(auth)/login')
    }
  }

  // Show loading spinner while checking auth
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.cream,
      }}
    >
      <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
    </View>
  )
}
