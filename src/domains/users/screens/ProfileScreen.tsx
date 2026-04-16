import { format, parseISO } from 'date-fns'
import { useRouter } from 'expo-router'
import React from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ui/ThemedText'
import { Button } from '@/components/ui'
import { useLogout } from '@/domains/auth/hooks/useLogout'
import { useTheme } from '@/theme/ThemeProvider'

import { useGetCurrentUser } from '../hooks/useGetCurrentUser'
import { useDistanceUnitPreference } from '../hooks/useDistanceUnitPreference'
import { InfoRow, SectionLabel, UnitToggle, VerifiedBadge } from '../components'

export function ProfileScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { data: user, isLoading, isError } = useGetCurrentUser()
  const { unit, setUnit } = useDistanceUnitPreference()
  const logout = useLogout()

  const formattedDob = user?.dateOfBirth
    ? format(parseISO(user.dateOfBirth), 'MMMM d, yyyy')
    : '—'

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.semantic.surface.background }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <ThemedText
            style={{
              fontSize: theme.typography.size.xxxl,
              fontWeight: theme.typography.weights.bold,
              color: theme.semantic.text.primary,
            }}
          >
            Profile
          </ThemedText>
          <Pressable
            onPress={() => router.push('/(drawer)/edit-profile')}
            hitSlop={8}
          >
            <ThemedText
              style={{
                fontSize: theme.typography.size.sm,
                fontWeight: theme.typography.weights.medium,
                color: theme.semantic.button.primary.bg,
              }}
            >
              Edit
            </ThemedText>
          </Pressable>
        </View>
        <ThemedText
          style={{
            fontSize: theme.typography.size.md,
            color: theme.semantic.text.secondary,
            marginBottom: theme.spacing.xl,
          }}
        >
          Your account and preferences.
        </ThemedText>

        {/* Account Info */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <SectionLabel>Account</SectionLabel>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.semantic.surface.card,
                borderColor: theme.semantic.border.default,
                borderRadius: theme.radius.lg,
                paddingHorizontal: theme.spacing.md,
              },
            ]}
          >
            {isLoading && (
              <View style={[styles.loadingRow, { paddingVertical: theme.spacing.lg }]}>
                <ActivityIndicator color={theme.semantic.button.primary.bg} />
              </View>
            )}

            {isError && !isLoading && (
              <View style={{ paddingVertical: theme.spacing.md }}>
                <ThemedText
                  style={{
                    fontSize: theme.typography.size.sm,
                    color: theme.semantic.text.secondary,
                    textAlign: 'center',
                  }}
                >
                  Unable to load account info.
                </ThemedText>
              </View>
            )}

            {user && !isLoading && (
              <>
                <InfoRow label="Name" value={`${user.firstName} ${user.lastName}`} />
                <InfoRow label="Date of birth" value={formattedDob} />
                <InfoRow label="Timezone" value={user.timeZone} />
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: theme.spacing.sm,
                  }}
                >
                  <ThemedText
                    style={{
                      fontSize: theme.typography.size.sm,
                      color: theme.semantic.text.secondary,
                      flex: 1,
                    }}
                  >
                    Email
                  </ThemedText>
                  <View style={styles.emailRow}>
                    <ThemedText
                      style={{
                        fontSize: theme.typography.size.sm,
                        fontWeight: theme.typography.weights.medium,
                        color: theme.semantic.text.primary,
                        marginRight: theme.spacing.sm,
                        flexShrink: 1,
                      }}
                      numberOfLines={1}
                    >
                      {user.email}
                    </ThemedText>
                    <VerifiedBadge verified={user.isVerified} />
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Preferences */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <SectionLabel>Preferences</SectionLabel>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.semantic.surface.card,
                borderColor: theme.semantic.border.default,
                borderRadius: theme.radius.lg,
                padding: theme.spacing.md,
              },
            ]}
          >
            <ThemedText
              style={{
                fontSize: theme.typography.size.sm,
                color: theme.semantic.text.secondary,
                marginBottom: theme.spacing.sm,
              }}
            >
              Distance unit
            </ThemedText>
            <UnitToggle value={unit} onChange={setUnit} />
          </View>
        </View>

        {/* Actions */}
        <View>
          <SectionLabel>Account actions</SectionLabel>
          <Button
            onPress={() => logout.mutate()}
            loading={logout.isPending}
            variant="secondary"
            style={styles.fullWidth}
          >
            Log out
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  card: {
    borderWidth: 1,
  },
  emailRow: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  loadingRow: {
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
})
