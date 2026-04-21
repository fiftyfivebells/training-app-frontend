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
        >
          <View style={[styles.content, { padding: space[6] }]}>
            <ThemedText
              style={{
                fontSize: 32,
                fontWeight: '700',
                color: colors.text.primary,
                marginBottom: space[1],
                textAlign: 'center',
              }}
            >
              Welcome Back
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 15,
                color: colors.text.secondary,
                marginBottom: space[8],
                textAlign: 'center',
              }}
            >
              Sign in to your account
            </ThemedText>

            <View>
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
                    autoComplete="email"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.email?.message}
                    disabled={isSubmitting}
                    onSubmitEditing={handleSubmit(onSubmit)}
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
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.password?.message}
                    disabled={isSubmitting}
                    onSubmitEditing={handleSubmit(onSubmit)}
                    rightElement={
                      <Pressable onPress={() => toggleShowPassword(!showPassword)}>
                        <ThemedText
                          style={{
                            fontSize: 13,
                            color: colors.copper.default,
                            fontWeight: '600',
                          }}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </ThemedText>
                      </Pressable>
                    }
                  />
                )}
              />
              <Pressable
                onPress={() => {
                  alert(
                    'Forgot Password',
                    'Forgot password functionality is not implemented yet.',
                  )
                  //router.push('/(auth)/forgot-password') // TODO: implement forgot password
                }}
                disabled={isSubmitting}
                style={{ alignSelf: 'flex-end', marginBottom: space[4] }}
              >
                <ThemedText
                  style={{
                    fontSize: 13,
                    color: colors.copper.default,
                    fontWeight: '600',
                  }}
                >
                  Forgot password?
                </ThemedText>
              </Pressable>

              <Button
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={{ marginTop: space[4] }}
              >
                Sign In
              </Button>
            </View>

            <View style={[styles.footer, { marginTop: space[8] }]}>
              <ThemedText
                style={{
                  fontSize: 13,
                  color: colors.text.secondary,
                }}
              >
                Don't have an account?{' '}
              </ThemedText>
              <Pressable
                onPress={() => {
                  router.push('/(auth)/register')
                }}
                disabled={isSubmitting}
              >
                <ThemedText
                  style={{
                    fontSize: 13,
                    color: colors.copper.default,
                    fontWeight: '600',
                  }}
                >
                  Create Account
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
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
