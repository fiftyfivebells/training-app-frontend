import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import type { Sentiment } from '@/domains/analytics/utils/types'

export type InsightSummaryCardProps = {
  headline: string
  body: string
  sentiment: Sentiment
}

export function InsightSummaryCard({ headline, body, sentiment }: InsightSummaryCardProps) {
  const { bg, text, rule, accent, mood, moodBg, semantic } = useTheme()

  let backgroundColor = bg.surface
  let borderColor = rule.subtle
  let headlineColor = text.primary

  if (sentiment === 'positive') {
    backgroundColor = '#141A0A'
    borderColor = 'rgba(184, 212, 74, 0.2)'
    headlineColor = mood.highGood
  } else if (sentiment === 'warning') {
    backgroundColor = '#16101E'
    borderColor = 'rgba(155, 96, 184, 0.2)'
    headlineColor = mood.lowTough
  }

  return (
    <View style={[styles.card, { backgroundColor, borderColor }]}>
      <Text style={[styles.headline, { color: headlineColor }]}>{headline}</Text>
      <Text style={[styles.body, { color: text.secondary }]}>{body}</Text>
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
    fontWeight: '600',
    fontSize: 14,
  },
  body: {
    fontWeight: '400',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },
})
