import { Button } from '@components/ui'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTheme } from '@/theme/useTheme'

export function VerifyEmailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ email?: string }>()
  const { bg, text } = useTheme()

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.base }]}>
      <View style={[styles.content, { paddingHorizontal: 28 }]}>
        <Text style={[styles.heading, { color: text.primary }]}>
          Check your email
        </Text>
        <Text style={[styles.body, { color: text.secondary }]}>
          We've sent a verification link to{'\n'}
          <Text style={[styles.emailHighlight, { color: text.primary }]}>
            {params.email ?? 'your email'}
          </Text>
        </Text>
        <Text style={[styles.hint, { color: text.tertiary }]}>
          Once verified, return here to sign in.
        </Text>
        <Button
          onPress={() => router.push('/(auth)/login')}
          size="lg"
          style={styles.button}
        >
          Back to Sign In
        </Button>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 32,
    letterSpacing: -0.02 * 32,
    textAlign: 'center',
    marginBottom: 20,
  },
  body: {
    fontFamily: 'Manrope',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 15 * 1.5,
    marginBottom: 8,
  },
  emailHighlight: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 15,
  },
  hint: {
    fontFamily: 'Manrope',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    width: '100%',
    maxWidth: 240,
  },
})
