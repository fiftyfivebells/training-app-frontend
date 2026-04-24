import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { StyleSheet, Text, View } from 'react-native'

import { useTheme } from '@/theme/useTheme'

import type { Block } from '../blocks.types'
import type { BlockTypeConfig } from '../constants/blockTypes'

type Props = {
  block: Block
  config: BlockTypeConfig
}

export function ActiveBlockCard({ block, config }: Props) {
  const { bg, text, rule, accent, mood, moodBg, semantic } = useTheme()

  const today = new Date()
  const currentDay = differenceInCalendarDays(today, parseISO(block.startDate)) + 1
  const totalDays =
    differenceInCalendarDays(parseISO(block.endDate), parseISO(block.startDate)) + 1
  const progressPct = Math.max(0, Math.min((currentDay / totalDays) * 100, 100))
  const daysLeft = Math.max(0, differenceInCalendarDays(parseISO(block.endDate), today))

  return (
    <View
      style={[
        styles.identityCard,
        {
          backgroundColor: bg.surface,
          borderColor: rule.subtle,
          borderLeftColor: config.accentColor,
        },
      ]}
    >
      <View style={styles.identityTop}>
        <View style={styles.identityTypeRow}>
          <View style={[styles.dot8, { backgroundColor: config.accentColor }]} />
          <Text style={[styles.typeLabel, { color: config.accentColor }]}>
            {config.label.toUpperCase()}
          </Text>
        </View>

        <View
          style={[
            styles.dayCounter,
            {
              backgroundColor: config.accentColor + '14',
              borderColor: config.accentColor + '26',
            },
          ]}
        >
          <Text style={[styles.dayLabel, { color: text.tertiary }]}>Day</Text>
          <Text style={[styles.dayNumber, { color: text.primary }]}>
            {currentDay}
          </Text>
          <Text style={[styles.dayLabel, { color: text.tertiary }]}>
            of {totalDays}
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.tagline,
          { color: text.primary, fontFamily: 'Fraunces_400Regular' },
        ]}
      >
        {config.tagline}
      </Text>

      <View style={[styles.progressTrack, { backgroundColor: bg.base }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: config.accentColor, width: `${progressPct}%` },
          ]}
        />
      </View>

      <View style={styles.progressMeta}>
        <Text style={[styles.progressMetaText, { color: text.tertiary }]}>
          Started {format(parseISO(block.startDate), 'MMM d')}
        </Text>
        <Text style={[styles.progressMetaText, { color: text.tertiary }]}>
          Ends {format(parseISO(block.endDate), 'MMM d')} · {daysLeft} days left
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  identityCard: {
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 3,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    padding: 16,
  },
  identityTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  identityTypeRow: {
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
  dayCounter: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'flex-end',
  },
  dayLabel: {
    fontSize: 10,
  },
  dayNumber: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 26,
  },
  tagline: {
    fontSize: 22,
    lineHeight: 28,
    marginTop: 8,
  },
  progressTrack: {
    height: 5,
    borderRadius: 4,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    borderRadius: 4,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressMetaText: {
    fontSize: 11,
  },
})
