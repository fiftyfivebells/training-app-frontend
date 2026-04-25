import { differenceInCalendarDays, parseISO } from 'date-fns'
import { router } from 'expo-router'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Dateline } from '@/components/ui'
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
  const { bg, text, rule, radius } = useTheme()
  return (
    <View
      style={[
        styles.statCell,
        { backgroundColor: bg.surface, borderColor: rule.subtle, borderRadius: radius.sm },
      ]}
    >
      <Dateline style={styles.statLabelSpacing}>{label}</Dateline>
      <View style={styles.statValueRow}>
        <Text
          style={[
            styles.statValue,
            { color: dimmed ? text.tertiary : text.primary },
          ]}
        >
          {value}
        </Text>
        <Text style={[styles.statUnit, { color: dimmed ? text.disabled : text.tertiary }]}>
          {unit}
        </Text>
      </View>
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
  const { bg, text, rule, accent, radius } = useTheme()
  return (
    <TouchableOpacity
      onPress={() => router.push(`/blocks/${block.id}`)}
      activeOpacity={0.8}
      style={[
        styles.blockCard,
        { backgroundColor: bg.surface, borderColor: rule.subtle, borderRadius: radius.sm },
      ]}
    >
      <View style={[styles.blockAccent, { backgroundColor: accent.default }]} />
      <View style={styles.blockContent}>
        <Dateline style={[styles.blockLabelSpacing, { color: accent.default }]}>
          Active Block
        </Dateline>
        <View style={styles.blockNameRow}>
          <Text style={[styles.blockName, { color: text.primary }]} numberOfLines={1}>
            {block.name}
          </Text>
          <Text style={[styles.blockDayCounter, { color: text.tertiary }]}>
            Day {currentDay} / {totalDays}
          </Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: bg.base }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: accent.default,
                width: `${Math.round(progressPercent)}%` as `${number}%`,
              },
            ]}
          />
        </View>
        <View style={styles.progressMeta}>
          <Text style={[styles.progressMetaText, { color: text.tertiary }]}>
            {block.startDate}
          </Text>
          <Text style={[styles.progressMetaText, { color: text.tertiary }]}>
            {totalDays} days total
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

type AffirmationCardProps = { affirmation: string | undefined }

function AffirmationCard({ affirmation }: AffirmationCardProps) {
  const { bg, text, accent, radius } = useTheme()
  if (!affirmation) return null
  return (
    <View
      style={[
        styles.affirmationCard,
        { backgroundColor: bg.surface, borderColor: bg.elevated, borderRadius: radius.sm },
      ]}
    >
      <Dateline style={[styles.blockLabelSpacing, { color: accent.default }]}>Today</Dateline>
      <Text style={[styles.affirmationText, { color: text.primary }]}>
        {affirmation}
      </Text>
    </View>
  )
}

type RecentRunsCardProps = {
  runs: RunResponse[]
}

function RecentRunsCard({ runs }: RecentRunsCardProps) {
  const { bg, text, rule, accent, radius } = useTheme()
  return (
    <View
      style={[
        styles.recentRunsCard,
        { backgroundColor: bg.surface, borderColor: rule.subtle, borderRadius: radius.sm },
      ]}
    >
      <View style={styles.recentRunsHeader}>
        <Text style={[styles.recentRunsTitle, { color: text.primary }]}>Recent runs</Text>
        <TouchableOpacity onPress={() => router.navigate('/logbook')}>
          <Text style={[styles.seeAll, { color: text.tertiary }]}>See all</Text>
        </TouchableOpacity>
      </View>
      {runs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: text.tertiary }]}>
            Nothing logged yet.
          </Text>
          <TouchableOpacity onPress={() => router.push('/log')}>
            <Text style={[styles.emptyStateCta, { color: accent.default }]}>
              Log your first run
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        runs.map((run, i) => (
          <View key={run.id}>
            {i > 0 && <View style={[styles.divider, { backgroundColor: rule.subtle }]} />}
            <RunRow run={run} compact />
          </View>
        ))
      )}
    </View>
  )
}

// ---------- main screen ----------

export function HomeScreen() {
  const { bg, text, rule } = useTheme()
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
    <View style={[styles.screen, { backgroundColor: bg.base }]}>
      {/* Header — sticky above scroll */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, backgroundColor: bg.base },
        ]}
      >
        <View>
          <Text style={[styles.greetingSub, { color: text.tertiary }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.greetingName, { color: text.primary }]}>
            {user?.firstName ?? ''}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.avatarBtn,
            {
              backgroundColor: bg.surface,
              borderColor: rule.default,
            },
          ]}
          onPress={() => router.push('/(modals)/profile')}
          accessibilityLabel="Profile"
          accessibilityRole="button"
        >
          <Text style={[styles.avatarText, { color: text.secondary }]}>{initials}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeBlock != null && affirmation?.affirmation != null && (
          <AffirmationCard affirmation={affirmation.affirmation} />
        )}

        {activeBlock != null && (
          <BlockCard
            block={activeBlock}
            currentDay={currentDay}
            totalDays={totalDays}
            progressPercent={progressPercent}
          />
        )}

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
    fontFamily: 'Manrope',
    fontSize: 13,
    lineHeight: 18,
  },
  greetingName: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 26,
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
    fontFamily: 'ManropeSemiBold',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  // Block card
  blockCard: {
    flexDirection: 'row',
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
  blockLabelSpacing: {
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
    fontFamily: 'ManropeSemiBold',
    fontSize: 16,
  },
  blockDayCounter: {
    fontFamily: 'Manrope',
    fontSize: 11,
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
    fontFamily: 'Manrope',
    fontSize: 11,
  },
  // Affirmation card
  affirmationCard: {
    borderWidth: 1,
    padding: 16,
  },
  affirmationText: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 15,
    lineHeight: 24,
  },
  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCell: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  statLabelSpacing: {
    marginBottom: 4,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  statValue: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 28,
    lineHeight: 32,
  },
  statUnit: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 11,
  },
  // Recent runs card
  recentRunsCard: {
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
    fontFamily: 'ManropeSemiBold',
    fontSize: 13,
  },
  seeAll: {
    fontFamily: 'Manrope',
    fontSize: 11,
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
    fontFamily: 'Manrope',
    fontSize: 13,
    textAlign: 'center',
  },
  emptyStateCta: {
    fontFamily: 'ManropeSemiBold',
    fontSize: 13,
  },
})
