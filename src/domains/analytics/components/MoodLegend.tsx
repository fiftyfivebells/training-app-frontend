import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'

const ITEMS = [
  { label: 'High · Good', key: 'highGood' },
  { label: 'Low · Good', key: 'lowGood' },
  { label: 'High · Tough', key: 'highTough' },
  { label: 'Low · Tough', key: 'lowTough' },
] as const

export function MoodLegend() {
  const { mood, text } = useTheme()
  return (
    <View style={styles.container}>
      {ITEMS.map((item) => (
        <View key={item.key} style={styles.item}>
          <View style={[styles.swatch, { backgroundColor: mood[item.key] }]} />
          <Text style={[styles.label, { color: text.tertiary }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingVertical: 14,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  swatch: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  label: {
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.08 * 9,
    textTransform: 'uppercase',
  },
})
