import { format, parseISO } from 'date-fns'
import { router } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import type { RunResponse } from '@/domains/runs/api/runsApi'
import { formatDistanceDisplay } from '@/domains/runs/utils/distance'
import { useTheme } from '@/theme/useTheme'

import type { Block } from '../blocks.types'
import { BLOCK_TYPE_CONFIG } from '../constants/blockTypes'

type Props = {
  block: Block
  runs: RunResponse[]
  distUnit: 'km' | 'mi'
}

export function PastBlockCard({ block, runs, distUnit }: Props) {
  const { colors } = useTheme()
  const config = BLOCK_TYPE_CONFIG[block.blockType]

  const totalMeters = runs.reduce((s, r) => s + r.distanceMeters, 0)
  const distStr = formatDistanceDisplay(totalMeters, distUnit)

  return (
    <TouchableOpacity
      onPress={() => router.push(`/blocks/${block.id}`)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${config.label} block`}
      style={[
        styles.pastCard,
        {
          backgroundColor: colors.background.surface,
          borderColor: colors.border.subtle,
          borderLeftColor: config.accentColor,
        },
      ]}
    >
      <View style={styles.pastCardLeft}>
        <View style={styles.pastCardTypeRow}>
          <View style={[styles.dot8, { backgroundColor: config.accentColor }]} />
          <Text style={[styles.typeLabel, { color: config.accentColor }]}>
            {config.label.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.pastCardDates, { color: colors.text.tertiary }]}>
          {format(parseISO(block.startDate), 'MMM d')} –{' '}
          {format(parseISO(block.endDate), 'MMM d')}
        </Text>
      </View>

      <Text style={[styles.pastCardStats, { color: colors.text.primary }]}>
        {runs.length}{' '}
        <Text style={[styles.pastCardStatsUnit, { color: colors.text.tertiary }]}>
          {runs.length === 1 ? 'run' : 'runs'}
        </Text>
        {'  '}
        {distStr}
      </Text>

      <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  pastCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 3,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pastCardLeft: {
    flex: 1,
    gap: 3,
  },
  pastCardTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot8: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.06,
  },
  pastCardDates: {
    fontSize: 12,
  },
  pastCardStats: {
    fontSize: 12,
    fontWeight: '500',
    marginHorizontal: 12,
  },
  pastCardStatsUnit: {
    fontWeight: '400',
  },
})
