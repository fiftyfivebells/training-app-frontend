// app/(auth)/verify-email.tsx
import { Button } from '@components/ui'
import { colors, spacing, typography } from '@theme/index'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function VerifyEmailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ email?: string }>()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>Check your email: {params.email}</Text>

        <Button
          title="Go to Login"
          onPress={() => {
            router.push('/(auth)/login')
          }}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.brown.DEFAULT,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.stone.DEFAULT,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  button: {
    width: 200,
  },
})
