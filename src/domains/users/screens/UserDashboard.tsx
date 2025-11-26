import { useRuns } from '@domains/runs/hooks/useRuns'
import {
  calculateDashboardStats,
  formatRunsAsActivities,
} from '@domains/users/utils/dashboard'
import { Feather } from '@expo/vector-icons'
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

import { ThemedText } from '@/components/ui/ThemedText'
import { useAuthContext } from '@/domains/auth/context/AuthContext'
import { useTheme } from '@/theme/ThemeProvider'

import {
  DailyAffirmation,
  QuickActionCard,
  RecentActivityList,
  StatCard,
  WelcomeHeader,
} from '../components'

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
  const { user, isLoading: isLoadingAuth } = useAuthContext()
  const theme = useTheme()
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
    router.push('/(drawer)/log-run')
  }, [router])

  const handleViewRuns = useCallback(() => {
    router.push('/(drawer)/runs')
  }, [router])

  const handleManageBlocks = useCallback(() => {
    router.push('/(drawer)/blocks')
  }, [router])

  const quickActions = useMemo(
    () => [
      {
        icon: (
          <Feather
            name="plus-circle"
            size={24}
            color={theme.semantic.button.primary.bg}
          />
        ),
        label: 'Log a Run',
        description: 'Record your latest training session',
        onPress: handleLogRun,
      },
      {
        icon: <Feather name="list" size={24} color={theme.semantic.button.primary.bg} />,
        label: 'View All Runs',
        description: 'See your complete training history',
        onPress: handleViewRuns,
      },
      {
        icon: <Feather name="grid" size={24} color={theme.semantic.button.primary.bg} />,
        label: 'Manage Block',
        description: 'Update your current training block',
        onPress: handleManageBlocks,
      },
    ],
    [handleLogRun, handleViewRuns, handleManageBlocks, theme],
  )

  const statCards: StatCardConfig[] = useMemo(
    () => [
      {
        key: 'weeklyRuns',
        icon: (
          <Feather name="activity" size={28} color={theme.semantic.button.primary.bg} />
        ),
        label: 'Runs This Week',
        value: stats.weeklyRuns,
        variant: 'accent' as const,
      },
      {
        key: 'weeklyDistance',
        icon: <Feather name="map" size={28} color={theme.semantic.text.primary} />,
        label: 'Weekly Distance',
        value: `${stats.weeklyDistance} km`,
      },
      {
        key: 'currentStreak',
        icon: (
          <Feather name="zap" size={28} color={theme.semantic.mood.highGreat.border} />
        ),
        label: 'Current Streak',
        value: `${stats.currentStreak} days`,
      },
      {
        key: 'totalRuns',
        icon: <Feather name="award" size={28} color={theme.semantic.text.secondary} />,
        label: 'Total Runs',
        value: stats.totalRuns,
      },
    ],
    [stats, theme],
  )

  const hasRuns = Boolean(runs && runs.length > 0)

  if (isLoadingAuth || isLoadingRuns) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.semantic.surface.background }]}
        edges={['top', 'left', 'right']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.semantic.button.primary.bg} />
          <ThemedText
            style={{
              marginTop: theme.spacing.md,
              fontSize: theme.typography.size.md,
              color: theme.semantic.text.secondary,
            }}
          >
            Loading dashboard...
          </ThemedText>
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
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.semantic.surface.background }]}
        edges={['top', 'left', 'right']}
      >
        <View style={[styles.errorContainer, { padding: theme.spacing.xl }]}>
          <ThemedText
            style={{
              fontSize: theme.typography.size.xxl,
              fontWeight: theme.typography.weights.bold,
              color: theme.semantic.text.primary,
              marginBottom: theme.spacing.sm,
              textAlign: 'center',
            }}
          >
            Something went wrong
          </ThemedText>
          <ThemedText
            style={{
              fontSize: theme.typography.size.md,
              color: theme.semantic.text.secondary,
              marginBottom: theme.spacing.lg,
              textAlign: 'center',
            }}
          >
            {errorMessage}
          </ThemedText>
          <TouchableOpacity
            style={[
              theme.buttons.base,
              theme.buttons.variants.primary.container,
              theme.buttons.sizes.md,
            ]}
            onPress={() => refetchRuns()}
          >
            <ThemedText
              style={[
                {
                  fontSize: theme.typography.size.md,
                  fontWeight: theme.typography.weights.semibold,
                  textAlign: 'center',
                },
                theme.buttons.variants.primary.text,
              ]}
            >
              Try again
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.semantic.surface.background }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          padding: theme.spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <WelcomeHeader userName={user?.firstName || 'Runner'} />

        <View style={{ marginBottom: theme.spacing.lg }}>
          <DailyAffirmation
            affirmation={affirmation.text}
            blockName={affirmation.blockName}
          />
        </View>

        <View
          style={[
            styles.statsGrid,
            {
              marginHorizontal: -theme.spacing.sm,
              marginBottom: theme.spacing.lg,
            },
          ]}
        >
          {statCards.map((card) => (
            <View
              key={card.key}
              style={[styles.statCardWrapper, { padding: theme.spacing.sm }]}
            >
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
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: theme.semantic.surface.card,
                borderRadius: theme.radius.lg,
                borderColor: theme.semantic.border.default,
                padding: theme.spacing.xl,
                marginBottom: theme.spacing.lg,
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
              No runs yet
            </ThemedText>
            <ThemedText
              style={{
                fontSize: theme.typography.size.md,
                color: theme.semantic.text.secondary,
                marginBottom: theme.spacing.md,
              }}
            >
              Log your first training session to unlock personalized insights.
            </ThemedText>
            <TouchableOpacity
              style={[
                theme.buttons.base,
                theme.buttons.variants.primary.container,
                theme.buttons.sizes.md,
              ]}
              onPress={handleLogRun}
            >
              <ThemedText
                style={[
                  {
                    fontSize: theme.typography.size.md,
                    fontWeight: theme.typography.weights.semibold,
                    textAlign: 'center',
                  },
                  theme.buttons.variants.primary.text,
                ]}
              >
                Log a run
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.contentGrid}>
          <View style={[styles.quickActionsSection, { marginBottom: theme.spacing.lg }]}>
            <ThemedText
              style={{
                fontSize: theme.typography.size.xl,
                fontWeight: theme.typography.weights.semibold,
                color: theme.semantic.text.primary,
                marginBottom: theme.spacing.md,
              }}
            >
              Quick Actions
            </ThemedText>
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
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: { borderWidth: 1 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statCardWrapper: { width: '50%' },
  contentGrid: {
    flex: 1,
  },
  quickActionsSection: {
    flex: 1,
  },
  activitySection: {
    flex: 1,
  },
})
