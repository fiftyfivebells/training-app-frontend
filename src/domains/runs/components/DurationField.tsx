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
  const { colors } = useTheme()

  const fields = [
    { handlers: hh,  label: 'HH', accessLabel: 'Hours'   },
    { handlers: mm,  label: 'MM', accessLabel: 'Minutes' },
    { handlers: ss,  label: 'SS', accessLabel: 'Seconds' },
  ] as const

  return (
    <View style={styles.root} onLayout={onLayout}>
      <Text style={[styles.fieldLabel, { color: colors.text.tertiary }]}>DURATION</Text>
      <View style={styles.durationRow}>
        {fields.map(({ handlers, label, accessLabel }) => (
          <View key={label} style={styles.durationCell}>
            <TextInput
              style={[
                styles.durationInput,
                {
                  backgroundColor: colors.background.input,
                  borderColor:
                    label === 'HH' && hhHasError
                      ? colors.semantic.errorFg
                      : colors.border.subtle,
                  color: colors.text.primary,
                },
              ]}
              value={handlers.value}
              onChangeText={handlers.onChange}
              onBlur={handlers.onBlur}
              keyboardType="number-pad"
              maxLength={3}
              textAlign="center"
              placeholder="00"
              placeholderTextColor={colors.text.tertiary}
              accessibilityLabel={accessLabel}
            />
            <Text style={[styles.durationLabel, { color: colors.text.tertiary }]}>
              {label}
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.paceRow}>
        <Text style={[styles.paceLabel, { color: colors.text.tertiary }]}>PACE</Text>
        <Text style={[styles.paceValue, { color: colors.copper.default }]}>{paceString}</Text>
      </View>
      {hhHasError && (
        <Text style={[styles.errorText, { color: colors.semantic.errorFg }]}>
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
