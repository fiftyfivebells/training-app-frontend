import { format, parseISO } from 'date-fns'
import { router } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import type { RunResponse } from '@/domains/runs/api/runsApi'
import { formatDistanceDisplay } from '@/domains/runs/utils/distance'
import { useTheme } from '@/theme/useTheme'

import type { Block } from '../blocks.types'
import { BLOCK_TYPE_CONFIG } from '../constants/blockTypes'
import { BlockSwatch } from './BlockSwatch'

type Props = {
  block: Block
  runs: RunResponse[]
  distUnit: 'km' | 'mi'
}

export function PastBlockCard({ block, runs, distUnit }: Props) {
  const { bg, text, rule } = useTheme()
  const config = BLOCK_TYPE_CONFIG[block.blockType]

  const totalMeters = runs.reduce((s, r) => s + r.distanceMeters, 0)
  const distStr = formatDistanceDisplay(totalMeters, distUnit)

  const displayEndDate =
    block.status !== 'active' && block.completedAt ? block.completedAt : block.endDate

  return (
    <TouchableOpacity
      onPress={() => router.push(`/blocks/${block.id}`)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${config.label} block`}
      style={[
        styles.card,
        {
          backgroundColor: bg.surface,
          borderColor: rule.subtle,
          borderLeftColor: config.accentColor,
          borderRadius: 4,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        },
      ]}
    >
      <View style={styles.cardLeft}>
        <View style={styles.typeRow}>
          <BlockSwatch color={config.accentColor} size={7} />
          <Text style={[styles.typeLabel, { color: config.accentColor }]}>
            {config.label.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.dates, { color: text.tertiary }]}>
          {format(parseISO(block.startDate), 'MMM d')} –{' '}
          {format(parseISO(displayEndDate), 'MMM d')}
        </Text>
      </View>

      <View style={styles.statsArea}>
        <Text style={[styles.statsNum, { color: text.secondary }]}>
          {runs.length}
          <Text style={[styles.statsItalic, { color: text.tertiary }]}>
            {' runs'}
          </Text>
          {'  '}
          {distStr}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={14} color={text.tertiary} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 3,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flex: 1,
    gap: 3,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeLabel: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.1 * 10,
  },
  dates: {
    fontFamily: 'Manrope',
    fontSize: 11,
  },
  statsArea: {
    marginHorizontal: 10,
  },
  statsNum: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  statsItalic: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 13,
  },
})
