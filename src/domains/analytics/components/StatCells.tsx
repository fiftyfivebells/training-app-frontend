import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'

export type StatCell = {
  label: string
  value: string
  unit?: string
  sub?: string
  color?: string
}

type Props = {
  cells: StatCell[]
}

export function StatCells({ cells }: Props) {
  const { rule, text } = useTheme()
  return (
    <View style={[styles.wrapper, { borderTopColor: rule.subtle, borderBottomColor: rule.subtle }]}>
      {cells.map((cell, i) => (
        <View
          key={i}
          style={[
            styles.cell,
            i < cells.length - 1 && { borderRightWidth: 1, borderRightColor: rule.subtle },
          ]}
        >
          <Text style={[styles.cellLabel, { color: text.tertiary }]}>{cell.label}</Text>
          <View style={styles.valueRow}>
            <Text
              style={[styles.value, { color: cell.color ?? text.primary }]}
            >
              {cell.value}
            </Text>
            {cell.unit && (
              <Text style={[styles.unit, { color: text.tertiary }]}>{cell.unit}</Text>
            )}
          </View>
          {cell.sub && (
            <Text style={[styles.sub, { color: text.tertiary }]}>{cell.sub}</Text>
          )}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  cell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  cellLabel: {
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.12 * 9,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  value: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 22,
    letterSpacing: -0.02 * 22,
    lineHeight: 22,
    fontVariant: ['tabular-nums', 'lining-nums'],
  },
  unit: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 10,
    marginLeft: 2,
  },
  sub: {
    fontFamily: 'Manrope',
    fontSize: 9,
    marginTop: 2,
  },
})
