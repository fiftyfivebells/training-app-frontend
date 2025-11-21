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
      const token = await tokenStorage.getAccessToken()

      if (token) {
        router.replace('/(drawer)/')
      } else {
        router.replace('/(auth)/login')
      }
    } catch (_) {
      router.replace('/(auth)/login')
    }
  }

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
