import { Button, Input, useAlert } from '@components/ui'
import type { LoginRequest } from '@domains/auth/api/authClient'
import { ApiError } from '@lib/api/error'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTheme } from '@/theme/useTheme'

import { useAuthContext } from '../context/AuthContext'
import { useGoogleSignIn, useStravaSignIn } from '../hooks'
import { SocialAuthButtons } from '../components/SocialAuthButtons'

interface LoginFormData extends LoginRequest {
  email: string
  password: string
}

export function LoginScreen() {
  const router = useRouter()
  const { alert } = useAlert()
  const [showPassword, toggleShowPassword] = useState(false)
  const { login } = useAuthContext()
  const { handlePress: handleGooglePress } = useGoogleSignIn()
  const { handlePress: handleStravaPress } = useStravaSignIn()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { bg, text, accent, space } = useTheme()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    try {
      await login(data.email, data.password)
    } catch (err: any) {
      if (err instanceof ApiError && err.isForbidden) {
        router.push({
          pathname: '/(auth)/resend-verification',
          params: { email: data.email, fromLogin: '1' },
        })
      } else {
        alert('Login Failed', err?.message || 'Invalid email or password. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.base }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { paddingHorizontal: 28, paddingTop: space[10] }]}>

            {/* Wordmark */}
            <View style={styles.header}>
              <Text style={[styles.wordmark, { color: text.primary }]}>
                Base Phase
              </Text>
              <Text style={[styles.tagline, { color: text.secondary }]}>
                Running by feel.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
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
                    autoComplete="email"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.email?.message}
                    disabled={isSubmitting}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                rules={{ required: 'Password is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="PASSWORD"
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.password?.message}
                    disabled={isSubmitting}
                    rightElement={
                      <Pressable onPress={() => toggleShowPassword(!showPassword)} style={styles.passwordToggle}>
                        <Text style={[styles.showHide, { color: accent.default }]}>
                          {showPassword ? 'HIDE' : 'SHOW'}
                        </Text>
                      </Pressable>
                    }
                  />
                )}
              />

              <Button
                onPress={handleSubmit(onSubmit)}
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.submitBtn}
              >
                Sign In
              </Button>

              <Pressable
                onPress={() => alert('Forgot Password', 'Not implemented yet.')}
                style={styles.forgotBtn}
              >
                <Text style={[styles.forgotText, { color: text.secondary }]}>
                  Forgot password?
                </Text>
              </Pressable>
            </View>

            <SocialAuthButtons
              onStravaPress={handleStravaPress}
              onGooglePress={handleGooglePress}
              // onApplePress={() => alert('Apple Login', 'Integration coming soon.')}
            />

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: text.secondary }]}>
                Don't have an account?{'  '}
              </Text>
              <Pressable onPress={() => router.push('/(auth)/register')}>
                <Text style={[styles.createLink, { color: accent.default }]}>
                  Create account
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => router.push('/(auth)/resend-verification')}
              style={styles.resendBtn}
            >
              <Text style={[styles.resendText, { color: text.tertiary }]}>
                Didn't receive your verification email?
              </Text>
            </Pressable>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1 },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  wordmark: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 44,
    letterSpacing: -0.02 * 44,
    lineHeight: 44 * 0.95,
  },
  tagline: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 15,
    marginTop: 8,
  },
  form: {
    gap: 14,
  },
  passwordToggle: {
    paddingHorizontal: 8,
  },
  showHide: {
    fontFamily: 'ManropeSemiBold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  submitBtn: {
    marginTop: 2,
  },
  forgotBtn: {
    alignSelf: 'center',
    paddingVertical: 14,
  },
  forgotText: {
    fontFamily: 'Manrope',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    fontFamily: 'Manrope',
    fontSize: 14,
  },
  createLink: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 13,
  },
  resendBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  resendText: {
    fontFamily: 'Manrope',
    fontSize: 12,
  },
})
