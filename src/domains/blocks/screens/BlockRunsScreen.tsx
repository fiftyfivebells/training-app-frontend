import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { PeriodSection } from '@/domains/runs/components/PeriodSection'
import { useRuns } from '@/domains/runs/hooks/useRuns'
import { groupRunsByPeriod, type Period } from '@/domains/runs/utils/groupRunsByPeriod'
import { useDistanceUnit } from '@/hooks/useDistanceUnit'
import { useTheme } from '@/theme/useTheme'

import { BLOCK_TYPE_CONFIG } from '../constants/blockTypes'
import { useBlock } from '../hooks/useBlock'

export function BlockRunsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { bg, text, rule, accent, mood, moodBg, semantic } = useTheme()
  const insets = useSafeAreaInsets()
  const { unit } = useDistanceUnit()

  const { data: block } = useBlock(id ?? '', { enabled: !!id })
  const { data: runs = [], isLoading, isFetching, refetch } = useRuns()

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    () => new Set(['current-week', 'last-week']),
  )

  const blockRuns = useMemo(
    () => runs.filter((r) => r.blockId === id),
    [runs, id],
  )

  const periods = useMemo(() => groupRunsByPeriod(blockRuns), [blockRuns])

  function togglePeriod(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const config = block ? BLOCK_TYPE_CONFIG[block.blockType] : null
  const headerTitle = block && config ? `${config.label} · ${blockRuns.length} runs` : 'Runs'

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
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={text.secondary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: text.primary }]}>
          {headerTitle}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList<Period>
        data={periods}
        keyExtractor={(period) => period.key}
        renderItem={({ item: period }) => (
          <PeriodSection
            period={period}
            expanded={expandedKeys.has(period.key)}
            onToggle={() => togglePeriod(period.key)}
            unit={unit}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={accent.default}
          />
        }
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: text.tertiary }]}>
                No runs found for this block.
              </Text>
            </View>
          ) : null
        }
      />
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
    fontFamily: 'Manrope',
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
  },
  headerRight: {
    width: 30, // balance back btn
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Manrope',
    fontSize: 14,
  },
})
