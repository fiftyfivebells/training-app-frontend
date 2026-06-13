import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { OnboardingChrome } from '../components/OnboardingChrome'

export function BlockScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <OnboardingChrome step={3} onBack={() => router.back()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.dateline}>Training blocks</Text>
          <Text style={styles.headline}>{'Structure your\ntraining.'}</Text>
        </View>

        <Text style={styles.body}>
          A training block is a named phase — Base Building, Race Specific, Recovery — that gives
          your log a spine. Runs you record get attached to the active block, so you can look back
          and see how a phase felt as a whole.
        </Text>

        <View style={styles.points}>
          {POINTS.map(({ heading, detail }) => (
            <View key={heading} style={styles.point}>
              <View style={styles.pointBullet} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pointHeading}>{heading}</Text>
                <Text style={styles.pointDetail}>{detail}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.optional}>
          You can always create or switch blocks later from the Blocks tab. Skip this if you just
          want to start logging.
        </Text>

        <View style={{ flex: 1 }} />

        <View style={styles.buttonStack}>
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
            onPress={() =>
              router.push({
                pathname: '/(modals)/block-create',
                params: { returnTo: '/(onboarding)/strava' },
              })
            }
          >
            <Text style={styles.ctaText}>Create a block</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.85 }]}
            onPress={() => router.push('/(onboarding)/strava')}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const POINTS = [
  {
    heading: 'Context for your runs',
    detail: 'See at a glance which phase a run belongs to.',
  },
  {
    heading: 'Mood by block',
    detail: 'Analytics break down how you felt across each training phase.',
  },
  {
    heading: 'One active block at a time',
    detail: 'Starting a new one closes the current one — no overlap.',
  },
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
    paddingTop: 24,
    paddingBottom: 28,
    gap: 20,
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
  body: {
    fontFamily: 'Manrope',
    fontSize: 14,
    lineHeight: 14 * 1.6,
    color: '#ABA398',
  },
  points: {
    gap: 14,
  },
  point: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  pointBullet: {
    width: 5,
    height: 5,
    borderRadius: 1,
    backgroundColor: '#D5854F',
    marginTop: 5,
    flexShrink: 0,
  },
  pointHeading: {
    fontFamily: 'ManropeSemiBold',
    fontSize: 13,
    color: '#F2ECDE',
    marginBottom: 2,
  },
  pointDetail: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: '#716A5E',
    lineHeight: 12 * 1.5,
  },
  optional: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 12,
    color: '#716A5E',
    lineHeight: 12 * 1.6,
  },
  buttonStack: {
    gap: 10,
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
  skipBtn: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#423C34',
    paddingVertical: 15,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  skipText: {
    fontFamily: 'ManropeBold',
    fontSize: 13,
    letterSpacing: 0.08 * 13,
    textTransform: 'uppercase',
    color: '#716A5E',
  },
})
