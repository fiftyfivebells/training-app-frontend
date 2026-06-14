import { Button, Input, useAlert } from '@components/ui'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTheme } from '@/theme/useTheme'

import { useForgotPassword } from '../hooks'

interface FormData {
  email: string
}

export function ForgotPasswordScreen() {
  const router = useRouter()
  const { alert } = useAlert()
  const { bg, text, accent } = useTheme()

  const [sent, setSent] = useState(false)

  const { mutate: forgotPassword, isPending } = useForgotPassword()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { email: '' },
  })

  const onSubmit = (data: FormData) => {
    forgotPassword(
      { email: data.email },
      {
        onSuccess: () => {
          setSent(true)
        },
        onError: () => {
          alert('Something went wrong', 'Please check your connection and try again.')
        },
      },
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.base }]} edges={['top', 'bottom']}>
      <View style={[styles.content, { paddingHorizontal: 28 }]}>

        <Text style={[styles.heading, { color: text.primary }]}>
          Reset password
        </Text>

        <Text style={[styles.body, { color: text.secondary }]}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        <Text style={[styles.hint, { color: text.tertiary }]}>
          Don't forget to check your spam folder.
        </Text>

        {!sent ? (
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
                  disabled={isPending}
                />
              )}
            />

            <Button
              onPress={handleSubmit(onSubmit)}
              size="lg"
              loading={isPending}
              disabled={isPending}
              style={styles.submitBtn}
            >
              Send reset link
            </Button>
          </View>
        ) : (
          <Text style={[styles.sentNote, { color: text.secondary }]}>
            If that email is registered, we've sent a password reset link.
          </Text>
        )}

        <Pressable onPress={() => router.push('/(auth)/login')} style={styles.backBtn}>
          <Text style={[styles.backText, { color: accent.default }]}>
            Back to sign in
          </Text>
        </Pressable>

      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  heading: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 32,
    letterSpacing: -0.02 * 32,
    marginBottom: 16,
  },
  body: {
    fontFamily: 'Manrope',
    fontSize: 15,
    lineHeight: 15 * 1.6,
    marginBottom: 8,
  },
  hint: {
    fontFamily: 'Manrope',
    fontSize: 13,
    marginBottom: 32,
  },
  form: {
    gap: 14,
  },
  submitBtn: {
    marginTop: 2,
  },
  sentNote: {
    fontFamily: 'Manrope',
    fontSize: 14,
    lineHeight: 14 * 1.6,
  },
  backBtn: {
    alignSelf: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  backText: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 13,
  },
})
