import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import { useTheme } from '@/theme/useTheme'

interface FieldHandlers {
  value: string
  onChange: (v: string) => void
  onBlur: () => void
}

interface DurationFieldProps {
  hh: FieldHandlers
  mm: FieldHandlers
  ss: FieldHandlers
  hhHasError: boolean
  hhErrorMessage?: string
  paceString: string
  onLayout?: (e: LayoutChangeEvent) => void
}

export function DurationField({
  hh,
  mm,
  ss,
  hhHasError,
  hhErrorMessage,
  paceString,
  onLayout,
}: DurationFieldProps) {
  const { bg, text, rule, accent, mood, moodBg, semantic } = useTheme()

  const fields = [
    { handlers: hh,  label: 'HH', accessLabel: 'Hours'   },
    { handlers: mm,  label: 'MM', accessLabel: 'Minutes' },
    { handlers: ss,  label: 'SS', accessLabel: 'Seconds' },
  ] as const

  return (
    <View style={styles.root} onLayout={onLayout}>
      <Text style={[styles.fieldLabel, { color: text.tertiary }]}>DURATION</Text>
      <View style={styles.durationRow}>
        {fields.map(({ handlers, label, accessLabel }) => (
          <View key={label} style={styles.durationCell}>
            <TextInput
              style={[
                styles.durationInput,
                {
                  backgroundColor: bg.input,
                  borderColor:
                    label === 'HH' && hhHasError
                      ? semantic.error
                      : rule.subtle,
                  color: text.primary,
                },
              ]}
              value={handlers.value}
              onChangeText={handlers.onChange}
              onBlur={handlers.onBlur}
              keyboardType="number-pad"
              maxLength={3}
              textAlign="center"
              placeholder="00"
              placeholderTextColor={text.tertiary}
              accessibilityLabel={accessLabel}
            />
            <Text style={[styles.durationLabel, { color: text.tertiary }]}>
              {label}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.paceRow}>
        <Text style={[styles.paceLabel, { color: text.tertiary }]}>PACE</Text>
        <Text style={[styles.paceValue, { color: accent.default }]}>{paceString}</Text>
      </View>
      {hhHasError && (
        <Text style={[styles.errorText, { color: semantic.error }]}>
          {hhErrorMessage}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.6,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationCell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  durationInput: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 28,
    fontWeight: '300',
  },
  durationLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  paceRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'baseline',
    gap: 6,
  },
  paceLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  paceValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
  },
})
