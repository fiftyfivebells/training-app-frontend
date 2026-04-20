import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { RUN_TYPE_GROUPS } from '@/domains/runs/constants'
import { useTheme } from '@/theme/useTheme'

interface RunTypePickerProps {
  value: string
  onChange: (v: string) => void
  hasError: boolean
  errorMessage?: string
  onLayout?: (e: LayoutChangeEvent) => void
}

export function RunTypePicker({
  value,
  onChange,
  hasError,
  errorMessage,
  onLayout,
}: RunTypePickerProps) {
  const { colors } = useTheme()

  return (
    <View style={styles.root} onLayout={onLayout}>
      <Text style={[styles.fieldLabel, { color: colors.text.tertiary }]}>RUN TYPE</Text>
      {RUN_TYPE_GROUPS.map((group) => (
        <View key={group.label} style={styles.group}>
          <Text style={[styles.groupLabel, { color: colors.text.tertiary }]}>
            {group.label}
          </Text>
          <View style={styles.pills}>
            {group.types.map((type) => {
              const active = value === type
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => onChange(type)}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: active ? colors.copper.default : colors.background.surface,
                      borderColor: active ? colors.copper.default : colors.border.subtle,
                    },
                  ]}
                  accessibilityLabel={type}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    style={[
                      styles.pillText,
                      {
                        color: active ? colors.background.base : colors.text.tertiary,
                        fontWeight: active ? '600' : '400',
                      },
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      ))}
      {hasError && (
        <Text style={[styles.errorText, { color: colors.semantic.errorFg }]}>
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
  group: {
    gap: 8,
  },
  groupLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.6,
  },
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
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
  },
})
