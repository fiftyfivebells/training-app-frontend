import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { AppModal } from '@/components/layout/AppModal'
import { Screen } from '@/components/layout/Screen'
import { useAlert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { ThemedText } from '@/components/ui/ThemedText'
import { useGetAllMoods } from '@/domains/moods/hooks/useGetAllMoods'
import { moodCategories } from '@/domains/moods/moods.constants'
import { getMoodCategoryColor } from '@/domains/moods/utils/mood'
import { useRuns } from '@/domains/runs/hooks/useRuns'
import { computeMoodAnalytics, QuadrantBreakdown } from '@/domains/runs/utils/analytics'
import { useTheme } from '@/theme/ThemeProvider'

import { BLOCK_TYPE_CONFIG, Block } from '../blocks.types'
import { useBlock } from '../hooks/useBlock'
import { useCompleteBlock } from '../hooks/useCompleteBlock'
import { useDeleteBlock } from '../hooks/useDeleteBlock'

// ---------- File-local subcomponents ----------

function ProgressBar({ percent, accentColor }: { percent: number; accentColor: string }) {
  const theme = useTheme()
  return (
    <View
      style={[
        styles.progressTrack,
        {
          backgroundColor: theme.semantic.border.default,
          borderRadius: theme.radius.full,
          height: 8,
        },
      ]}
    >
      <View
        style={{
          width: `${percent}%` as `${number}%`,
          backgroundColor: accentColor,
          borderRadius: theme.radius.full,
          height: 8,
        }}
      />
    </View>
  )
}

function StatusBadge({ status }: { status: Block['status'] }) {
  const theme = useTheme()
  const isActive = status === 'active'
  const label = status === 'active' ? 'Active' : status === 'completed' ? 'Completed' : 'Expired'
  return (
    <View
      style={{
        backgroundColor: isActive
          ? theme.semantic.button.primary.bg
          : theme.semantic.surface.cardAlt,
        borderRadius: theme.radius.full,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 3,
      }}
    >
      <ThemedText
        style={{
          fontSize: theme.typography.size.xs,
          fontWeight: theme.typography.weights.semibold,
          color: isActive ? theme.semantic.button.primary.text : theme.semantic.text.secondary,
        }}
      >
        {label}
      </ThemedText>
    </View>
  )
}

function SectionHeading({ children }: { children: string }) {
  const theme = useTheme()
  return (
    <ThemedText
      style={{
        fontSize: theme.typography.size.sm,
        fontWeight: theme.typography.weights.semibold,
        color: theme.semantic.text.secondary,
        marginBottom: theme.spacing.sm,
      }}
    >
      {children}
    </ThemedText>
  )
}

function QuadrantRow({ row }: { row: QuadrantBreakdown }) {
  const theme = useTheme()
  const color = getMoodCategoryColor(theme, row.key)
  const category = moodCategories.find((c) => c.key === row.key)!
  const barWidth = row.count > 0 ? `${Math.max(row.percentage, 2)}%` : '0%'

  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      <View style={[styles.rowHeader, { marginBottom: theme.spacing.sm }]}>
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            backgroundColor: color,
            marginRight: theme.spacing.sm,
          }}
        />
        <ThemedText
          style={{
            flex: 1,
            fontSize: theme.typography.size.sm,
            color: theme.semantic.text.primary,
          }}
        >
          {category.title}
        </ThemedText>
        <ThemedText
          style={{ fontSize: theme.typography.size.sm, color: theme.semantic.text.secondary }}
        >
          {row.count} {row.count !== 1 ? 'runs' : 'run'}
        </ThemedText>
      </View>
      <View
        style={{
          backgroundColor: theme.semantic.surface.card,
          borderRadius: theme.radius.xs,
          height: 4,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: barWidth as `${number}%`,
            height: 4,
            backgroundColor: color,
            borderRadius: theme.radius.xs,
          }}
        />
      </View>
    </View>
  )
}

