import { Button, DatePicker, Input, useAlert } from '@components/ui'
import * as Localization from 'expo-localization'
import { useRouter } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/ThemeProvider'

import type { CreateUserRequest } from '../api/authClient'
import { useRegister } from '../hooks'

interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  dateOfBirth: Date
}

export function RegisterScreen() {
  const router = useRouter()
  const { alert } = useAlert()
  const theme = useTheme()

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      dateOfBirth: new Date(2000, 0, 1),
    },
  })

  const registerMutation = useRegister({
    onSuccess: (data, variables) => {
      alert('Account Created!', 'Please check your email to verify your account.', [
        {
          text: 'OK',
          onPress: () => {
            router.push({
              pathname: '/(auth)/verify-email',
              params: { email: variables.email },
            })
          },
        },
      ])
    },
    onError: (error) => {
      alert(
        'Registration Failed',
        error.message || 'Something went wrong. Please try again.',
      )
    },
  })

  const password = watch('password')

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, dateOfBirth, ...rest } = data

    const timeZone = Localization.getCalendars()[0]?.timeZone || 'America/New_York'

    const completeUserData: CreateUserRequest = {
      ...rest,
      dateOfBirth: formatDateForApi(dateOfBirth),
      timeZone,
    }

    registerMutation.mutate(completeUserData)
  }

  const isLoading = registerMutation.isPending

  // Calculate age from date of birth
  const calculateAge = (birthDate: Date): number => {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.semantic.surface.background }]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingBottom: theme.spacing.xxl,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ marginBottom: theme.spacing.xl, paddingTop: theme.spacing.md }}>
            <ThemedText
              style={{
                fontSize: theme.typography.size.xxxl,
                fontWeight: theme.typography.weights.bold,
                color: theme.semantic.text.primary,
                marginBottom: theme.spacing.xs,
                textAlign: 'center',
              }}
            >
              Create Account
            </ThemedText>
            <ThemedText
              style={{
                fontSize: theme.typography.size.md,
                color: theme.semantic.text.secondary,
                textAlign: 'center',
              }}
            >
              Start your mindful running journey
            </ThemedText>
          </View>

          {/* Form */}
          <View>
            {/* Name */}
            <Controller
              control={control}
              name="firstName"
              rules={{
                required: 'First name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
                maxLength: {
                  value: 100,
                  message: 'Name must be less than 100 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="First Name"
                  placeholder="Jane"
                  autoCapitalize="words"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.firstName?.message}
                  disabled={isLoading}
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              rules={{
                required: 'Last name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
                maxLength: {
                  value: 100,
                  message: 'Name must be less than 100 characters',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  autoCapitalize="words"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.lastName?.message}
                  disabled={isLoading}
                />
              )}
            />

            {/* Email */}
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                  disabled={isLoading}
                />
              )}
            />

            {/* Date of Birth */}
            <Controller
              control={control}
              name="dateOfBirth"
              rules={{
                required: 'Date of birth is required',
                validate: {
                  notFuture: (value) =>
                    value <= new Date() || 'Date of birth cannot be in the future',
                  minimumAge: (value) =>
                    calculateAge(value) >= 13 || 'You must be at least 13 years old',
                  maximumAge: (value) =>
                    calculateAge(value) <= 120 || 'Please enter a valid date of birth',
                },
              }}
              render={({ field: { value, onChange } }) => (
                <DatePicker
                  label="Date of Birth"
                  value={value}
                  onChange={onChange}
                  minimumDate={new Date(1900, 0, 1)}
                  maximumDate={new Date()}
                  disabled={isLoading}
                  error={errors.dateOfBirth?.message}
                />
              )}
            />

            {/* Password */}
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain uppercase, lowercase, and number',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="At least 8 characters"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                  disabled={isLoading}
                />
              )}
            />

            {/* Confirm Password */}
            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Re-enter password"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.confirmPassword?.message}
                  disabled={isLoading}
                />
              )}
            />

            {/* Submit Button */}
            <Button
              title={isLoading ? 'Creating Account...' : 'Create Account'}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={{ marginTop: theme.spacing.lg }}
            />

            {/* Login Link */}
            <View
              style={[styles.footer, { marginTop: theme.spacing.lg }]}
            >
              <ThemedText
                style={{
                  fontSize: theme.typography.size.md,
                  color: theme.semantic.text.secondary,
                }}
              >
                Already have an account?{' '}
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: theme.typography.size.md,
                  color: theme.semantic.button.secondary.text,
                  fontWeight: theme.typography.weights.semibold,
                }}
                onPress={() => {
                  router.push('/(auth)/login')
                }}
              >
                Log in
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
