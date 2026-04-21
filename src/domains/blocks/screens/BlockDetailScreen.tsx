import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { router, useLocalSearchParams } from 'expo-router'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Ionicons } from '@expo/vector-icons'

import { RunRow } from '@/domains/runs/components/RunRow'
import { useRuns } from '@/domains/runs/hooks/useRuns'
import { metersToDistanceUnit } from '@/domains/runs/utils/distance'
import { useDistanceUnit } from '@/hooks/useDistanceUnit'
import { useTheme } from '@/theme/useTheme'

import { BLOCK_TYPE_CONFIG } from '../constants/blockTypes'
import { useBlock } from '../hooks/useBlock'
import { useBlockRuns } from '../hooks/useBlockRuns'
import { useBlockStats } from '../hooks/useBlockStats'
import { MoodTimelineCard } from '../components/MoodTimelineCard'

export function BlockDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { unit: distUnit } = useDistanceUnit()

  const { data: block, isLoading: blockLoading } = useBlock(id ?? '')
  const { data: blockRuns = [] } = useBlockRuns(id ?? '')
  const { data: stats } = useBlockStats(id ?? '')

  if (blockLoading || !block) {
    return <View style={[styles.screen, { backgroundColor: colors.background.base }]} />
  }

  const config = BLOCK_TYPE_CONFIG[block.blockType]
  const totalDays = differenceInCalendarDays(parseISO(block.endDate), parseISO(block.startDate)) + 1

  const distValue = stats
    ? Math.round(
        metersToDistanceUnit(
          stats.totalDistanceMeters,
          distUnit === 'mi' ? 'miles' : distUnit,
        ),
      )
    : 0

  return (
    <View style={[styles.screen, { backgroundColor: colors.background.base }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: colors.background.base,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          {config.label}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity Card */}
        <View
          style={[
            styles.identityCard,
            {
              backgroundColor: colors.background.surface,
              borderColor: colors.border.subtle,
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
              <Text style={[styles.dayNumber, { color: colors.text.primary }]}>
                {totalDays}
              </Text>
              <Text style={[styles.dayLabel, { color: colors.text.tertiary }]}>Days</Text>
            </View>
          </View>

          <Text
            style={[
              styles.tagline,
              { color: colors.text.primary, fontFamily: 'Fraunces_400Regular' },
            ]}
          >
            {config.tagline}
          </Text>

          <View
            style={[
              styles.completionBadge,
              {
                backgroundColor: colors.semantic.successBg,
              },
            ]}
          >
            <Text
              style={[
                styles.completionBadgeText,
                { color: colors.semantic.successFg },
              ]}
            >
              Completed · {format(parseISO(block.endDate), 'MMM d')}
            </Text>
          </View>

          <View style={styles.progressMeta}>
            <Text style={[styles.progressMetaText, { color: colors.text.tertiary }]}>
              Started {format(parseISO(block.startDate), 'MMM d')}
            </Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCell,
              {
                backgroundColor: colors.background.surface,
                borderColor: colors.border.subtle,
              },
            ]}
          >
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {stats?.runCount ?? 0}
            </Text>
            <Text style={[styles.statUnit, { color: colors.text.tertiary }]}>Runs</Text>
          </View>

          <View
            style={[
              styles.statCell,
              {
                backgroundColor: colors.background.surface,
                borderColor: colors.border.subtle,
              },
            ]}
          >
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {distValue}
            </Text>
            <Text style={[styles.statUnit, { color: colors.text.tertiary }]}>
              {distUnit}
            </Text>
          </View>

          <View
            style={[
              styles.statCell,
              {
                backgroundColor: colors.background.surface,
                borderColor: colors.border.subtle,
              },
            ]}
          >
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {stats && stats.runCount > 0 ? stats.avgRpe.toFixed(1) : '—'}
            </Text>
            <Text style={[styles.statUnit, { color: colors.text.tertiary }]}>Avg RPE</Text>
          </View>
        </View>

        <MoodTimelineCard blockRuns={blockRuns} />

        {/* Runs preview card */}
        <View
          style={[
            styles.runsCard,
            {
              backgroundColor: colors.background.surface,
              borderColor: colors.border.subtle,
            },
          ]}
        >
          <View style={styles.runsCardHeader}>
            <Text style={[styles.sectionLabel, { color: colors.text.tertiary }]}>
              RUNS THIS BLOCK
            </Text>
            <TouchableOpacity
              onPress={() => router.push(`/blocks/${block.id}/runs`)}
              accessibilityRole="button"
              accessibilityLabel={`See all ${blockRuns.length} runs`}
            >
              <Text style={[styles.seeAll, { color: colors.copper.default }]}>
                See all {blockRuns.length}
              </Text>
            </TouchableOpacity>
          </View>

          {blockRuns.length === 0 ? (
            <Text style={[styles.noRunsText, { color: colors.text.tertiary }]}>
              No runs logged
            </Text>
          ) : (
            blockRuns.slice(0, 3).map((run, index) => (
              <View key={run.id}>
                {index > 0 && (
                  <View
                    style={[styles.divider, { backgroundColor: colors.border.subtle }]}
                  />
                )}
                <RunRow run={run} />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
  },
  headerRight: {
    width: 40, // balance back btn
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
  },
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
  completionBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 14,
  },
  completionBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressMetaText: {
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
  },
  statCell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  statUnit: {
    fontSize: 10,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.06,
    marginBottom: 10,
  },
  runsCard: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 8,
  },
  runsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  seeAll: {
    fontSize: 11,
    fontWeight: '500',
  },
  noRunsText: {
    fontSize: 14,
    padding: 16,
  },
  divider: {
    height: 1,
    marginHorizontal: 14,
  },
})
