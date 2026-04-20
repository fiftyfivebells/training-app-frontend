import { differenceInCalendarDays, parseISO } from 'date-fns'
import { router } from 'expo-router'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useActiveBlock } from '@/domains/blocks/hooks/useActiveBlock'
import { useTodayAffirmation } from '@/domains/blocks/hooks/useTodayAffirmation'
import type { Block } from '@/domains/blocks/blocks.types'
import type { RunResponse } from '@/domains/runs/api/runsApi'
import { RunRow } from '@/domains/runs/components/RunRow'
import { useRuns } from '@/domains/runs/hooks/useRuns'
import { formatDistanceParts } from '@/domains/runs/utils/distance'
import { computeWeeklyStats } from '@/domains/runs/utils/weeklyStats'
import { useGetCurrentUser } from '@/domains/users/hooks/useGetCurrentUser'
import { useDistanceUnit } from '@/hooks/useDistanceUnit'
import { useTheme } from '@/theme/useTheme'

// ---------- constants ----------

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// ---------- sub-components ----------

type StatCellProps = {
  label: string
  value: string
  unit: string
  dimmed?: boolean
}

function StatCell({ label, value, unit, dimmed = false }: StatCellProps) {
  const { colors } = useTheme()
  return (
    <View
      style={[
        styles.statCell,
        { backgroundColor: colors.background.surface, borderColor: colors.border.subtle },
      ]}
    >
      <Text style={[styles.statLabel, { color: colors.text.tertiary }]}>{label}</Text>
      <Text
        style={[
          styles.statValue,
          { color: dimmed ? colors.text.tertiary : colors.text.primary },
        ]}
      >
        {value}
      </Text>
      <Text style={[styles.statUnit, { color: colors.text.tertiary }]}>{unit}</Text>
    </View>
  )
}

type BlockCardProps = {
  block: Block
  currentDay: number
  totalDays: number
  progressPercent: number
}

function BlockCard({ block, currentDay, totalDays, progressPercent }: BlockCardProps) {
  const { colors } = useTheme()
  return (
    <View
      style={[
        styles.blockCard,
        { backgroundColor: colors.background.surface, borderColor: colors.border.subtle },
      ]}
    >
      <View style={[styles.blockAccent, { backgroundColor: colors.copper.default }]} />
      <View style={styles.blockContent}>
        <Text style={[styles.sectionLabel, { color: colors.copper.default }]}>ACTIVE BLOCK</Text>
        <View style={styles.blockNameRow}>
          <Text style={[styles.blockName, { color: colors.text.primary }]} numberOfLines={1}>
            {block.name}
          </Text>
          <View
            style={[
              styles.dayPill,
              { backgroundColor: colors.copper.subtle, borderColor: colors.copper.muted },
            ]}
          >
            <Text style={[styles.dayPillText, { color: colors.copper.default }]}>
              Day {currentDay}
            </Text>
          </View>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.background.base }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.copper.default,
                width: `${Math.round(progressPercent)}%` as `${number}%`,
              },
            ]}
          />
        </View>
        <View style={styles.progressMeta}>
          <Text style={[styles.progressMetaText, { color: colors.text.tertiary }]}>
            {block.startDate}
          </Text>
          <Text style={[styles.progressMetaText, { color: colors.text.tertiary }]}>
            {totalDays} days total
          </Text>
        </View>
      </View>
    </View>
  )
}

type AffirmationCardProps = { affirmation: string | undefined }

function AffirmationCard({ affirmation }: AffirmationCardProps) {
  const { colors } = useTheme()
  return (
    <View
      style={[
        styles.affirmationCard,
        { backgroundColor: colors.copper.subtle, borderColor: colors.copper.muted },
      ]}
    >
      <Text style={[styles.sectionLabel, { color: colors.copper.default }]}>TODAY</Text>
      <Text style={[styles.affirmationText, { color: colors.text.primary }]}>
        {affirmation ?? ''}
      </Text>
    </View>
  )
}

type RecentRunsCardProps = {
  runs: RunResponse[]
}

