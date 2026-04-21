import { Button, Input, useAlert } from '@components/ui'
import type { LoginRequest } from '@domains/auth/api/authClient'
import { useRouter } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/useTheme'

import { useAuthContext } from '../context/AuthContext'
import { useState } from 'react'
import { SocialAuthButtons } from '../components/SocialAuthButtons'

interface LoginFormData extends LoginRequest {
  email: string
  password: string
}

export function LoginScreen() {
  const router = useRouter()
  const { alert } = useAlert()
  const [showPassword, toggleShowPassword] = useState<boolean>(false)
  const { login } = useAuthContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { colors, space, radius } = useTheme()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    try {
      await login(data.email, data.password)
    } catch (err: any) {
      alert(
        'Login Failed',
        err?.message || 'Invalid email or password. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.base }]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { paddingHorizontal: space[6], paddingTop: space[8], paddingBottom: space[10] }]}>
            <View style={styles.header}>
              <ThemedText
                style={{
                  fontSize: 36,
                  fontFamily: 'Fraunces_400Regular',
                  color: colors.text.primary,
                  marginBottom: space[2],
                  textAlign: 'center',
                }}
              >
                Welcome Back
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 16,
                  color: colors.text.secondary,
                  textAlign: 'center',
                }}
              >
                Sign in to continue your journey
              </ThemedText>
            </View>

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

              <View style={styles.passwordContainer}>
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: 'Password is required',
                  }}
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
                          <ThemedText
                            style={{
                              fontSize: 12,
                              color: colors.copper.default,
                              fontWeight: '600',
                            }}
                          >
                            {showPassword ? 'HIDE' : 'SHOW'}
                          </ThemedText>
                        </Pressable>
                      }
                    />
                  )}
                />
                <Pressable
                  onPress={() => {
                    alert('Forgot Password', 'Not implemented yet.')
                  }}
                  style={styles.forgotBtn}
                >
                  <ThemedText style={[styles.forgotText, { color: colors.copper.default }]}>
                    Forgot password?
                  </ThemedText>
                </Pressable>
              </View>

              <Button
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.submitBtn}
              >
                Sign In
              </Button>
            </View>

            <SocialAuthButtons 
              onStravaPress={() => alert('Strava Login', 'Integration coming soon.')}
              onGooglePress={() => alert('Google Login', 'Integration coming soon.')}
              onApplePress={() => alert('Apple Login', 'Integration coming soon.')}
            />

            <View style={styles.footer}>
              <ThemedText style={{ color: colors.text.secondary }}>
                Don't have an account?{' '}
              </ThemedText>
              <Pressable onPress={() => router.push('/(auth)/register')}>
                <ThemedText style={{ color: colors.copper.default, fontWeight: '600' }}>
                  Create one
                </ThemedText>
              </Pressable>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: 40,
  },
  form: {
    gap: 4,
  },
  passwordContainer: {
    marginBottom: 12,
  },
  passwordToggle: {
    paddingHorizontal: 8,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -8,
    paddingVertical: 8,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '500',
  },
  submitBtn: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    paddingBottom: 20,
  },
})
