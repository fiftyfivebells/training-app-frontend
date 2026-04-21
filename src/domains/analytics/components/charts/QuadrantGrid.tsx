import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import type { RpeVsMoodResult } from '@/domains/analytics/utils/computeRpeVsMood'

export type QuadrantGridProps = {
  grid: RpeVsMoodResult['grid']
  isWarning: boolean
  compact: boolean
}

const CELL_BG = {
  highRpeGood: '#141A0A',
  highRpeTough: '#211208',
  lowRpeGood: '#091D1E',
  lowRpeTough: '#160E1E',
} as const

export function QuadrantGrid({ grid, isWarning, compact }: QuadrantGridProps) {
  const { colors } = useTheme()

  const CELL_COLOR = {
    highRpeGood: colors.mood.highGood,
    highRpeTough: colors.mood.highTough,
    lowRpeGood: colors.mood.lowGood,
    lowRpeTough: colors.mood.lowTough,
  }

  const renderCell = (
    key: keyof typeof grid,
    label: string,
    isWarningCell: boolean
  ) => {
    const isWarningActive = isWarning && isWarningCell
    const count = grid[key]

    if (compact) {
      const rpeLabel = key.startsWith('high') ? 'HI' : 'LO'
      return (
        <View
          key={key}
          style={[
            styles.compactCell,
            { backgroundColor: CELL_BG[key], opacity: 0.8 },
            isWarningActive && {
              borderWidth: 2,
              borderColor: colors.mood.lowTough,
            },
          ]}
        >
          <Text style={[styles.compactLabel, { color: colors.text.tertiary }]}>{rpeLabel}</Text>
          <Text style={[styles.compactCount, { color: CELL_COLOR[key] }]}>{count}</Text>
        </View>
      )
    }

    return (
      <View
        key={key}
        style={[
          styles.expandedCell,
          { backgroundColor: CELL_BG[key] },
          isWarningActive && {
            borderWidth: 2,
            borderColor: colors.mood.lowTough,
          },
        ]}
      >
        {isWarningActive && (
          <View
            style={[styles.warningDot, { backgroundColor: colors.mood.lowTough }]}
          />
        )}
        <Text style={[styles.expandedCount, { color: CELL_COLOR[key] }]}>{count}</Text>
        <Text style={[styles.expandedLabel, { color: colors.text.tertiary }]}>
          {label}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.grid}>
      {renderCell('highRpeGood', 'High RPE · Good', false)}
      {renderCell('highRpeTough', 'High RPE · Tough', false)}
      {renderCell('lowRpeGood', 'Low RPE · Good', false)}
      {renderCell('lowRpeTough', 'Low RPE · Tough', true)}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  compactCell: {
    width: '50%',
    padding: 4,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  compactCount: {
    fontWeight: '600',
    fontSize: 16,
  },
  compactLabel: {
    fontWeight: '500',
    fontSize: 8,
  },
  expandedCell: {
    width: '50%',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedCount: {
    fontWeight: '600',
    fontSize: 28,
  },
  expandedLabel: {
    fontWeight: '400',
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
  },
  warningDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
})