function RecentRunsCard({ runs }: RecentRunsCardProps) {
  const { colors } = useTheme()
  return (
    <View
      style={[
        styles.recentRunsCard,
        { backgroundColor: colors.background.surface, borderColor: colors.border.subtle },
      ]}
    >
      <View style={styles.recentRunsHeader}>
        <Text style={[styles.recentRunsTitle, { color: colors.text.primary }]}>Recent runs</Text>
        <TouchableOpacity onPress={() => router.navigate('/(tabs)/logbook')}>
          <Text style={[styles.seeAll, { color: colors.copper.default }]}>See all</Text>
        </TouchableOpacity>
      </View>
      {runs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: colors.text.tertiary }]}>
            Nothing logged yet.
          </Text>
          <TouchableOpacity onPress={() => router.push('/log')}>
            <Text style={[styles.emptyStateCta, { color: colors.copper.default }]}>
              Log your first run
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        runs.map((run, i) => (
          <View key={run.id}>
            {i > 0 && <View style={[styles.divider, { backgroundColor: colors.border.subtle }]} />}
            <RunRow run={run} compact />
          </View>
        ))
      )}
    </View>
  )
}

// ---------- main screen ----------

export function HomeScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { unit } = useDistanceUnit()

  const { data: user } = useGetCurrentUser()
  const { data: activeBlock } = useActiveBlock()
  const { data: affirmation } = useTodayAffirmation()
  const { data: runs = [] } = useRuns()

  const recentRuns = runs.slice(0, 3)
  const { weeklyDistanceMeters, streak, blockRunCount } = computeWeeklyStats(
    runs,
    activeBlock?.id,
  )

  const initials =
    user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : ''
  const { value: weeklyValue, unit: weeklyUnit } = formatDistanceParts(weeklyDistanceMeters, unit)

  // Block day counter
  let currentDay = 0
  let totalDays = 0
  let progressPercent = 0
  if (activeBlock) {
    const today = new Date()
    const start = parseISO(activeBlock.startDate)
    const end = parseISO(activeBlock.endDate)
    currentDay = Math.max(1, differenceInCalendarDays(today, start) + 1)
    totalDays = Math.max(1, differenceInCalendarDays(end, start) + 1)
    progressPercent = Math.min(100, Math.max(0, (currentDay / totalDays) * 100))
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background.base }]}>
      {/* Header — sticky above scroll */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, backgroundColor: colors.background.base },
        ]}
      >
        <View>
          <Text style={[styles.greetingSub, { color: colors.text.tertiary }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.greetingName, { color: colors.text.primary }]}>
            {user?.firstName ?? ''}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.avatarBtn,
            {
              backgroundColor: colors.background.surface,
              borderColor: colors.border.default,
            },
          ]}
          onPress={() => router.push('/profile')}
          accessibilityLabel="Profile"
          accessibilityRole="button"
        >
          <Text style={[styles.avatarText, { color: colors.text.secondary }]}>{initials}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeBlock != null && (
          <BlockCard
            block={activeBlock}
            currentDay={currentDay}
            totalDays={totalDays}
            progressPercent={progressPercent}
          />
        )}

        <AffirmationCard affirmation={affirmation?.affirmation} />

        <View style={styles.statsRow}>
          <StatCell label="THIS WEEK" value={weeklyValue} unit={weeklyUnit} />
          <StatCell
            label="STREAK"
            value={String(streak)}
            unit={streak === 1 ? 'day' : 'days'}
          />
          <StatCell
            label="BLOCK RUNS"
            value={String(blockRunCount)}
            unit="runs"
            dimmed={activeBlock == null}
          />
        </View>

        <RecentRunsCard runs={recentRuns} />
      </ScrollView>
    </View>
  )
}

// ---------- styles ----------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  greetingSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  greetingName: {
    fontSize: 26,
    fontFamily: 'Fraunces_400Regular',
    lineHeight: 29,
    letterSpacing: -0.3,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  // Block card
  blockCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  blockAccent: {
    width: 3,
  },
  blockContent: {
    flex: 1,
    padding: 14,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  blockNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  blockName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  dayPill: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  dayPillText: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressTrack: {
    height: 4,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 4,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressMetaText: {
    fontSize: 11,
  },
  // Affirmation card
  affirmationCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  affirmationText: {
    fontSize: 15,
    fontFamily: 'Fraunces_400Regular_Italic',
    lineHeight: 24,
  },
  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCell: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  statUnit: {
    fontSize: 10,
    marginTop: 1,
  },
  // Recent runs card
  recentRunsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  recentRunsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  recentRunsTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 11,
    fontWeight: '500',
  },
  divider: {
    height: 1,
  },
  // Empty state
  emptyState: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  emptyStateText: {
    fontSize: 13,
    textAlign: 'center',
  },
  emptyStateCta: {
    fontSize: 13,
    fontWeight: '500',
  },
})
