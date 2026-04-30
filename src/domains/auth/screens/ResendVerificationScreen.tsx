import { Button, Input, useAlert } from '@components/ui'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTheme } from '@/theme/useTheme'

import { useResendVerification } from '../hooks'

interface FormData {
  email: string
}

const COOLDOWN_SECONDS = 60

export function ResendVerificationScreen() {
  const router = useRouter()
  const { alert } = useAlert()
  const { bg, text, accent } = useTheme()
  const params = useLocalSearchParams<{ email?: string; fromLogin?: string }>()

  const [sent, setSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { mutate: resend, isPending } = useResendVerification()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { email: params.email ?? '' },
  })

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const startCooldown = () => {
    setCooldown(COOLDOWN_SECONDS)
    intervalRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          intervalRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const onSubmit = (data: FormData) => {
    resend(
      { email: data.email },
      {
        onSuccess: () => {
          setSent(true)
          startCooldown()
        },
        onError: () => {
          alert('Something went wrong', 'Please check your connection and try again.')
        },
      },
    )
  }

  const isButtonDisabled = isPending || cooldown > 0
  const buttonLabel = cooldown > 0 ? `Resend in ${cooldown}s` : sent ? 'Resend link' : 'Send verification link'

  const fromLogin = params.fromLogin === '1'

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg.base }]} edges={['top', 'bottom']}>
      <View style={[styles.content, { paddingHorizontal: 28 }]}>

        <Text style={[styles.heading, { color: text.primary }]}>
          Verify your account
        </Text>

        {fromLogin ? (
          <Text style={[styles.body, { color: text.secondary }]}>
            You couldn't sign in because your account hasn't been verified yet.{' '}
            Check your inbox for the confirmation link we sent when you registered,
            or enter your email below to get a new one.
          </Text>
        ) : (
          <Text style={[styles.body, { color: text.secondary }]}>
            Enter your email address and we'll send you a new verification link.
          </Text>
        )}

        <Text style={[styles.hint, { color: text.tertiary }]}>
          Don't forget to check your spam folder.
        </Text>

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
            disabled={isButtonDisabled}
            style={styles.submitBtn}
          >
            {buttonLabel}
          </Button>
        </View>

        {sent && (
          <Text style={[styles.sentNote, { color: text.secondary }]}>
            If that email has a pending verification, we've sent a new link.
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
    fontSize: 13,
    lineHeight: 13 * 1.5,
    textAlign: 'center',
    marginTop: 20,
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
