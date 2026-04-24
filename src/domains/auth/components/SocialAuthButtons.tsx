import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/theme/useTheme'

interface SocialAuthButtonsProps {
  onStravaPress?: () => void
  onGooglePress?: () => void
  onApplePress?: () => void
  label?: string
}

export function SocialAuthButtons({
  onStravaPress,
  onGooglePress,
  onApplePress,
  label = 'Or continue with',
}: SocialAuthButtonsProps) {
  const { bg, text, rule, accent, mood, moodBg, semantic, space, radius } = useTheme()

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={[styles.line, { backgroundColor: rule.subtle }]} />
        <Text style={[styles.dividerText, { color: text.tertiary }]}>{label}</Text>
        <View style={[styles.line, { backgroundColor: rule.subtle }]} />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={onStravaPress}
          style={[
            styles.socialBtn,
            {
              backgroundColor: bg.surface,
              borderColor: rule.default,
              borderRadius: radius.md,
            },
          ]}
        >
          <Ionicons name="flash-outline" size={20} color="#FC6100" />
          <Text style={[styles.btnText, { color: text.primary }]}>Strava</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onGooglePress}
          style={[
            styles.socialBtn,
            {
              backgroundColor: bg.surface,
              borderColor: rule.default,
              borderRadius: radius.md,
            },
          ]}
        >
          <Ionicons name="logo-google" size={20} color={text.secondary} />
          <Text style={[styles.btnText, { color: text.primary }]}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onApplePress}
          style={[
            styles.socialBtn,
            {
              backgroundColor: bg.surface,
              borderColor: rule.default,
              borderRadius: radius.md,
            },
          ]}
        >
          <Ionicons name="logo-apple" size={20} color={text.primary} />
          <Text style={[styles.btnText, { color: text.primary }]}>Apple</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 24,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  buttonRow: {
    flexDirection: 'column',
    gap: 10,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    gap: 10,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
  },
})
