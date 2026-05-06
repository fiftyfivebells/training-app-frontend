import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import type { TimeRange } from '@/domains/analytics/utils/types'

const OPTIONS: { v: TimeRange; label: string }[] = [
  { v: '4w', label: '4w' },
  { v: '8w', label: '8w' },
  { v: '12w', label: '12w' },
  { v: 'all', label: 'All' },
]

type Props = {
  value: TimeRange
  onChange: (v: TimeRange) => void
}

export function RangePills({ value, onChange }: Props) {
  const { bg, rule, text } = useTheme()
  return (
    <View style={styles.row}>
      {OPTIONS.map((opt) => {
        const active = value === opt.v
        return (
          <Pressable
            key={opt.v}
            onPress={() => onChange(opt.v)}
            style={[
              styles.pill,
              {
                borderColor: active ? rule.strong : rule.subtle,
                backgroundColor: active ? bg.elevated : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: active ? text.primary : text.tertiary, fontWeight: active ? '600' : '400' },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  pill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 3,
    borderWidth: 1,
  },
  label: {
    fontFamily: 'Manrope',
    fontSize: 10,
    letterSpacing: 0.04,
  },
})
