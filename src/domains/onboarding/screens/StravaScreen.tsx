import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { useStravaConnect } from '@/domains/strava/hooks/useStravaConnect'
import { useStravaStatus } from '@/domains/strava/hooks/useStravaStatus'

import { useOnboarding } from '../context/OnboardingContext'
import { OnboardingChrome } from '../components/OnboardingChrome'

export function StravaScreen() {
  const router = useRouter()
  const { update } = useOnboarding()
  const { data: stravaStatus } = useStravaStatus()
  const { mutate: connectStrava, isPending } = useStravaConnect()

  const isConnected = stravaStatus?.connected ?? false

  const handleConnect = () => {
    connectStrava(undefined, {
      onSuccess: () => update({ stravaConnected: true }),
    })
  }

  const handleContinue = () => {
    router.push('/(onboarding)/done')
  }

  const handleSkip = () => {
    router.push('/(onboarding)/done')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <OnboardingChrome step={4} onBack={() => router.back()} showSkip onSkip={handleSkip} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.dateline}>Connections</Text>
          <Text style={styles.headline}>{'Already running\non Strava?'}</Text>
        </View>

        <View style={[styles.stravaCard, isConnected && styles.stravaCardConnected]}>
          <View style={styles.stravaRow}>
            <View style={styles.stravaLogo}>
              <StravaBolt />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stravaName}>Strava</Text>
              {isConnected ? (
                <Text style={styles.stravaConnectedLabel}>✓ Connected</Text>
              ) : (
                <Text style={styles.stravaSubtitle}>Import runs automatically</Text>
              )}
            </View>
            {!isConnected && (
              <Pressable
                style={({ pressed }) => [styles.connectBtn, pressed && { opacity: 0.85 }]}
                onPress={handleConnect}
                disabled={isPending}
              >
                <Text style={styles.connectBtnText}>{isPending ? '...' : 'CONNECT'}</Text>
              </Pressable>
            )}
          </View>

          {isConnected && (
            <>
              <View style={styles.divider} />
              <Text style={styles.permissionLabel}>Will import from</Text>
              {PERMISSIONS.map((p) => (
                <View key={p} style={styles.permissionRow}>
                  <StravaCheck />
                  <Text style={styles.permissionText}>{p}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {!isConnected && (
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              "Mood and notes are always added in Base Phase — Strava doesn't know how it felt."
            </Text>
          </View>
        )}

        <View style={{ flex: 1 }} />

        <View style={styles.buttonStack}>
          <Pressable
            style={({ pressed }) => [
              styles.cta,
              isConnected && styles.ctaConnected,
              pressed && { opacity: 0.85 },
            ]}
            onPress={isConnected ? handleContinue : handleConnect}
            disabled={isPending}
          >
            <Text style={styles.ctaText}>
              {isConnected ? 'Continue' : 'Connect Strava'}
            </Text>
          </Pressable>

          {!isConnected && (
            <Pressable
              style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.85 }]}
              onPress={handleSkip}
            >
              <Text style={styles.secondaryBtnText}>Skip for now</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const PERMISSIONS = ['Activities (runs, walks)', 'Title and description', 'Distance and duration']

function StravaBolt() {
  return <Text style={{ fontSize: 20, color: '#fff' }}>⚡</Text>
}

function StravaCheck() {
  return (
    <View style={stravaCheckStyles.circle}>
      <Text style={stravaCheckStyles.mark}>✓</Text>
    </View>
  )
}

const stravaCheckStyles = StyleSheet.create({
  circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FC4C02',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    fontSize: 8,
    color: '#fff',
    lineHeight: 10,
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
    gap: 14,
  },
  header: {
    marginBottom: 10,
  },
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
    fontSize: 30,
    letterSpacing: -0.02 * 30,
    lineHeight: 30 * 1.05,
    color: '#F2ECDE',
  },
  stravaCard: {
    backgroundColor: '#1C1916',
    borderWidth: 1,
    borderColor: '#241F1B',
    borderRadius: 4,
    padding: 16,
  },
  stravaCardConnected: {
    borderColor: 'rgba(252, 76, 2, 0.38)',
  },
  stravaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stravaLogo: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FC4C02',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stravaName: {
    fontFamily: 'ManropeSemiBold',
    fontSize: 15,
    color: '#F2ECDE',
    marginBottom: 2,
  },
  stravaSubtitle: {
    fontFamily: 'Manrope',
    fontSize: 11,
    color: '#716A5E',
  },
  stravaConnectedLabel: {
    fontFamily: 'Manrope',
    fontSize: 11,
    color: '#6E8E49',
  },
  connectBtn: {
    backgroundColor: '#FC4C02',
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  connectBtnText: {
    fontFamily: 'ManropeBold',
    fontSize: 11,
    letterSpacing: 0.06 * 11,
    textTransform: 'uppercase',
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#241F1B',
    marginVertical: 12,
  },
  permissionLabel: {
    fontFamily: 'Manrope',
    fontSize: 11,
    color: '#716A5E',
    marginBottom: 10,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  permissionText: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: '#ABA398',
  },
  disclaimer: {
    backgroundColor: '#26221E',
    borderWidth: 1,
    borderColor: '#241F1B',
    borderRadius: 4,
    padding: 12,
  },
  disclaimerText: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 12,
    color: '#716A5E',
    lineHeight: 12 * 1.5,
  },
  buttonStack: {
    gap: 10,
  },
  cta: {
    backgroundColor: '#FC4C02',
    borderRadius: 4,
    paddingVertical: 15,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  ctaConnected: {
    backgroundColor: '#D5854F',
  },
  ctaText: {
    fontFamily: 'ManropeBold',
    fontSize: 13,
    letterSpacing: 0.08 * 13,
    textTransform: 'uppercase',
    color: '#F4EFE4',
  },
  secondaryBtn: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#423C34',
    paddingVertical: 15,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'ManropeBold',
    fontSize: 13,
    letterSpacing: 0.08 * 13,
    textTransform: 'uppercase',
    color: '#716A5E',
  },
})
