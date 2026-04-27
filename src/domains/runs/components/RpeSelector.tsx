import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { RPE_ZONES } from '@/domains/runs/constants'
import { Dateline } from '@/components/ui'
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
  const { bg, text, rule, accent, mood, moodBg, semantic } = useTheme()

  function rpeZoneColors(n: number) {
    if (n <= 3) return { bg: semantic.successBg,  border: '#2A4A2E', text: semantic.success }
    if (n <= 6) return { bg: moodBg.highGood,      border: '#4A3810', text: '#D4A843'       }
    if (n <= 8) return { bg: moodBg.highTough,     border: '#4A1810', text: mood.highTough  }
    return       { bg: semantic.errorBg,   border: '#4A1010', text: semantic.error  }
  }

  return (
    <View style={styles.root} onLayout={onLayout}>
      <Dateline>RPE</Dateline>
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
                  backgroundColor: selected ? accent.default : zone.bg,
                  borderColor: selected ? accent.default : zone.border,
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
                    color: selected ? bg.base : zone.text,
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
            ? semantic.success
            : zone.range[0] <= 6
              ? '#D4A843'
              : zone.range[0] <= 8
                ? mood.highTough
                : semantic.error
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
    fontFamily: 'Manrope',
    fontSize: 12,
  },
  zoneLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  zoneLabel: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '500',
  },
})
