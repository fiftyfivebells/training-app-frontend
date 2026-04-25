import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { StyleSheet, Text, View } from 'react-native'

import { Dateline } from '@/components/ui'
import { useTheme } from '@/theme/useTheme'

import type { Block } from '../blocks.types'
import type { BlockTypeConfig } from '../constants/blockTypes'

type Props = {
  block: Block
  config: BlockTypeConfig
}

export function ActiveBlockCard({ block, config }: Props) {
  const { bg, text, rule, radius } = useTheme()

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
          borderTopRightRadius: radius.sm,
          borderBottomRightRadius: radius.sm,
        },
      ]}
    >
      <View style={styles.identityTop}>
        <Dateline style={{ color: config.accentColor }}>{config.label}</Dateline>

        <View
          style={[
            styles.dayCounter,
            {
              backgroundColor: config.accentColor + '14',
              borderColor: config.accentColor + '26',
              borderRadius: radius.sm,
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
    padding: 16,
  },
  identityTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayCounter: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'flex-end',
  },
  dayLabel: {
    fontFamily: 'Manrope',
    fontSize: 10,
  },
  dayNumber: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 22,
    lineHeight: 26,
  },
  tagline: {
    fontSize: 22,
    lineHeight: 28,
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
    fontFamily: 'Manrope',
    fontSize: 11,
  },
})
