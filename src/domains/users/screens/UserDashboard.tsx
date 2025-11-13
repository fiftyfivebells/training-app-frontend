import { useAuth } from '@domains/auth/hooks/useAuth'
import { useRuns } from '@domains/runs/hooks/useRuns'
import {
  calculateDashboardStats,
  formatRunsAsActivities,
} from '@domains/users/utils/dashboard'
import { Feather } from '@expo/vector-icons'
import { colors, spacing, typography } from '@theme/index'
import { useRouter } from 'expo-router'
import React, { ReactNode, useCallback, useMemo } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
  DailyAffirmation,
  QuickActionCard,
  RecentActivityList,
  StatCard,
  WelcomeHeader,
} from '../components'
import { ThemedText } from '@/components/ui/ThemedText'

type StatCardConfig = {
  key: string
  icon: ReactNode
  label: string
  value: string | number
  variant?: 'default' | 'accent'
  subtext?: string
}

export function UserDashboard() {
  const router = useRouter()
  const { user, isLoading: isLoadingAuth } = useAuth()
  const {
    data: runs,
    isLoading: isLoadingRuns,
    isError: isRunsError,
    error: runsError,
    refetch: refetchRuns,
  } = useRuns()

  const stats = useMemo(() => calculateDashboardStats(runs), [runs])
  const recentActivities = useMemo(() => formatRunsAsActivities(runs), [runs])

  const affirmation = useMemo(() => {
    if (stats.totalRuns === 0) {
      return {
        text: 'Every journey starts with a single run. Log your first session to begin tracking progress.',
        blockName: undefined,
      }
    }

    const weeklyRunsLabel = stats.weeklyRuns === 1 ? 'run' : 'runs'
    const streakText =
      stats.currentStreak > 0
        ? `${stats.currentStreak}-day streak`
        : 'Start your streak today'

    return {
      text: `You've logged ${stats.weeklyRuns} ${weeklyRunsLabel} this week covering ${stats.weeklyDistance} km.`,
      blockName: streakText,
    }
  }, [stats])

  const handleLogRun = useCallback(() => {
    router.push('/(tabs)/log-run')
  }, [router])

  const handleViewRuns = useCallback(() => {
    router.push('/runs')
  }, [router])

  const handleManageBlocks = useCallback(() => {
    router.push('/(tabs)/blocks')
  }, [router])

  const quickActions = useMemo(
    () => [
      {
        icon: <Feather name="plus-circle" size={24} color={colors.primary.DEFAULT} />,
        label: 'Log a Run',
        description: 'Record your latest training session',
        onPress: handleLogRun,
      },
      {
        icon: <Feather name="list" size={24} color={colors.primary.DEFAULT} />,
        label: 'View All Runs',
        description: 'See your complete training history',
        onPress: handleViewRuns,
      },
      {
        icon: <Feather name="grid" size={24} color={colors.primary.DEFAULT} />,
        label: 'Manage Block',
        description: 'Update your current training block',
        onPress: handleManageBlocks,
      },
    ],
    [handleLogRun, handleViewRuns, handleManageBlocks],
  )

  const statCards: StatCardConfig[] = useMemo(
    () => [
      {
        key: 'weeklyRuns',
        icon: <Feather name="activity" size={28} color={colors.primary.DEFAULT} />,
        label: 'Runs This Week',
        value: stats.weeklyRuns,
        variant: 'accent' as const,
      },
      {
        key: 'weeklyDistance',
        icon: <Feather name="map" size={28} color={colors.brown.DEFAULT} />,
        label: 'Weekly Distance',
        value: `${stats.weeklyDistance} km`,
      },
      {
        key: 'currentStreak',
        icon: <Feather name="zap" size={28} color={colors.success} />,
        label: 'Current Streak',
        value: `${stats.currentStreak} days`,
      },
      {
        key: 'totalRuns',
        icon: <Feather name="award" size={28} color={colors.stone.DEFAULT} />,
        label: 'Total Runs',
        value: stats.totalRuns,
      },
    ],
    [stats],
  )

  const hasRuns = Boolean(runs && runs.length > 0)

  if (isLoadingAuth || isLoadingRuns) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <ThemedText style={styles.loadingText}>Loading dashboard...</ThemedText>
        </View>
      </SafeAreaView>
    )
  }

  if (isRunsError) {
    const errorMessage =
      runsError instanceof Error
        ? runsError.message
        : 'Unable to load your training data right now.'

    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorTitle}>Something went wrong</ThemedText>
          <ThemedText style={styles.errorMessage}>{errorMessage}</ThemedText>
          <TouchableOpacity style={styles.primaryButton} onPress={() => refetchRuns}>
            <ThemedText style={styles.primaryButtonText}>Try again</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <WelcomeHeader userName={user?.firstName || 'Runner'} />

        <View style={styles.section}>
          <DailyAffirmation
            affirmation={affirmation.text}
            blockName={affirmation.blockName}
          />
        </View>

        <View style={styles.statsGrid}>
          {statCards.map((card) => (
            <View key={card.key} style={styles.statCardWrapper}>
              <StatCard
                icon={card.icon}
                label={card.label}
                value={card.value}
                variant={card.variant}
                subtext={card.subtext}
              />
            </View>
          ))}
        </View>

        {!hasRuns && (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyStateTitle}>No runs yet</ThemedText>
            <ThemedText style={styles.emptyStateText}>
              Log your first training session to unlock personalized insights.
            </ThemedText>
            <TouchableOpacity style={styles.primaryButton} onPress={handleLogRun}>
              <ThemedText style={styles.primaryButtonText}>Log a run</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.contentGrid}>
          <View style={styles.quickActionsSection}>
            <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.label}
                icon={action.icon}
                label={action.label}
                description={action.description}
                onPress={action.onPress}
              />
            ))}
          </View>

          <View style={styles.activitySection}>
            <RecentActivityList activities={recentActivities} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.stone.DEFAULT,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.charcoal,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: typography.sizes.base,
    color: colors.stone.DEFAULT,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 999,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
    marginBottom: spacing.lg,
  },
  statCardWrapper: {
    width: '50%',
    padding: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.charcoal,
    marginBottom: spacing.md,
  },
  contentGrid: {
    gap: spacing.lg,
  },
  quickActionsSection: {
    flex: 1,
  },
  activitySection: {
    flex: 1,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.sand,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.sizes.base,
    color: colors.stone.DEFAULT,
    marginBottom: spacing.md,
  },
})
