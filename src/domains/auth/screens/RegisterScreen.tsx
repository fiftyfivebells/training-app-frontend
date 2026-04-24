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
  Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/useTheme'

import type { CreateUserRequest } from '../api/authClient'
import { useRegister } from '../hooks'
import { SocialAuthButtons } from '../components/SocialAuthButtons'

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
  const { bg, text, rule, accent, mood, moodBg, semantic, space, radius } = useTheme()

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
      style={[styles.container, { backgroundColor: bg.base }]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{
            paddingHorizontal: space[6],
            paddingTop: space[8],
            paddingBottom: space[10],
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText
              style={{
                fontSize: 36,
                fontFamily: 'Fraunces_400Regular',
                color: text.primary,
                marginBottom: space[2],
                textAlign: 'center',
              }}
            >
              Create Account
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 16,
                color: text.secondary,
                textAlign: 'center',
              }}
            >
              Start your mindful running journey
            </ThemedText>
          </View>

          <View style={styles.form}>
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
                  label="FIRST NAME"
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
                  label="LAST NAME"
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
                  label="EMAIL"
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
                  label="DATE OF BIRTH"
                  value={value}
                  onChange={onChange}
                  minimumDate={new Date(1900, 0, 1)}
                  maximumDate={new Date()}
                  disabled={isLoading}
                  error={errors.dateOfBirth?.message}
                />
              )}
            />

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
                  label="PASSWORD"
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

            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="CONFIRM PASSWORD"
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

            <Button
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={{ marginTop: space[4] }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </View>

          <SocialAuthButtons 
            onStravaPress={() => alert('Strava Registration', 'Integration coming soon.')}
            onGooglePress={() => alert('Google Registration', 'Integration coming soon.')}
            onApplePress={() => alert('Apple Registration', 'Integration coming soon.')}
          />

          <View style={styles.footer}>
            <ThemedText style={{ color: text.secondary }}>
              Already have an account?{' '}
            </ThemedText>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <ThemedText style={{ color: accent.default, fontWeight: '600' }}>
                Log in
              </ThemedText>
            </Pressable>
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
  header: {
    marginBottom: 32,
  },
  form: {
    gap: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    paddingBottom: 20,
  },
})
