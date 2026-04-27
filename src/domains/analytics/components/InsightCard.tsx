import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/theme/useTheme'
import { Dateline } from '@/components/ui'
import type { Sentiment } from '@/domains/analytics/utils/types'

export type InsightCardProps = {
  label: string
  headline: string
  sub: string
  sentiment: Sentiment
  hasEnoughData: boolean
  onPress: () => void
  children?: React.ReactNode
}

export function InsightCard({
  label,
  headline,
  sub,
  sentiment,
  hasEnoughData,
  onPress,
  children,
}: InsightCardProps) {
  const { bg, text, rule, mood } = useTheme()

  const subColor =
    sentiment === 'positive'
      ? mood.highGood
      : sentiment === 'warning'
        ? mood.lowTough
        : text.secondary

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: bg.surface,
          borderColor: rule.subtle,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.topRow}>
        <Dateline>{label}</Dateline>
        <Ionicons name="chevron-forward" size={16} color={text.tertiary} />
      </View>
      <Text style={[styles.headline, { color: text.primary }]}>{headline}</Text>
      <Text style={[styles.sub, { color: subColor }]}>{sub}</Text>

      {hasEnoughData && children ? (
        <View style={styles.chartContainer}>{children}</View>
      ) : !hasEnoughData ? (
        <Text style={[styles.noData, { color: text.secondary }]}>
          Not enough data yet — keep logging and this insight will appear.
        </Text>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headline: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    fontSize: 13,
    marginTop: 4,
  },
  sub: {
    fontFamily: 'Manrope',
    fontWeight: '400',
    fontSize: 10,
    marginTop: 2,
  },
  chartContainer: {
    marginTop: 8,
    height: 72,
    overflow: 'hidden',
  },
  noData: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
})
