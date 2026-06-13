import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useOnboarding } from '../context/OnboardingContext'
import { OnboardingChrome } from '../components/OnboardingChrome'
import { useCompleteOnboarding } from '../hooks/useCompleteOnboarding'

export function DoneScreen() {
  const { state } = useOnboarding()
  const { complete, isCompleting, error } = useCompleteOnboarding()

  const handleGo = async () => {
    await complete()
    // AuthGate detects isComplete → true and redirects to / automatically.
    // Calling router.replace('/') here would race the state update and loop back to onboarding.
  }

  const checklist = [
    'Training preferences set',
    state.stravaConnected ? 'Strava connected' : 'Strava skipped',
  ]

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <OnboardingChrome step={5} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBlock}>
          <Text style={styles.dateline}>Entry № 1</Text>
          <Text style={styles.headline}>{'Ready\nto run.'}</Text>
        </View>

        <View style={styles.recapCard}>
          {checklist.map((label) => (
            <View key={label} style={styles.checkRow}>
              <CheckboxDone />
              <Text style={styles.checkText}>{label}</Text>
            </View>
          ))}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={{ flex: 1 }} />

        <Pressable
          style={({ pressed }) => [styles.cta, (pressed || isCompleting) && { opacity: 0.85 }]}
          onPress={handleGo}
          disabled={isCompleting}
        >
          {isCompleting ? (
            <ActivityIndicator color="#F4EFE4" />
          ) : (
            <Text style={styles.ctaText}>Go to dashboard</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

function CheckboxDone() {
  return (
    <View style={styles.checkbox}>
      <Text style={styles.checkMark}>✓</Text>
    </View>
  )
}

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
    gap: 0,
  },
  heroBlock: {
    marginBottom: 28,
  },
  dateline: {
    fontFamily: 'ManropeSemiBold',
    fontSize: 11,
    letterSpacing: 0.14 * 11,
    textTransform: 'uppercase',
    color: '#ABA398',
    marginBottom: 8,
  },
  headline: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 48,
    letterSpacing: -0.03 * 48,
    lineHeight: 48 * 0.92,
    color: '#F2ECDE',
  },
  recapCard: {
    backgroundColor: '#1C1916',
    borderWidth: 1,
    borderColor: '#241F1B',
    borderRadius: 4,
    padding: 16,
    gap: 10,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: 'rgba(213, 133, 79, 0.38)',
    backgroundColor: 'rgba(213, 133, 79, 0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontFamily: 'Manrope',
    fontSize: 10,
    color: '#D5854F',
    lineHeight: 12,
  },
  checkText: {
    fontFamily: 'Manrope',
    fontSize: 13,
    color: '#F2ECDE',
  },
  error: {
    fontFamily: 'Manrope',
    fontSize: 13,
    color: '#B64535',
    textAlign: 'center',
    marginTop: 8,
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
