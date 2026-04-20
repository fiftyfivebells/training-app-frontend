import { router } from 'expo-router'
import {
  Alert,
  Pressable,
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
import { useActiveBlock } from '../hooks/useActiveBlock'
import { useBlockRuns } from '../hooks/useBlockRuns'
import { useBlockStats } from '../hooks/useBlockStats'
import { useCompletedBlocks } from '../hooks/useCompletedBlocks'
import { ActiveBlockCard } from '../components/ActiveBlockCard'
import { MoodTimelineCard } from '../components/MoodTimelineCard'
import { PastBlockCard } from '../components/PastBlockCard'

export function BlocksScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  const { data: activeBlock, isLoading: blockLoading } = useActiveBlock()
  const { data: completedBlocks = [] } = useCompletedBlocks()
  const { data: blockRuns = [] } = useBlockRuns(activeBlock?.id ?? '')
  const { data: stats } = useBlockStats(activeBlock?.id ?? '')
  const { data: allRuns = [] } = useRuns()
  const { unit: distUnit } = useDistanceUnit()

  const activeConfig = activeBlock ? BLOCK_TYPE_CONFIG[activeBlock.blockType] : null

  const distValue = stats
    ? Math.round(
        metersToDistanceUnit(
          stats.totalDistanceMeters,
          distUnit === 'mi' ? 'miles' : distUnit,
        ),
      )
    : 0

  const isEmpty = !blockLoading && !activeBlock && completedBlocks.length === 0

  const openBlockCreate = () => {
    if (activeBlock) {
      const label = BLOCK_TYPE_CONFIG[activeBlock.blockType].label
      Alert.alert(
        'Start a new block?',
        `Starting a new block will end your current ${label} block. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: () => router.push('/(modals)/block-create'),
          },
        ],
      )
    } else {
      router.push('/(modals)/block-create')
    }
  }

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
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Blocks</Text>
        <Pressable
          onPress={openBlockCreate}
          style={[
            styles.newBlockBtn,
            {
              backgroundColor: colors.copper.subtle,
              borderColor: colors.copper.muted,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="New block"
        >
          <Text style={[styles.newBlockBtnText, { color: colors.copper.default }]}>
            + New block
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Full empty state */}
        {isEmpty && (
          <View style={styles.fullEmpty}>
            <Text
              style={[
                styles.fullEmptyText,
                { color: colors.text.secondary, fontFamily: 'Fraunces_400Italic' },
              ]}
            >
              Your training history will appear here.
            </Text>
          </View>
        )}

        {/* Active block section */}
        {activeBlock && activeConfig && (
          <>
            <ActiveBlockCard block={activeBlock} config={activeConfig} />

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
                  onPress={() => router.push(`/blocks/${activeBlock.id}/runs`)}
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
                  No runs logged yet
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
          </>
        )}

        {/* No-block CTA */}
        {!blockLoading && !activeBlock && completedBlocks.length > 0 && (
          <View
            style={[
              styles.noBlockCta,
              {
                backgroundColor: colors.background.surface,
                borderColor: colors.border.default,
              },
            ]}
          >
            <View
              style={[
                styles.noBlockIcon,
                {
                  backgroundColor: colors.copper.subtle,
                  borderColor: colors.copper.muted,
                },
              ]}
            >
              <Ionicons name="add" size={20} color={colors.copper.default} />
            </View>
            <Text
              style={[
                styles.noBlockHeading,
                { color: colors.text.primary, fontFamily: 'Fraunces_400Regular' },
              ]}
            >
              Ready to start training?
            </Text>
            <Text style={[styles.noBlockSub, { color: colors.text.secondary }]}>
              Choose a training block to structure your running and track your progress.
            </Text>
            <Pressable
              onPress={() => router.push('/(modals)/block-create')}
              style={[styles.noBlockBtn, { backgroundColor: colors.copper.default }]}
              accessibilityRole="button"
              accessibilityLabel="Start a block"
            >
              <Text style={[styles.noBlockBtnText, { color: colors.background.base }]}>
                Start a block
              </Text>
            </Pressable>
          </View>
        )}

        {/* Past blocks section */}
        {completedBlocks.length > 0 && (
          <>
            <Text style={[styles.pastBlocksHeader, { color: colors.text.primary }]}>
              Past blocks
            </Text>
            {completedBlocks.map((block) => (
              <PastBlockCard
                key={block.id}
                block={block}
                runs={allRuns.filter((r) => r.blockId === block.id)}
                distUnit={distUnit}
              />
            ))}
          </>
        )}
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
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  newBlockBtn: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  newBlockBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
  },
  fullEmpty: {
    paddingHorizontal: 32,
    paddingTop: 60,
    alignItems: 'center',
  },
  fullEmptyText: {
    fontSize: 15,
    textAlign: 'center',
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
  noBlockCta: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  noBlockIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noBlockHeading: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 12,
  },
  noBlockSub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  noBlockBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  noBlockBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pastBlocksHeader: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingBottom: 10,
    marginTop: 8,
  },
})
