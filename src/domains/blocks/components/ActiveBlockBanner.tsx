import { useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/ThemeProvider'

import { BLOCK_TYPE_CONFIG, Block } from '../blocks.types'

type Props = {
  block: Block | null | undefined
  onStartBlock?: () => void
}

function ProgressBar({ percent, accentColor }: { percent: number; accentColor: string }) {
  const theme = useTheme()
  return (
    <View
      style={[
        styles.progressTrack,
        {
          backgroundColor: theme.semantic.border.default,
          borderRadius: theme.radius.full,
          height: 4,
        },
      ]}
    >
      <View
        style={[
          styles.progressFill,
          {
            width: `${percent}%`,
            backgroundColor: accentColor,
            borderRadius: theme.radius.full,
            height: 4,
          },
        ]}
      />
    </View>
  )
}

export function ActiveBlockBanner({ block, onStartBlock }: Props) {
  const theme = useTheme()
  const router = useRouter()

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

  if (block === undefined) return null

  if (block === null) {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.semantic.surface.card,
            borderRadius: theme.radius.lg,
            borderColor: theme.semantic.border.default,
            padding: theme.spacing.md,
          },
        ]}
      >
        <ThemedText
          style={{
            fontSize: theme.typography.size.sm,
            color: theme.semantic.text.muted,
            marginBottom: theme.spacing.sm,
          }}
        >
          No active training block
        </ThemedText>
        <TouchableOpacity
          onPress={onStartBlock ?? (() => router.push('/(drawer)/blocks/create'))}
        >
          <ThemedText
            style={{
              fontSize: theme.typography.size.sm,
              fontWeight: theme.typography.weights.semibold,
              color: theme.semantic.button.primary.bg,
            }}
          >
            Start a Block →
          </ThemedText>
        </TouchableOpacity>
      </View>
    )
  }

  const config = BLOCK_TYPE_CONFIG[block.blockType]
  const daysLabel = daysRemaining === 1 ? 'day' : 'days'

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/(drawer)/blocks/${block.id}`)}
      style={[
        styles.card,
        {
          backgroundColor: theme.semantic.surface.card,
          borderRadius: theme.radius.lg,
          borderLeftColor: config.accentColor,
          padding: theme.spacing.md,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.labelGroup}>
          <ThemedText
            style={{
              fontSize: theme.typography.size.xs,
              fontWeight: theme.typography.weights.semibold,
              color: config.accentColor,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginBottom: 2,
            }}
          >
            Active Block
          </ThemedText>
          <ThemedText
            style={{
              fontSize: theme.typography.size.md,
              fontWeight: theme.typography.weights.semibold,
              color: theme.semantic.text.primary,
            }}
          >
            {config.label}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: theme.typography.size.sm,
              color: theme.semantic.text.secondary,
            }}
          >
            {config.description}
          </ThemedText>
        </View>
        <ThemedText
          style={{
            fontSize: theme.typography.size.sm,
            color: theme.semantic.text.muted,
          }}
        >
          {daysRemaining} {daysLabel} left
        </ThemedText>
      </View>

      <View style={{ marginTop: theme.spacing.sm }}>
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
            {progress}%
          </ThemedText>
          <ThemedText
            style={{ fontSize: theme.typography.size.xs, color: theme.semantic.text.muted }}
          >
            {block.endDate}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  labelGroup: {
    flex: 1,
    marginRight: 8,
  },
  progressTrack: {
    overflow: 'hidden',
  },
  progressFill: {},
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
