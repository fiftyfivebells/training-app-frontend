import { useRouter } from 'expo-router'
import React, { useEffect, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ActivityIndicator, Switch, View } from 'react-native'

import { Screen } from '@/components/layout/Screen'
import { useAlert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/ThemeProvider'

import { UpdatePreferencesRequest, UpdateProfileRequest } from '../api/userApi'
import { SectionLabel, UnitToggle } from '../components'
import { type DistanceUnitPreference } from '../hooks/useDistanceUnitPreference'
import { useGetCurrentUser } from '../hooks/useGetCurrentUser'
import { useGetUserPreferences } from '../hooks/useGetUserPreferences'
import { useUpdatePreferences } from '../hooks/useUpdatePreferences'
import { useUpdateProfile } from '../hooks/useUpdateProfile'

type FormValues = {
  firstName: string
  lastName: string
  dateOfBirth: Date | null
  timeZone: string
  preferredUnits: DistanceUnitPreference
  weekStartDay: string
  dailyPushEnabled: boolean
}

const WEEK_START_OPTIONS = [
  { label: 'Monday', value: 'monday' },
  { label: 'Sunday', value: 'sunday' },
]

function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y!, (m ?? 1) - 1, d ?? 1)
}

function fromDate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function EditProfileScreen() {
  const theme = useTheme()
  const router = useRouter()
  const { alert } = useAlert()

  const { data: user, isLoading: userLoading } = useGetCurrentUser()
  const { data: prefs, isLoading: prefsLoading } = useGetUserPreferences()

  const updateProfile = useUpdateProfile()
  const updatePreferences = useUpdatePreferences()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: null,
      timeZone: '',
      preferredUnits: 'imperial',
      weekStartDay: 'monday',
      dailyPushEnabled: false,
    },
  })

  const initialized = useRef(false)

  useEffect(() => {
    if (user && prefs && !initialized.current) {
      initialized.current = true
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth ? parseLocalDate(user.dateOfBirth) : null,
        timeZone: user.timeZone,
        preferredUnits:
          prefs.preferredUnits === 'imperial' || prefs.preferredUnits === 'metric'
            ? (prefs.preferredUnits as DistanceUnitPreference)
            : 'imperial',
        weekStartDay: prefs.weekStartDay || 'monday',
        dailyPushEnabled: prefs.dailyPushEnabled,
      })
    }
  }, [user, prefs, reset])

  const isPending = updateProfile.isPending || updatePreferences.isPending

  const onSubmit = async (values: FormValues) => {
    const profilePayload: UpdateProfileRequest = {
      firstName: values.firstName.trim() || undefined,
      lastName: values.lastName.trim() || undefined,
      dateOfBirth: values.dateOfBirth ? fromDate(values.dateOfBirth) : undefined,
      timeZone: values.timeZone.trim() || undefined,
    }

    const prefsPayload: UpdatePreferencesRequest = {
      preferredUnits: values.preferredUnits,
      weekStartDay: values.weekStartDay,
      dailyPushEnabled: values.dailyPushEnabled,
    }

    try {
      await Promise.all([
        updateProfile.mutateAsync(profilePayload),
        updatePreferences.mutateAsync(prefsPayload),
      ])
      router.back()
    } catch {
      alert('Unable to save', 'Please check your connection and try again.')
    }
  }

  const isLoading = userLoading || prefsLoading

  return (
    <Screen>
      <ThemedText
        style={{
          fontSize: theme.typography.size.xxxl,
          fontWeight: theme.typography.weights.bold,
          color: theme.semantic.text.primary,
          marginBottom: theme.spacing.xs,
        }}
      >
        Edit Profile
      </ThemedText>
      <ThemedText
        style={{
          fontSize: theme.typography.size.md,
          color: theme.semantic.text.secondary,
          marginBottom: theme.spacing.xl,
        }}
      >
        Update your personal info and preferences.
      </ThemedText>

      {isLoading && (
        <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xxl }}>
          <ActivityIndicator color={theme.semantic.button.primary.bg} />
        </View>
      )}

      {!isLoading && (
        <>
          {/* Personal info */}
          <View style={{ marginBottom: theme.spacing.lg }}>
            <SectionLabel>Personal info</SectionLabel>

            <View
              style={{
                flexDirection: 'row',
                gap: theme.spacing.sm,
              }}
            >
              <View style={{ flex: 1 }}>
                <Controller
                  control={control}
                  name="firstName"
                  rules={{ required: 'Required' }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <Input
                      label="First name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.firstName?.message}
                      autoCorrect={false}
                    />
                  )}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Controller
                  control={control}
                  name="lastName"
                  rules={{ required: 'Required' }}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <Input
                      label="Last name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.lastName?.message}
                      autoCorrect={false}
                    />
                  )}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field: { value, onChange } }) => (
                <View style={{ marginBottom: theme.spacing.md }}>
                  <DatePicker
                    label="Date of birth"
                    value={value}
                    onChange={onChange}
                    maximumDate={new Date()}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="timeZone"
              rules={{ required: 'Required' }}
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label="Timezone"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.timeZone?.message}
                  autoCorrect={false}
                  autoCapitalize="none"
                  placeholder="e.g. America/New_York"
                />
              )}
            />
          </View>

          {/* Preferences */}
          <View style={{ marginBottom: theme.spacing.xl }}>
            <SectionLabel>Preferences</SectionLabel>

            <ThemedText
              style={{
                fontSize: theme.typography.size.sm,
                fontWeight: theme.typography.weights.medium,
                color: theme.semantic.text.primary,
                marginBottom: theme.spacing.xs,
              }}
            >
              Distance unit
            </ThemedText>
            <Controller
              control={control}
              name="preferredUnits"
              render={({ field: { value, onChange } }) => (
                <View style={{ marginBottom: theme.spacing.md }}>
                  <UnitToggle value={value} onChange={onChange} />
                </View>
              )}
            />

            <Controller
              control={control}
              name="weekStartDay"
              render={({ field: { value, onChange } }) => (
                <Select
                  label="Week starts on"
                  value={value}
                  onValueChange={onChange}
                  options={WEEK_START_OPTIONS}
                />
              )}
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: theme.spacing.sm,
              }}
            >
              <View style={{ flex: 1, marginRight: theme.spacing.md }}>
                <ThemedText
                  style={{
                    fontSize: theme.typography.size.sm,
                    fontWeight: theme.typography.weights.medium,
                    color: theme.semantic.text.primary,
                  }}
                >
                  Daily reminders
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: theme.typography.size.xs,
                    color: theme.semantic.text.secondary,
                    marginTop: 2,
                  }}
                >
                  Push notification each morning
                </ThemedText>
              </View>
              <Controller
                control={control}
                name="dailyPushEnabled"
                render={({ field: { value, onChange } }) => (
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{
                      true: theme.semantic.button.primary.bg,
                      false: theme.semantic.border.default,
                    }}
                    thumbColor={theme.semantic.surface.card}
                  />
                )}
              />
            </View>
          </View>

          <Button onPress={handleSubmit(onSubmit)} loading={isPending} size="lg">
            Save changes
          </Button>
        </>
      )}
    </Screen>
  )
}
