import { useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/useTheme'

import { BLOCK_TYPE_CONFIG, Block } from '../blocks.types'

type Props = {
  block: Block | null | undefined
  onStartBlock?: () => void
}

function ProgressBar({ percent, accentColor }: { percent: number; accentColor: string }) {
  const { colors, radius } = useTheme()
  return (
    <View
      style={[
        styles.progressTrack,
        {
          backgroundColor: colors.border.default,
          borderRadius: radius.full,
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
            borderRadius: radius.full,
            height: 4,
          },
        ]}
      />
    </View>
  )
}

export function ActiveBlockBanner({ block, onStartBlock }: Props) {
  const { colors } = useTheme()
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

  if (!block) return null

  const config = BLOCK_TYPE_CONFIG[block.blockType]

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.container,
        {
          backgroundColor: colors.background.surface,
          borderColor: colors.border.subtle,
        },
      ]}
      onPress={() => router.push(`/blocks`)}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.label}>ACTIVE BLOCK</ThemedText>
          <ThemedText style={[styles.title, { color: colors.text.primary }]}>
            {block.name}
          </ThemedText>
        </View>

        <ProgressBar percent={progress} accentColor={config.accentColor} />

        <View style={styles.footer}>
          <ThemedText style={styles.meta}>
            Day {Math.round(progress / (100 / 30))} of 30
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    padding: 12,
  },
  header: {
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressTrack: {
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {},
  footer: {
    marginTop: 8,
  },
  meta: {
    fontSize: 11,
    opacity: 0.6,
  },
})
