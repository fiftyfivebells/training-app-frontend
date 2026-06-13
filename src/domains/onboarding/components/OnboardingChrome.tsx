import { useEffect, useRef } from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'

import { ONBOARDING_TOTAL_STEPS } from '../constants'

interface Props {
  step: number
  onBack?: () => void
  showSkip?: boolean
  onSkip?: () => void
}

export function OnboardingChrome({ step, onBack, showSkip = false, onSkip }: Props) {
  const progressAnim = useRef(new Animated.Value(0)).current
  const targetProgress = (step - 1) / (ONBOARDING_TOTAL_STEPS - 1)

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: targetProgress,
      duration: 300,
      easing: (t) => t * (2 - t), // ease-out
      useNativeDriver: false,
    }).start()
  }, [targetProgress])

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        ) : (
          <View style={styles.backSpacer} />
        )}

        <Text style={styles.stepCounter}>
          {step} / {ONBOARDING_TOTAL_STEPS}
        </Text>

        {showSkip && onSkip ? (
          <Pressable onPress={onSkip} style={styles.skipBtn} hitSlop={8}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : (
          <View style={styles.skipSpacer} />
        )}
      </View>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 10,
    gap: 10,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  backBtn: {},
  backSpacer: { width: 40 },
  backText: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 14,
    color: '#716A5E',
  },
  stepCounter: {
    fontFamily: 'ManropeSemiBold',
    fontSize: 10,
    letterSpacing: 0.14 * 10,
    color: '#716A5E',
  },
  skipBtn: {},
  skipSpacer: { width: 32 },
  skipText: {
    fontFamily: 'ManropeMedium',
    fontSize: 12,
    color: '#716A5E',
  },
  progressTrack: {
    height: 2,
    backgroundColor: '#2E2A25',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D5854F',
    borderRadius: 1,
  },
})
