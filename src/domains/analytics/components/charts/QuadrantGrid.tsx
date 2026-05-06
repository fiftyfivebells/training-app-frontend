import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import type { RpeVsMoodResult } from '@/domains/analytics/utils/computeRpeVsMood'

export type QuadrantGridProps = {
  grid: RpeVsMoodResult['grid']
  isWarning: boolean
  compact: boolean
}

export function QuadrantGrid({ grid, isWarning, compact }: QuadrantGridProps) {
  const { text, mood, moodBg } = useTheme()

  const CELL_COLOR: Record<keyof typeof grid, string> = {
    highRpeGood: mood.highGood,
    highRpeTough: mood.highTough,
    lowRpeGood: mood.lowGood,
    lowRpeTough: mood.lowTough,
  }

  const CELL_BG: Record<keyof typeof grid, string> = {
    highRpeGood: moodBg.highGood,
    highRpeTough: moodBg.highTough,
    lowRpeGood: moodBg.lowGood,
    lowRpeTough: moodBg.lowTough,
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
            { backgroundColor: CELL_BG[key] },
            isWarningActive && {
              borderWidth: 2,
              borderColor: mood.lowTough,
            },
          ]}
        >
          <Text style={[styles.compactLabel, { color: text.tertiary }]}>{rpeLabel}</Text>
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
            borderColor: mood.lowTough,
          },
        ]}
      >
        {isWarningActive && (
          <View
            style={[styles.warningDot, { backgroundColor: mood.lowTough }]}
          />
        )}
        <View style={styles.countRow}>
          <Text style={[styles.expandedCount, { color: CELL_COLOR[key] }]}>{count}</Text>
          <Text style={[styles.expandedUnit, { color: text.tertiary }]}>runs</Text>
        </View>
        <Text style={[styles.expandedLabel, { color: CELL_COLOR[key] }]}>
          {label}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        {renderCell('highRpeGood', 'High RPE · Good', false)}
        {renderCell('highRpeTough', 'High RPE · Tough', false)}
      </View>
      <View style={styles.row}>
        {renderCell('lowRpeGood', 'Low RPE · Good', false)}
        {renderCell('lowRpeTough', 'Low RPE · Tough', true)}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'column',
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  compactCell: {
    flex: 1,
    padding: 4,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderRadius: 4,
  },
  compactCount: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 16,
  },
  compactLabel: {
    fontFamily: 'Manrope',
    fontWeight: '500',
    fontSize: 8,
  },
  expandedCell: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  expandedCount: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 28,
  },
  expandedUnit: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 10,
  },
  expandedLabel: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 8,
    letterSpacing: 0.12 * 8,
    marginTop: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
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
