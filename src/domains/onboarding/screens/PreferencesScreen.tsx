import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import type { OnboardingDistanceUnit, OnboardingPaceFormat } from '../constants'
import { useOnboarding } from '../context/OnboardingContext'
import { OnboardingChrome } from '../components/OnboardingChrome'

export function PreferencesScreen() {
  const router = useRouter()
  const { state, update } = useOnboarding()

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <OnboardingChrome step={2} onBack={() => router.back()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.dateline}>Preferences</Text>
            <Text style={styles.headline}>{'How do you\nmeasure miles?'}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Distance</Text>
            <SegmentedControl
              options={DISTANCE_OPTIONS}
              value={state.distanceUnit}
              onChange={(v) => update({ distanceUnit: v as OnboardingDistanceUnit })}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Pace format</Text>
            <SegmentedControl
              options={PACE_OPTIONS}
              value={state.paceFormat}
              onChange={(v) => update({ paceFormat: v as OnboardingPaceFormat })}
            />
          </View>

          <View style={{ flex: 1 }} />

          <Pressable
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
            onPress={() => router.push('/(onboarding)/block')}
          >
            <Text style={styles.ctaText}>Continue</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const DISTANCE_OPTIONS = [
  { label: 'Miles', value: 'miles' },
  { label: 'Km', value: 'km' },
]

const PACE_OPTIONS = [
  { label: 'min/mi', value: 'min/mi' },
  { label: 'min/km', value: 'min/km' },
  { label: 'mph', value: 'mph' },
]

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <View style={segStyles.container}>
      {options.map((opt, i) => {
        const isActive = opt.value === value
        return (
          <Pressable
            key={opt.value}
            style={[
              segStyles.segment,
              isActive && segStyles.segmentActive,
              i < options.length - 1 && segStyles.segmentBorder,
            ]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[segStyles.label, isActive && segStyles.labelActive]}>
              {opt.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const segStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#2E2A25',
    borderRadius: 4,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  segmentActive: {
    backgroundColor: '#D5854F',
  },
  segmentBorder: {
    borderRightWidth: 1,
    borderRightColor: '#2E2A25',
  },
  label: {
    fontFamily: 'Manrope',
    fontSize: 13,
    color: '#716A5E',
  },
  labelActive: {
    fontFamily: 'ManropeSemiBold',
    color: '#F4EFE4',
  },
})

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
    paddingTop: 24,
    paddingBottom: 28,
    gap: 18,
  },
  header: {},
  dateline: {
    fontFamily: 'ManropeSemiBold',
    fontSize: 11,
    letterSpacing: 0.14 * 11,
    textTransform: 'uppercase',
    color: '#ABA398',
    marginBottom: 6,
  },
  headline: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 32,
    letterSpacing: -0.02 * 32,
    lineHeight: 32 * 1.05,
    color: '#F2ECDE',
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: 'ManropeSemiBold',
    fontSize: 11,
    letterSpacing: 0.14 * 11,
    textTransform: 'uppercase',
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
