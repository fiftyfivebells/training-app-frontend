import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import { useTheme } from '@/theme/useTheme'

interface DistanceFieldProps {
  value: string
  onChange: (v: string) => void
  onBlur: () => void
  hasError: boolean
  errorMessage?: string
  displayUnit: 'km' | 'mi'
  onUnitToggle: (unit: 'km' | 'mi') => void
  onLayout?: (e: LayoutChangeEvent) => void
}

export function DistanceField({
  value,
  onChange,
  onBlur,
  hasError,
  errorMessage,
  displayUnit,
  onUnitToggle,
  onLayout,
}: DistanceFieldProps) {
  const { bg, text, rule, accent, mood, moodBg, semantic } = useTheme()

  return (
    <View style={styles.root} onLayout={onLayout}>
      <Text style={[styles.fieldLabel, { color: text.tertiary }]}>DISTANCE</Text>
      <View style={styles.distanceRow}>
        <TextInput
          style={[
            styles.distanceInput,
            {
              backgroundColor: bg.input,
              borderColor: hasError ? semantic.error : rule.subtle,
              color: text.primary,
            },
          ]}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={text.tertiary}
          accessibilityLabel="Distance"
        />
        <View
          style={[
            styles.unitSelector,
            { backgroundColor: bg.base, borderColor: rule.subtle },
          ]}
        >
          {(['km', 'mi'] as const).map((unit) => (
            <TouchableOpacity
              key={unit}
              onPress={() => onUnitToggle(unit)}
              style={[
                styles.unitBtn,
                displayUnit === unit && { backgroundColor: accent.default, borderRadius: 7 },
              ]}
              accessibilityLabel={`${unit} unit`}
            >
              <Text
                style={[
                  styles.unitBtnText,
                  { color: displayUnit === unit ? bg.base : text.tertiary },
                ]}
              >
                {unit}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {hasError && (
        <Text style={[styles.errorText, { color: semantic.error }]}>
          {errorMessage}
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
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  distanceInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 24,
    fontWeight: '300',
    textAlign: 'right',
  },
  unitSelector: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    gap: 2,
  },
  unitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
  },
})
