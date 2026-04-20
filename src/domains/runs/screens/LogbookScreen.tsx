import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useMemo, useState } from 'react'
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useRuns } from '@/domains/runs/hooks/useRuns'
import { useDistanceUnit } from '@/hooks/useDistanceUnit'
import { useTheme } from '@/theme/useTheme'

import { PeriodSection } from '../components/PeriodSection'
import { groupRunsByPeriod, type Period } from '../utils/groupRunsByPeriod'

export function LogbookScreen() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { data: runs = [], isLoading, isFetching, refetch } = useRuns()
  const { unit } = useDistanceUnit()

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    () => new Set(['current-week', 'last-week']),
  )
  const [filterSheetVisible, setFilterSheetVisible] = useState(false)

  const periods = useMemo(() => groupRunsByPeriod(runs), [runs])

  function togglePeriod(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const isEmpty = !isLoading && runs.length === 0

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
        <Text style={[styles.title, { color: colors.text.primary }]}>Logbook</Text>
        <TouchableOpacity
          style={[
            styles.filterBtn,
            {
              backgroundColor: colors.background.surface,
              borderColor: colors.border.default,
            },
          ]}
          onPress={() => setFilterSheetVisible(true)}
          accessibilityLabel="Filter runs"
          accessibilityRole="button"
        >
          <Ionicons name="options-outline" size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Empty state */}
      {isEmpty ? (
        <View style={[styles.emptyState, { paddingBottom: insets.bottom + 16 }]}>
          <Text
            style={[
              styles.emptyText,
              { color: colors.text.primary, fontFamily: 'Fraunces_400Regular_Italic' },
            ]}
          >
            Your running story starts with the first step.
          </Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: colors.copper.default }]}
            onPress={() => router.push('/log')}
            accessibilityLabel="Log your first run"
            accessibilityRole="button"
          >
            <Text style={[styles.emptyBtnText, { color: colors.background.base }]}>
              Log your first run
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
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
              tintColor={colors.copper.default}
            />
          }
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
        />
      )}

      {/* Filter bottom sheet */}
      <Modal
        visible={filterSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterSheetVisible(false)}
      >
        <Pressable
          style={styles.sheetBackdrop}
          onPress={() => setFilterSheetVisible(false)}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background.surface,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: colors.border.default }]} />
          <Text style={[styles.sheetTitle, { color: colors.text.primary }]}>Filters</Text>
          <Text style={[styles.sheetSub, { color: colors.text.secondary }]}>
            Filters coming soon
          </Text>
        </View>
      </Modal>
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
  title: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  sheetSub: {
    fontSize: 14,
  },
})
