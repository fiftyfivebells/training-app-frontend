import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { OnboardingChrome } from '../components/OnboardingChrome'

export function WelcomeScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <OnboardingChrome step={1} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.wordmarkBlock}>
          <Text style={styles.eyebrow}>Base Phase</Text>
          <Text style={styles.headline}>{'A quiet\nlogbook.'}</Text>
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.features}>
          {FEATURES.map((item) => (
            <View key={item} style={styles.featureRow}>
              <View style={styles.bullet} />
              <Text style={styles.featureText}>{item}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
          onPress={() => router.push('/(onboarding)/preferences')}
        >
          <Text style={styles.ctaText}>Get started</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const FEATURES = [
  'Log runs with mood & notes',
  'Track training blocks',
  'See patterns over time',
]

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#141210',
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
  },
  wordmarkBlock: {
    marginBottom: 24,
  },
  eyebrow: {
    fontFamily: 'ManropeSemiBold',
    fontSize: 11,
    letterSpacing: 0.22 * 11,
    textTransform: 'uppercase',
    color: '#716A5E',
    marginBottom: 6,
  },
  headline: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 52,
    letterSpacing: -0.03 * 52,
    lineHeight: 52 * 0.92,
    color: '#F2ECDE',
  },
  features: {
    gap: 10,
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 1,
    backgroundColor: '#D5854F',
  },
  featureText: {
    fontFamily: 'Manrope',
    fontSize: 13,
    color: '#ABA398',
  },
  cta: {
    backgroundColor: '#D5854F',
    borderRadius: 4,
    paddingVertical: 15,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: 'ManropeBold',
    fontSize: 13,
    letterSpacing: 0.08 * 13,
    textTransform: 'uppercase',
    color: '#F4EFE4',
  },
})
