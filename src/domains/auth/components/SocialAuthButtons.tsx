import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '@/theme/useTheme'

interface SocialAuthButtonsProps {
  onStravaPress?: () => void
  onGooglePress?: () => void
  // onApplePress?: () => void
  label?: string
}

export function SocialAuthButtons({
  onStravaPress,
  onGooglePress,
  // onApplePress,
  label = 'Or continue with',
}: SocialAuthButtonsProps) {
  const { bg, text, rule, radius } = useTheme()

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={[styles.line, { backgroundColor: rule.default }]} />
        <Text style={[styles.dividerLabel, { color: text.tertiary }]}>{label}</Text>
        <View style={[styles.line, { backgroundColor: rule.default }]} />
      </View>

      <View style={styles.buttonCol}>
        {/* TODO: implement Strava login
        <TouchableOpacity
          onPress={onStravaPress}
          style={[styles.socialBtn, { backgroundColor: bg.surface, borderColor: rule.default, borderRadius: radius.sm }]}
        >
          <Ionicons name="flash-outline" size={18} color="#FC6100" />
          <Text style={[styles.btnText, { color: text.primary }]}>Strava</Text>
        </TouchableOpacity>
        */}

        <TouchableOpacity
          onPress={onGooglePress}
          style={[styles.socialBtn, { backgroundColor: bg.surface, borderColor: rule.default, borderRadius: radius.sm }]}
        >
          <Ionicons name="logo-google" size={18} color={text.secondary} />
          <Text style={[styles.btnText, { color: text.primary }]}>Google</Text>
        </TouchableOpacity>

        {/* Apple — post-MVP
        <TouchableOpacity
          onPress={onApplePress}
          style={[styles.socialBtn, { backgroundColor: bg.surface, borderColor: rule.default, borderRadius: radius.sm }]}
        >
          <Ionicons name="logo-apple" size={18} color={text.primary} />
          <Text style={[styles.btnText, { color: text.primary }]}>Apple</Text>
        </TouchableOpacity>
        */}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 28,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  line: {
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    marginHorizontal: 12,
    fontFamily: 'ManropeSemiBold',
    fontSize: 11,
    letterSpacing: 0.14 * 11,
    textTransform: 'uppercase',
  },
  buttonCol: {
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
    fontFamily: 'ManropeSemiBold',
    fontSize: 14,
  },
})
