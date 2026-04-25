import { useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { Dateline } from '@/components/ui'
import { useTheme } from '@/theme/useTheme'

import { BLOCK_TYPE_CONFIG, Block } from '../blocks.types'

type Props = {
  block: Block | null | undefined
  onStartBlock?: () => void
}

function ProgressBar({ percent, accentColor }: { percent: number; accentColor: string }) {
  const { rule, radius } = useTheme()
  return (
    <View
      style={[
        styles.progressTrack,
        {
          backgroundColor: rule.default,
          borderRadius: radius.pill,
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
            borderRadius: radius.pill,
            height: 4,
          },
        ]}
      />
    </View>
  )
}

export function ActiveBlockBanner({ block, onStartBlock }: Props) {
  const { bg, text, rule, radius } = useTheme()
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
          backgroundColor: bg.surface,
          borderColor: rule.subtle,
          borderRadius: radius.sm,
        },
      ]}
      onPress={() => router.push(`/blocks`)}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Dateline style={styles.labelSpacing}>Active Block</Dateline>
          <Text style={[styles.title, { color: text.primary }]}>
            {block.name}
          </Text>
        </View>

        <ProgressBar percent={progress} accentColor={config.accentColor} />

        <View style={styles.footer}>
          <Text style={[styles.meta, { color: text.tertiary }]}>
            Day {Math.round(progress / (100 / 30))} of 30
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    padding: 12,
  },
  header: {
    marginBottom: 8,
  },
  labelSpacing: {
    marginBottom: 2,
  },
  title: {
    fontFamily: 'ManropeSemiBold',
    fontSize: 14,
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
    fontFamily: 'Manrope',
    fontSize: 11,
  },
})
