import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { Dateline } from '@/components/ui'
import { useTheme } from '@/theme/useTheme'

import { formatDistanceParts } from '../utils/distance'
import type { Period } from '../utils/groupRunsByPeriod'
import { RunRow } from './RunRow'

interface PeriodSectionProps {
  period: Period
  expanded: boolean
  onToggle: () => void
  unit: 'km' | 'mi'
}

export function PeriodSection({ period, expanded, onToggle, unit }: PeriodSectionProps) {
  const { bg, text, rule, accent, radius } = useTheme()
  const distParts = formatDistanceParts(period.totalMeters, unit)

  const visibleRuns =
    period.type === 'current-week'
      ? period.runs
      : period.type === 'week' && !expanded
      ? period.runs.slice(0, 1)
      : period.type === 'month' && !expanded
      ? []
      : period.runs

  const showFooter =
    (period.type === 'week' && !expanded && period.runs.length > 1) ||
    period.type === 'month'

  const footerLabel =
    period.type === 'week'
      ? `${period.runs.length - 1} more ${period.runs.length - 1 === 1 ? 'run' : 'runs'} this week`
      : expanded
      ? 'Show less'
      : `Show ${period.runs.length} ${period.runs.length === 1 ? 'run' : 'runs'}`

  return (
    <View style={styles.section}>
      {/* Period header */}
      <View style={styles.header}>
        <Dateline>{period.label}</Dateline>
        <View style={styles.headerRight}>
          <Text style={[styles.runCount, { color: text.tertiary }]}>
            {period.runs.length} {period.runs.length === 1 ? 'run' : 'runs'}
          </Text>
          <Text style={[styles.totalDist, { color: accent.default }]}>
            {distParts.value} {distParts.unit}
          </Text>
        </View>
      </View>

      {/* Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: bg.surface, borderColor: rule.subtle, borderRadius: radius.sm },
        ]}
      >
        {visibleRuns.map((run, index) => (
          <View key={run.id}>
            {index > 0 && (
              <View style={[styles.divider, { backgroundColor: rule.subtle }]} />
            )}
            <RunRow run={run} />
          </View>
        ))}

        {showFooter && (
          <>
            {visibleRuns.length > 0 && (
              <View style={[styles.divider, { backgroundColor: rule.subtle }]} />
            )}
            <TouchableOpacity
              style={styles.footerRow}
              onPress={onToggle}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={footerLabel}
            >
              <Text style={[styles.footerText, { color: text.tertiary }]}>
                {footerLabel}
              </Text>
              <Ionicons
                name={
                  period.type === 'week'
                    ? 'chevron-down'
                    : expanded
                    ? 'chevron-up'
                    : 'chevron-forward'
                }
                size={14}
                color={text.tertiary}
              />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  runCount: {
    fontFamily: 'Manrope',
    fontSize: 11,
    lineHeight: 16,
  },
  totalDist: {
    fontFamily: 'ManropeSemiBold',
    fontSize: 11,
    lineHeight: 16,
  },
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  footerText: {
    fontFamily: 'Manrope',
    fontSize: 12,
    lineHeight: 16,
  },
})