// ---------- Main screen ----------

export function BlockDetailScreen() {
  const router = useRouter()
  const theme = useTheme()
  const { alert } = useAlert()
  const { blockId } = useLocalSearchParams<{ blockId: string }>()

  const { data: block, isLoading, isError } = useBlock(blockId)
  const { data: allRuns } = useRuns()
  const { data: moods } = useGetAllMoods()

  const completeBlock = useCompleteBlock()
  const deleteBlock = useDeleteBlock()

  const [showCeremony, setShowCeremony] = useState(false)

  useFocusEffect(
    useCallback(() => {
      return () => {
        setShowCeremony(false)
      }
    }, []),
  )

  const blockRuns = useMemo(
    () => allRuns?.filter((r) => r.blockId === blockId) ?? [],
    [allRuns, blockId],
  )

  const moodAnalytics = useMemo(
    () => (blockRuns.length > 0 && moods ? computeMoodAnalytics(blockRuns, moods) : null),
    [blockRuns, moods],
  )

  const progress = useMemo(() => {
    if (!block) return 0
    const start = new Date(block.startDate).getTime()
    const end = new Date(block.endDate).getTime()
    const now = Date.now()
    if (now <= start) return 0
    if (now >= end) return 100
    return Math.round(((now - start) / (end - start)) * 100)
  }, [block])

  const daysRemaining = useMemo(() => {
    if (!block) return 0
    return Math.max(
      0,
      Math.ceil((new Date(block.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    )
  }, [block])

  const handleComplete = () => {
    if (!block) return
    completeBlock.mutate(block.id, {
      onSuccess: () => setShowCeremony(true),
      onError: () =>
        alert('Error', 'Could not complete block. Please try again.', [{ text: 'OK' }]),
    })
  }

  const handleDelete = () => {
    if (!block) return
    alert('Delete Block', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteBlock.mutate(block.id, {
            onSuccess: () => router.replace('/(drawer)/blocks'),
            onError: () =>
              alert('Error', 'Could not delete block. Please try again.', [{ text: 'OK' }]),
          }),
      },
    ])
  }

  if (isLoading) {
    return (
      <Screen scroll={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.semantic.button.primary.bg} />
        </View>
      </Screen>
    )
  }

  if (isError || !block) {
    return (
      <Screen scroll={false}>
        <ThemedText>Unable to load this block.</ThemedText>
      </Screen>
    )
  }

  const config = BLOCK_TYPE_CONFIG[block.blockType]

  return (
    <>
      <Screen>
        {/* Section 1 — Header */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText
            style={{
              fontSize: theme.typography.size.xs,
              fontWeight: theme.typography.weights.semibold,
              color: config.accentColor,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: theme.spacing.xs,
            }}
          >
            {config.label}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: theme.typography.size.xxl,
              fontWeight: theme.typography.weights.bold,
              color: theme.semantic.text.primary,
              marginBottom: theme.spacing.sm,
            }}
          >
            {block.name}
          </ThemedText>
          <View style={styles.badgeRow}>
            <StatusBadge status={block.status} />
            <ThemedText
              style={{
                fontSize: theme.typography.size.sm,
                color: theme.semantic.text.secondary,
                marginLeft: theme.spacing.sm,
              }}
            >
              {block.startDate} – {block.endDate}
            </ThemedText>
          </View>
        </View>

        {/* Section 2 — Progress */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          <ProgressBar percent={progress} accentColor={config.accentColor} />
          <View style={[styles.progressLabels, { marginTop: theme.spacing.xs }]}>
            <ThemedText
              style={{ fontSize: theme.typography.size.xs, color: theme.semantic.text.muted }}
            >
              {block.startDate}
            </ThemedText>
            <ThemedText
              style={{ fontSize: theme.typography.size.xs, color: theme.semantic.text.muted }}
            >
              {progress}% complete
            </ThemedText>
            <ThemedText
              style={{ fontSize: theme.typography.size.xs, color: theme.semantic.text.muted }}
            >
              {block.endDate}
            </ThemedText>
          </View>
          <ThemedText
            style={{
              fontSize: theme.typography.size.sm,
              color: theme.semantic.text.secondary,
              textAlign: 'right',
              marginTop: theme.spacing.xs,
            }}
          >
            {block.status === 'active'
              ? `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining`
              : block.status === 'completed'
                ? `Completed ${block.completedAt ?? block.endDate}`
                : `Expired ${block.endDate}`}
          </ThemedText>
        </View>

        {/* Section 3 — Notes */}
        {block.notes ? (
          <View style={{ marginBottom: theme.spacing.lg }}>
            <SectionHeading>Notes</SectionHeading>
            <View
              style={{
                backgroundColor: theme.semantic.surface.cardAlt,
                borderRadius: theme.radius.md,
                padding: theme.spacing.md,
              }}
            >
              <ThemedText
                style={{
                  fontSize: theme.typography.size.md,
                  color: theme.semantic.text.primary,
                }}
              >
                {block.notes}
              </ThemedText>
            </View>
          </View>
        ) : null}

        {/* Section 4 — Mood Summary */}
        {moodAnalytics !== null ? (
          <View style={{ marginBottom: theme.spacing.lg }}>
            <SectionHeading>Runs in This Block</SectionHeading>
            <ThemedText
              style={{
                fontSize: theme.typography.size.md,
                color: theme.semantic.text.primary,
                marginBottom: theme.spacing.md,
              }}
            >
              {moodAnalytics.totalRuns} {moodAnalytics.totalRuns !== 1 ? 'runs' : 'run'} logged
            </ThemedText>
            {moodAnalytics.breakdown.map((row) => (
              <QuadrantRow key={row.key} row={row} />
            ))}
          </View>
        ) : null}

        {/* Section 5 — Actions */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          {block.status === 'active' && (
            <Button
              onPress={handleComplete}
              loading={completeBlock.isPending}
              disabled={deleteBlock.isPending}
              size="lg"
            >
              Complete Block
            </Button>
          )}
          <Button
            onPress={handleDelete}
            variant="outline"
            loading={deleteBlock.isPending}
            disabled={completeBlock.isPending}
            size="lg"
            style={{ marginTop: block.status === 'active' ? theme.spacing.sm : 0 }}
          >
            Delete Block
          </Button>
        </View>
      </Screen>

      {/* Completion Ceremony */}
      <AppModal visible={showCeremony} onClose={() => router.replace('/(drawer)/blocks')}>
        <View style={{ padding: theme.spacing.lg }}>
          <ThemedText
            style={{
              fontSize: theme.typography.size.xs,
              fontWeight: theme.typography.weights.semibold,
              color: config.accentColor,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: theme.spacing.sm,
            }}
          >
            {config.label}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: theme.typography.size.lg,
              fontWeight: theme.typography.weights.medium,
              color: theme.semantic.text.primary,
              marginBottom: theme.spacing.md,
            }}
          >
            {config.completionMessage}
          </ThemedText>
          {moodAnalytics !== null && (
            <ThemedText
              style={{
                fontSize: theme.typography.size.md,
                color: theme.semantic.text.secondary,
                marginBottom: theme.spacing.lg,
              }}
            >
              {moodAnalytics.totalRuns} {moodAnalytics.totalRuns !== 1 ? 'runs' : 'run'} logged in
              this block.
            </ThemedText>
          )}
          <Button
            onPress={() => router.replace('/(drawer)/blocks/create')}
            size="lg"
          >
            Start New Block
          </Button>
          <Button
            onPress={() => router.replace('/')}
            variant="outline"
            size="lg"
            style={{ marginTop: theme.spacing.sm }}
          >
            Back to Dashboard
          </Button>
        </View>
      </AppModal>
    </>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    overflow: 'hidden',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
