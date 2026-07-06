import * as Application from 'expo-application'
import { router } from 'expo-router'
import { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Dateline, DoubleRule } from '@/components/ui'
import { useTheme } from '@/theme/useTheme'
import { useSubmitFeedback } from '../hooks/useSubmitFeedback'

const CATEGORIES = ['Bug', 'Idea', 'Praise', 'Other'] as const
type Category = (typeof CATEGORIES)[number]

const MAX_CHARS = 2000
const COUNTER_THRESHOLD = 1800

export function FeedbackScreen() {
  const { bg, text, rule, accent, radius, semantic } = useTheme()
  const insets = useSafeAreaInsets()

  const [category, setCategory] = useState<Category>('Idea')
  const [message, setMessage] = useState('')

  const { mutate: submit, isPending } = useSubmitFeedback()

  const trimmed = message.trim()
  const canSubmit = trimmed.length > 0 && !isPending
  const showCounter = message.length >= COUNTER_THRESHOLD

  const handleSend = () => {
    if (!canSubmit) return
    submit(
      {
        category,
        message: trimmed,
        appVersion: Application.nativeApplicationVersion ?? undefined,
        platform: (['android', 'ios', 'web'] as const).find((p) => p === Platform.OS),
      },
      {
        onSuccess: () => {
          Alert.alert('Thanks', 'Your feedback has been sent.', [
            { text: 'OK', onPress: () => router.back() },
          ])
        },
        onError: (err) => {
          Alert.alert('Could not send', err.message ?? 'Something went wrong. Please try again.')
        },
      },
    )
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: bg.base }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, paddingHorizontal: 16, backgroundColor: bg.base },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          >
            <Text style={[styles.headerCancel, { color: text.secondary }]}>Cancel</Text>
          </TouchableOpacity>

          <Dateline style={styles.headerLabel}>FEEDBACK</Dateline>

          <TouchableOpacity
            onPress={handleSend}
            disabled={!canSubmit}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          >
            <Text style={[styles.headerSend, { color: canSubmit ? accent.default : text.tertiary }]}>
              Send
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.screenTitle, { color: text.primary }]}>Share your thoughts.</Text>
        <DoubleRule style={styles.headerRule} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Category picker */}
        <View style={styles.section}>
          <Dateline>CATEGORY</Dateline>
          <View style={styles.pills}>
            {CATEGORIES.map((cat) => {
              const active = category === cat
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: active ? accent.default : bg.surface,
                      borderColor: active ? accent.default : rule.subtle,
                    },
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    style={[
                      styles.pillText,
                      {
                        color: active ? bg.base : text.tertiary,
                        fontWeight: active ? '600' : '400',
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Message */}
        <View style={styles.section}>
          <Dateline>MESSAGE</Dateline>
          <TextInput
            style={[
              styles.messageInput,
              {
                backgroundColor: bg.input,
                borderColor: rule.subtle,
                borderRadius: radius.sm,
                color: text.primary,
              },
            ]}
            value={message}
            onChangeText={(t) => setMessage(t.slice(0, MAX_CHARS))}
            multiline
            placeholder="What's on your mind?"
            placeholderTextColor={text.tertiary}
            textAlignVertical="top"
          />
          {showCounter && (
            <Text
              style={[
                styles.counter,
                { color: message.length >= MAX_CHARS ? semantic.error : text.tertiary },
              ]}
            >
              {message.length}/{MAX_CHARS}
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { gap: 4 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCancel: { fontFamily: 'Fraunces_400Regular_Italic', fontSize: 13 },
  headerLabel: { flex: 1, textAlign: 'center' },
  headerSend: { fontFamily: 'Fraunces_400Regular_Italic', fontSize: 13 },
  screenTitle: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 32,
    letterSpacing: -0.02 * 32,
    lineHeight: 35,
  },
  headerRule: { marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  section: { gap: 8 },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontFamily: 'Manrope',
    fontSize: 14,
  },
  messageInput: {
    minHeight: 120,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Fraunces_400Regular_Italic',
    textAlignVertical: 'top',
  },
  counter: {
    fontFamily: 'Manrope',
    fontSize: 11,
    textAlign: 'right',
  },
})
