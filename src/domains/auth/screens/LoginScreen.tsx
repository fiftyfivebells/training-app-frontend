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
import { useTheme } from '@/theme/ThemeProvider'

import { useAuthContext } from '../context/AuthContext'

interface LoginFormData extends LoginRequest {
  email: string
  password: string
}

export function LoginScreen() {
  const router = useRouter()
  const { alert } = useAlert()
  const { login, isLoading } = useAuthContext()
  const theme = useTheme()

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
    try {
      await login(data.email, data.password)
    } catch (err: any) {
      alert(
        'Login Failed',
        err?.message || 'Invalid email or password. Please try again.',
      )
    }
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
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.content, { padding: theme.spacing.lg }]}>
            <ThemedText
              style={{
                fontSize: theme.typography.size.xxxl,
                fontWeight: theme.typography.weights.bold,
                color: theme.semantic.text.primary,
                marginBottom: theme.spacing.xs,
                textAlign: 'center',
              }}
            >
              Welcome Back
            </ThemedText>
            <ThemedText
              style={{
                fontSize: theme.typography.size.md,
                color: theme.semantic.text.secondary,
                marginBottom: theme.spacing.xl,
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
                    disabled={isLoading}
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
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.password?.message}
                    disabled={isLoading}
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                )}
              />

              <Button
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={isLoading}
                style={{ marginTop: theme.spacing.md }}
              >
                Sign In
              </Button>
            </View>

            <View style={[styles.footer, { marginTop: theme.spacing.xl }]}>
              <ThemedText
                style={{
                  fontSize: theme.typography.size.sm,
                  color: theme.semantic.text.secondary,
                }}
              >
                Don't have an account?{' '}
              </ThemedText>
              <Pressable
                onPress={() => {
                  router.push('/(auth)/register')
                }}
                disabled={isLoading}
              >
                <ThemedText
                  style={{
                    fontSize: theme.typography.size.sm,
                    color: theme.semantic.button.secondary.text,
                    fontWeight: theme.typography.weights.semibold,
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
