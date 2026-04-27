import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { RUN_TYPE_GROUPS } from '@/domains/runs/constants'
import { Dateline } from '@/components/ui'
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
  const { bg, text, rule, accent, semantic } = useTheme()

  return (
    <View style={styles.root} onLayout={onLayout}>
      <Dateline>RUN TYPE</Dateline>
      {RUN_TYPE_GROUPS.map((group) => (
        <View key={group.label} style={styles.group}>
          <Dateline>{group.label}</Dateline>
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
                      backgroundColor: active ? accent.default : bg.surface,
                      borderColor: active ? accent.default : rule.subtle,
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
                        color: active ? bg.base : text.tertiary,
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
  group: {
    gap: 8,
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
    fontFamily: 'Manrope',
    fontSize: 14,
  },
  errorText: {
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '500',
  },
})
