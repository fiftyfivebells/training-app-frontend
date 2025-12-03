// app/(auth)/verify-email.tsx
import { Button } from '@components/ui'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/ThemeProvider'

export default function VerifyEmailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ email?: string }>()
  const theme = useTheme()

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.semantic.surface.background }]}
    >
      <View style={[styles.content, { padding: theme.spacing.lg }]}>
        <ThemedText
          style={{
            fontSize: theme.typography.size.xxxl,
            fontWeight: theme.typography.weights.bold,
            color: theme.semantic.text.primary,
            marginBottom: theme.spacing.sm,
          }}
        >
          Verify Email
        </ThemedText>
        <ThemedText
          style={{
            fontSize: theme.typography.size.md,
            color: theme.semantic.text.secondary,
            marginBottom: theme.spacing.xl,
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
