import { Button } from '@components/ui'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/useTheme'

export function VerifyEmailScreen() {
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
            fontSize: 36,
            fontFamily: 'Fraunces_400Regular',
            color: colors.text.primary,
            marginBottom: space[4],
            textAlign: 'center',
          }}
        >
          Check your email
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 16,
            color: colors.text.secondary,
            marginBottom: space[10],
            textAlign: 'center',
            lineHeight: 24,
          }}
        >
          We've sent a verification link to{'\n'}
          <ThemedText style={{ color: colors.text.primary, fontWeight: '600' }}>
            {params.email ?? 'your email'}
          </ThemedText>
        </ThemedText>

        <Button
          onPress={() => {
            router.push('/(auth)/login')
          }}
          style={styles.button}
        >
          Back to Login
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
  button: {
    width: '100%',
    maxWidth: 240,
  },
})
