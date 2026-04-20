import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { RPE_ZONES } from '@/domains/runs/constants'
import { useTheme } from '@/theme/useTheme'

interface RpeSelectorProps {
  value: number | null
  onChange: (n: number) => void
  hasError: boolean
  errorMessage?: string
  onLayout?: (e: LayoutChangeEvent) => void
}

export function RpeSelector({
  value,
  onChange,
  hasError,
  errorMessage,
  onLayout,
}: RpeSelectorProps) {
  const { colors } = useTheme()

  function rpeZoneColors(n: number) {
    if (n <= 3) return { bg: colors.semantic.successBg, border: '#2A4A2E', text: colors.semantic.successFg }
    if (n <= 6) return { bg: colors.background.surface, border: colors.border.subtle, text: colors.text.tertiary }
    if (n <= 8) return { bg: colors.background.surface, border: colors.border.subtle, text: colors.mood.highTough }
    return { bg: colors.background.surface, border: colors.border.subtle, text: colors.semantic.errorFg }
  }

  return (
    <View style={styles.root} onLayout={onLayout}>
      <Text style={[styles.fieldLabel, { color: colors.text.tertiary }]}>RPE</Text>
      <View style={styles.grid}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const selected = value === n
          const zone = rpeZoneColors(n)
          return (
            <TouchableOpacity
              key={n}
              onPress={() => onChange(n)}
              style={[
                styles.cell,
                {
                  backgroundColor: selected ? colors.copper.default : zone.bg,
                  borderColor: selected ? colors.copper.default : zone.border,
                },
              ]}
              accessibilityLabel={`RPE ${n}`}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  styles.cellText,
                  {
                    color: selected ? colors.background.base : zone.text,
                    fontWeight: selected ? '600' : '400',
                  },
                ]}
              >
                {n}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
      {/* Zone labels — flex weights match zone cell counts (3/3/2/2) */}
      <View style={styles.zoneLabels}>
        {RPE_ZONES.map((zone) => {
          const zoneColor = zone.range[0] <= 3
            ? colors.semantic.successFg
            : zone.range[0] <= 6
              ? '#D4A843'
              : zone.range[0] <= 8
                ? colors.mood.highTough
                : colors.semantic.errorFg
          const cellCount = zone.range[1] - zone.range[0] + 1
          return (
            <Text
              key={zone.label}
              style={[styles.zoneLabel, { color: zoneColor, flex: cellCount }]}
            >
              {zone.label}
            </Text>
          )
        })}
      </View>
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
  grid: {
    flexDirection: 'row',
    gap: 4,
  },
  cell: {
    flex: 1,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 12,
  },
  zoneLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  zoneLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
  },
})
