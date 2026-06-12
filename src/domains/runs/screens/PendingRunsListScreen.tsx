import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Dateline, DoubleRule } from '@/components/ui'
import { useTheme } from '@/theme/useTheme'
import { useDistanceUnit } from '@/hooks/useDistanceUnit'
import type { PendingRunResponse } from '../api/runsApi'
import { useDeletePendingRun } from '../hooks/useDeletePendingRun'
import { usePendingRuns } from '../hooks/usePendingRuns'
import { formatDistanceParts } from '../utils/distance'
import { formatDurationDisplay } from '../utils/duration'
import { formatRunDate } from '../utils/formatters'

// ---------- sub-components ----------

type PendingRunRowProps = {
  run: PendingRunResponse
  isLast: boolean
}

function PendingRunRow({ run, isLast }: PendingRunRowProps) {
  const { bg, text, rule, accent } = useTheme()
  const { unit } = useDistanceUnit()
  const { mutate: deletePendingRun, isPending: isDeleting } = useDeletePendingRun()

  const { value: distValue, unit: distUnit } = formatDistanceParts(run.distanceMeters, unit)
  const duration = formatDurationDisplay(run.durationSeconds)
  const date = formatRunDate(run.date)

  return (
    <View
      style={[
        styles.row,
        {
          borderTopColor: rule.subtle,
          borderRightColor: rule.subtle,
          borderBottomColor: rule.subtle,
          borderLeftColor: accent.default,
          backgroundColor: accent.default + '0F',
        },
        !isLast && styles.rowSpacing,
      ]}
    >
      <View style={styles.rowContent}>
        <Dateline style={styles.rowDate}>{date}</Dateline>
        <View style={styles.rowStats}>
          <Text style={[styles.statValue, { color: text.primary }]}>
            {distValue}
            <Text style={[styles.statUnit, { color: text.tertiary }]}> {distUnit}</Text>
          </Text>
          <View style={[styles.statDivider, { backgroundColor: rule.strong }]} />
          <Text style={[styles.statValue, { color: text.primary }]}>{duration}</Text>
        </View>
      </View>

      <View style={styles.rowActions}>
        <TouchableOpacity
          style={[styles.deleteBtn, { borderColor: rule.strong }]}
          onPress={() => deletePendingRun(run.id)}
          disabled={isDeleting}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Delete run"
        >
          <Ionicons
            name="trash-outline"
            size={15}
            color={isDeleting ? text.disabled : text.tertiary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logBtn, { backgroundColor: accent.default }]}
          onPress={() => router.push(`/(modals)/complete-run/${run.id}`)}
          activeOpacity={0.75}
        >
          <Text style={[styles.logBtnText, { color: '#F4EFE4' }]}>Log</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ---------- main screen ----------

export function PendingRunsListScreen() {
  const { bg, text } = useTheme()
  const insets = useSafeAreaInsets()
  const { data: pendingRuns = [] } = usePendingRuns()

  return (
    <View style={[styles.screen, { backgroundColor: bg.base }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          >
            <Text style={[styles.headerBack, { color: text.secondary }]}>← Home</Text>
          </TouchableOpacity>
          <Dateline style={styles.headerLabel}>FROM STRAVA</Dateline>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={[styles.screenTitle, { color: text.primary }]}>
          {pendingRuns.length === 1 ? '1 run to log.' : `${pendingRuns.length} runs to log.`}
        </Text>
        <DoubleRule style={styles.headerRule} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {pendingRuns.length === 0 ? (
          <Text style={[styles.emptyText, { color: text.tertiary }]}>All done.</Text>
        ) : (
          pendingRuns.map((run, i) => (
            <PendingRunRow
              key={run.id}
              run={run}
              isLast={i === pendingRuns.length - 1}
            />
          ))
        )}
      </ScrollView>
    </View>
  )
}

// ---------- styles ----------

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBack: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 13,
  },
  headerLabel: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: { width: 50 },
  screenTitle: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 32,
    letterSpacing: -0.02 * 32,
    lineHeight: 35,
  },
  headerRule: { marginTop: 4 },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  rowSpacing: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 3,
    borderRadius: 4,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    padding: 14,
    gap: 12,
  },
  rowContent: {
    flex: 1,
    gap: 6,
  },
  rowDate: {},
  rowStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statValue: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 20,
    letterSpacing: -0.01 * 20,
  },
  statUnit: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 14,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logBtn: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logBtnText: {
    fontFamily: 'ManropeBold',
    fontSize: 12,
    letterSpacing: 0.04 * 12,
    textTransform: 'uppercase',
  },
  emptyText: {
    fontFamily: 'Fraunces_400Regular_Italic',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
})
