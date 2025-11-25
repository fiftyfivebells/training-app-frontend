import '@/lib/api/setup'

import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { useTheme } from '@/theme/ThemeProvider'

import { tokenStorage } from '../src/domains/auth/utils/tokenStorage'

export default function Index() {
  const router = useRouter()
  const theme = useTheme()

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
      style={[
        styles.container,
        { backgroundColor: theme.semantic.surface.background },
      ]}
    >
      <ActivityIndicator size="large" color={theme.semantic.button.primary.bg} />
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
