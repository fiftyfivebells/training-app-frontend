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
import { Dateline, DoubleRule } from '@/components/ui'
import { useTheme } from '@/theme/useTheme'

import { useBlocks } from '../hooks/useBlocks'
import { ActiveBlockCard } from '../components/ActiveBlockCard'
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
            paddingTop: insets.top + 10,
            backgroundColor: bg.base,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <Dateline>TRAINING</Dateline>
          <TouchableOpacity
            onPress={openBlockCreate}
            style={[styles.newBlockBtn, { borderColor: accent.default + '50' }]}
            accessibilityRole="button"
            accessibilityLabel="New block"
            activeOpacity={0.7}
          >
            <Text style={[styles.newBlockBtnText, { color: accent.default }]}>
              + New block
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerTitle, { color: text.primary }]}>Blocks.</Text>
        <DoubleRule style={{ marginTop: 10 }} />
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

        {/* Active section */}
        {activeBlock && (
          <View style={styles.section}>
            <Dateline style={{ paddingHorizontal: 20, marginBottom: 8 }}>ACTIVE</Dateline>
            <ActiveBlockCard
              block={activeBlock}
              runs={allRuns.filter((r) => r.blockId === activeBlock.id)}
              distUnit={distUnit}
            />
          </View>
        )}

        {/* Pending Section */}
        {pendingBlocks.length > 0 && (
          <View style={styles.section}>
            <Dateline style={{ paddingHorizontal: 20, marginBottom: 8 }}>PENDING</Dateline>
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
            <Dateline style={{ paddingHorizontal: 20, marginBottom: 8 }}>PAST BLOCKS</Dateline>
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
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerTitle: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 32,
    letterSpacing: -0.02 * 32,
    lineHeight: 34,
  },
  newBlockBtn: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  newBlockBtnText: {
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.08 * 11,
    textTransform: 'uppercase',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 14,
    gap: 18,
  },
  section: {
    gap: 0,
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
