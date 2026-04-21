import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import type { Sentiment } from '@/domains/analytics/utils/types'

export type InsightSummaryCardProps = {
  headline: string
  body: string
  sentiment: Sentiment
}

export function InsightSummaryCard({ headline, body, sentiment }: InsightSummaryCardProps) {
  const { colors } = useTheme()

  let backgroundColor = colors.background.surface
  let borderColor = colors.border.subtle
  let headlineColor = colors.text.primary

  if (sentiment === 'positive') {
    backgroundColor = '#141A0A'
    borderColor = 'rgba(184, 212, 74, 0.2)'
    headlineColor = colors.mood.highGood
  } else if (sentiment === 'warning') {
    backgroundColor = '#16101E'
    borderColor = 'rgba(155, 96, 184, 0.2)'
    headlineColor = colors.mood.lowTough
  }

  return (
    <View style={[styles.card, { backgroundColor, borderColor }]}>
      <Text style={[styles.headline, { color: headlineColor }]}>{headline}</Text>
      <Text style={[styles.body, { color: colors.text.secondary }]}>{body}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  headline: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },
})
