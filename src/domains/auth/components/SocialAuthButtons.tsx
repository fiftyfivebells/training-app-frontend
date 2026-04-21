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
  const { colors, space, radius } = useTheme()

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={[styles.line, { backgroundColor: colors.border.subtle }]} />
        <Text style={[styles.dividerText, { color: colors.text.tertiary }]}>{label}</Text>
        <View style={[styles.line, { backgroundColor: colors.border.subtle }]} />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={onStravaPress}
          style={[
            styles.socialBtn,
            {
              backgroundColor: colors.background.surface,
              borderColor: colors.border.default,
              borderRadius: radius.md,
            },
          ]}
        >
          <Ionicons name="flash-outline" size={20} color="#FC6100" />
          <Text style={[styles.btnText, { color: colors.text.primary }]}>Strava</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onGooglePress}
          style={[
            styles.socialBtn,
            {
              backgroundColor: colors.background.surface,
              borderColor: colors.border.default,
              borderRadius: radius.md,
            },
          ]}
        >
          <Ionicons name="logo-google" size={20} color={colors.text.secondary} />
          <Text style={[styles.btnText, { color: colors.text.primary }]}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onApplePress}
          style={[
            styles.socialBtn,
            {
              backgroundColor: colors.background.surface,
              borderColor: colors.border.default,
              borderRadius: radius.md,
            },
          ]}
        >
          <Ionicons name="logo-apple" size={20} color={colors.text.primary} />
          <Text style={[styles.btnText, { color: colors.text.primary }]}>Apple</Text>
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
