// app/(auth)/verify-email.tsx
import { Button } from '@components/ui'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/useTheme'

export default function VerifyEmailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ email?: string }>()
  const { colors, space } = useTheme()

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.base }]}
    >
      <View style={[styles.content, { padding: space[6] }]}>
        <ThemedText
          style={{
            fontSize: 32,
            fontWeight: '700',
            color: colors.text.primary,
            marginBottom: space[2],
          }}
        >
          Verify Email
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 15,
            color: colors.text.secondary,
            marginBottom: space[8],
            textAlign: 'center',
          }}
        >
          Check your email: {params.email}
        </ThemedText>

        <Button
          onPress={() => {
            router.push('/(auth)/login')
          }}
          style={styles.buttonWidth}
        >
          Go to Login
        </Button>
      </View>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWidth: {
    width: 200,
  },
})
