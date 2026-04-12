import { useRouter } from 'expo-router'
import React, { useMemo } from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native'

import { Screen } from '@/components/layout/Screen'
import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/ThemeProvider'

import { BLOCK_TYPE_CONFIG, Block } from '../blocks.types'
import { useBlocks } from '../hooks'

function StatusBadge({ status }: { status: Block['status'] }) {
  const theme = useTheme()
  const isActive = status === 'active'
  const label = status === 'active' ? 'Active' : status === 'completed' ? 'Completed' : 'Expired'
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isActive
            ? theme.semantic.button.primary.bg
            : theme.semantic.surface.cardAlt,
          borderRadius: theme.radius.full,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 3,
        },
      ]}
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

export function BlockListScreen() {
  const router = useRouter()
  const theme = useTheme()
  const { data: blocks, isLoading, isError } = useBlocks()

  const sorted = useMemo(() => {
    if (!blocks) return []
    return [...blocks].sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1
      if (a.status !== 'active' && b.status === 'active') return 1
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    })
  }, [blocks])

  if (isLoading) {
    return (
      <Screen scroll={false}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.semantic.button.primary.bg} />
        </View>
      </Screen>
    )
  }

  if (isError || !blocks) {
    return (
      <Screen scroll={false}>
        <ThemedText>Unable to load training blocks right now.</ThemedText>
      </Screen>
    )
  }

  return (
    <Screen>
      <ThemedText
        style={{
          fontSize: theme.typography.size.xxl,
          fontWeight: theme.typography.weights.bold,
          color: theme.semantic.text.primary,
          marginBottom: theme.spacing.xs,
        }}
      >
        Training Blocks
      </ThemedText>

      <ThemedText
        style={{
          fontSize: theme.typography.size.md,
          color: theme.semantic.text.secondary,
          marginBottom: theme.spacing.lg,
        }}
      >
        Structured phases of training, one block at a time.
      </ThemedText>

      {sorted.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: theme.semantic.surface.card,
              borderRadius: theme.radius.lg,
              borderColor: theme.semantic.border.default,
              padding: theme.spacing.xl,
            },
          ]}
        >
          <ThemedText
            style={{
              fontSize: theme.typography.size.lg,
              fontWeight: theme.typography.weights.bold,
              color: theme.semantic.text.primary,
              marginBottom: theme.spacing.sm,
            }}
          >
            No blocks yet
          </ThemedText>
          <ThemedText
            style={{
              fontSize: theme.typography.size.md,
              color: theme.semantic.text.secondary,
              marginBottom: theme.spacing.md,
            }}
          >
            Start your first training block to bring structure and intention to your running.
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/(drawer)/blocks/create')}>
            <ThemedText
              style={{
                fontSize: theme.typography.size.md,
                fontWeight: theme.typography.weights.semibold,
                color: theme.semantic.button.primary.bg,
              }}
            >
              Start a Block →
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {sorted.map((block, index) => {
            const config = BLOCK_TYPE_CONFIG[block.blockType]
            const isLast = index === sorted.length - 1

            return (
              <TouchableOpacity
                key={block.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.semantic.surface.card,
                    borderRadius: theme.radius.lg,
                    borderColor: theme.semantic.border.default,
                    borderLeftColor: config.accentColor,
                    marginBottom: isLast ? 0 : theme.spacing.md,
                  },
                ]}
                onPress={() => router.push(`/(drawer)/blocks/${block.id}`)}
              >
                <View style={[styles.cardInner, { padding: theme.spacing.md }]}>
                  <View style={[styles.cardHeader, { marginBottom: theme.spacing.xs }]}>
                    <ThemedText
                      style={{
                        fontSize: theme.typography.size.md,
                        fontWeight: theme.typography.weights.semibold,
                        color: theme.semantic.text.primary,
                        flex: 1,
                        marginRight: theme.spacing.sm,
                      }}
                    >
                      {config.label}
                    </ThemedText>
                    <StatusBadge status={block.status} />
                  </View>

                  <ThemedText
                    style={{
                      fontSize: theme.typography.size.sm,
                      color: theme.semantic.text.secondary,
                    }}
                  >
                    {block.startDate} – {block.endDate}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            )
          })}

          <TouchableOpacity
            style={[
              styles.newBlockButton,
              {
                marginTop: theme.spacing.lg,
                padding: theme.spacing.md,
                borderRadius: theme.radius.lg,
                borderColor: theme.semantic.border.default,
              },
            ]}
            onPress={() => router.push('/(drawer)/blocks/create')}
          >
            <ThemedText
              style={{
                fontSize: theme.typography.size.md,
                fontWeight: theme.typography.weights.semibold,
                color: theme.semantic.button.primary.bg,
                textAlign: 'center',
              }}
            >
              + New Block
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    borderWidth: 1,
  },
  card: {
    borderWidth: 1,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  cardInner: {},
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {},
  newBlockButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
  },
})
