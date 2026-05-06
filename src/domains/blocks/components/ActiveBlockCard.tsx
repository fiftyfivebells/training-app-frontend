import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { router } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

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

export function ActiveBlockCard({ block, runs, distUnit }: Props) {
  const { text, rule } = useTheme()
  const config = BLOCK_TYPE_CONFIG[block.blockType]
  const ac = config.accentColor

  const today = new Date()
  const startDate = parseISO(block.startDate)
  const endDate = parseISO(block.endDate)
  const totalDays = differenceInCalendarDays(endDate, startDate) + 1
  const currentDay = Math.min(totalDays, Math.max(1, differenceInCalendarDays(today, startDate) + 1))
  const daysLeft = Math.max(0, differenceInCalendarDays(endDate, today))
  const progress = Math.min(1, currentDay / totalDays)

  const totalMeters = runs.reduce((s, r) => s + r.distanceMeters, 0)
  const distStr = formatDistanceDisplay(totalMeters, distUnit)

  return (
    <TouchableOpacity
      onPress={() => router.push(`/blocks/${block.id}`)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${config.label} active block`}
      style={[
        styles.card,
        {
          backgroundColor: ac + '12',
          borderColor: rule.subtle,
          borderLeftColor: ac,
          borderRadius: 4,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        },
      ]}
    >
      <View style={styles.top}>
        <View style={styles.topLeft}>
          <View style={styles.typeRow}>
            <BlockSwatch color={ac} size={8} />
            <Text style={[styles.typeLabel, { color: ac }]}>
              {config.label.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.tagline, { color: text.primary }]}>
            {config.tagline}.
          </Text>
        </View>
        {/* Day counter */}
        <View
          style={[
            styles.dayCounter,
            { backgroundColor: ac + '14', borderColor: ac + '28' },
          ]}
        >
          <Text style={[styles.dayLabel, { color: text.tertiary }]}>DAY</Text>
          <Text style={[styles.dayNumber, { color: text.primary }]}>{currentDay}</Text>
          <Text style={[styles.dayOf, { color: text.tertiary }]}>of {totalDays}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: ac + '22' }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: ac, width: `${Math.round(progress * 100)}%` },
          ]}
        />
      </View>

      {/* Meta line */}
      <View style={styles.meta}>
        <Text style={[styles.metaText, { color: text.tertiary }]}>
          {format(startDate, 'MMM d')}
        </Text>
        <Text style={[styles.metaText, { color: text.tertiary }]}>
          {runs.length} runs · {distStr} · {daysLeft} days left
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 3,
    padding: 14,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  topLeft: {
    flex: 1,
    gap: 4,
    marginRight: 14,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  typeLabel: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.1 * 10,
  },
  tagline: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 20,
    lineHeight: 22,
    letterSpacing: -0.01 * 20,
  },
  dayCounter: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  dayLabel: {
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.1 * 9,
  },
  dayNumber: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 24,
    lineHeight: 24,
    fontVariant: ['tabular-nums', 'lining-nums'],
  },
  dayOf: {
    fontFamily: 'Manrope',
    fontSize: 9,
    marginTop: 1,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontFamily: 'Manrope',
    fontSize: 10,
  },
})
