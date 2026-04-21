import '@/lib/api/setup'

import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { useTheme } from '@/theme/useTheme'

import { tokenStorage } from '../src/domains/auth/utils/tokenStorage'

export default function Index() {
  const router = useRouter()
  const { colors } = useTheme()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const token = await tokenStorage.getAccessToken()

      if (token) {
        router.replace('/(tabs)/')
      } else {
        router.replace('/(auth)/login')
      }
    } catch (_) {
      router.replace('/(auth)/login')
    }
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background.base },
      ]}
    >
      <ActivityIndicator size="large" color={colors.copper.default} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
