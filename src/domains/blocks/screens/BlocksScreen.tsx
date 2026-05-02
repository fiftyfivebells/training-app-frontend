import { format } from 'date-fns'
import { router } from 'expo-router'
import { useMemo } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useRuns } from '@/domains/runs/hooks/useRuns'
import { useDistanceUnit } from '@/hooks/useDistanceUnit'
import { Dateline } from '@/components/ui'
import { useTheme } from '@/theme/useTheme'

import { useBlocks } from '../hooks/useBlocks'
import { PastBlockCard } from '../components/PastBlockCard'

export function BlocksScreen() {
  const { bg, text, accent } = useTheme()
  const insets = useSafeAreaInsets()

  const { data: blocks = [], isLoading: blocksLoading } = useBlocks()
  const { data: allRuns = [] } = useRuns()
  const { unit: distUnit } = useDistanceUnit()

  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])

  const { activeBlock, pendingBlocks, completedBlocks } = useMemo(() => {
    const active = blocks.find(
      (b) => b.status === 'active' && b.startDate <= todayStr && b.endDate >= todayStr,
    )
    const pending = blocks
      .filter((b) => b.status === 'active' && b.startDate > todayStr)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
    const completed = blocks
      .filter(
        (b) =>
          b.status === 'completed' ||
          b.status === 'expired' ||
          (b.status === 'active' && b.endDate < todayStr),
      )
      .sort((a, b) => {
        const dateA = a.completedAt || a.endDate
        const dateB = b.completedAt || b.endDate
        return dateB.localeCompare(dateA)
      })

    return { activeBlock: active, pendingBlocks: pending, completedBlocks: completed }
  }, [blocks, todayStr])

  const isEmpty = !blocksLoading && blocks.length === 0

  const openBlockCreate = () => {
    router.push('/(modals)/block-create')
  }

  return (
    <View style={[styles.screen, { backgroundColor: bg.base }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: bg.base,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: text.primary }]}>Blocks</Text>
        <TouchableOpacity
          onPress={openBlockCreate}
          style={[
            styles.newBlockBtn,
            {
              backgroundColor: bg.surface,
              borderColor: bg.elevated,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="New block"
          activeOpacity={0.7}
        >
          <Text style={[styles.newBlockBtnText, { color: accent.default }]}>
            + New block
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Full empty state */}
        {isEmpty && (
          <View style={styles.fullEmpty}>
            <Text
              style={[
                styles.fullEmptyText,
                { color: text.secondary, fontFamily: 'Fraunces_400Regular_Italic' },
              ]}
            >
              Your training history will appear here.
            </Text>
          </View>
        )}

        {/* Current / Active Section */}
        {activeBlock && (
          <View style={styles.section}>
            <Dateline style={{ paddingHorizontal: 16, marginBottom: 4 }}>ACTIVE</Dateline>
            <PastBlockCard
              block={activeBlock}
              runs={allRuns.filter((r) => r.blockId === activeBlock.id)}
              distUnit={distUnit}
              isActive
            />
          </View>
        )}

        {/* Pending Section */}
        {pendingBlocks.length > 0 && (
          <View style={styles.section}>
            <Dateline style={{ paddingHorizontal: 16, marginBottom: 4 }}>PENDING</Dateline>
            {pendingBlocks.map((block) => (
              <PastBlockCard
                key={block.id}
                block={block}
                runs={allRuns.filter((r) => r.blockId === block.id)}
                distUnit={distUnit}
              />
            ))}
          </View>
        )}

        {/* Past blocks section */}
        {completedBlocks.length > 0 && (
          <View style={styles.section}>
            <Dateline style={{ paddingHorizontal: 16, marginBottom: 4 }}>PAST BLOCKS</Dateline>
            {completedBlocks.map((block) => (
              <PastBlockCard
                key={block.id}
                block={block}
                runs={allRuns.filter((r) => r.blockId === block.id)}
                distUnit={distUnit}
              />
            ))}
          </View>
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
    fontFamily: 'Fraunces_400Regular',
    fontSize: 28,
    letterSpacing: -0.02 * 28,
  },
  newBlockBtn: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  newBlockBtnText: {
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    gap: 16,
  },
  section: {
    gap: 8,
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
})
