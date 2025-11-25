import type { DashboardActivity } from '@domains/users/utils/dashboard'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/ThemeProvider'

interface RecentActivityListProps {
  activities: DashboardActivity[]
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  const theme = useTheme()

  if (activities.length === 0) {
    return (
      <View style={styles.container}>
        <ThemedText
          style={{
            fontSize: theme.typography.size.xl,
            fontWeight: theme.typography.weights.semibold,
            color: theme.semantic.text.primary,
            marginBottom: theme.spacing.md,
          }}
        >
          Recent Activity
        </ThemedText>
        <View
          style={[
            styles.emptyState,
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
              fontSize: theme.typography.size.md,
              color: theme.semantic.text.secondary,
            }}
          >
            No recent activities
          </ThemedText>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ThemedText
        style={{
          fontSize: theme.typography.size.xl,
          fontWeight: theme.typography.weights.semibold,
          color: theme.semantic.text.primary,
          marginBottom: theme.spacing.md,
        }}
      >
        Recent Activity
      </ThemedText>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.semantic.surface.card,
            borderRadius: theme.radius.lg,
            borderColor: theme.semantic.border.default,
          },
        ]}
      >
        {activities.map((activity) => (
          <View
            key={activity.id}
            style={[
              styles.activityRow,
              {
                padding: theme.spacing.md,
                borderBottomColor: theme.semantic.border.default,
              },
            ]}
          >
            <View
              style={[
                styles.activityIcon,
                {
                  borderRadius: theme.radius.full,
                  backgroundColor: theme.semantic.surface.cardAlt,
                  marginRight: theme.spacing.md,
                },
              ]}
            >
              <ThemedText style={{ fontSize: theme.typography.size.lg }}>
                {activity.icon}
              </ThemedText>
            </View>

            <View style={styles.activityContent}>
              <ThemedText
                style={{
                  fontSize: theme.typography.size.md,
                  fontWeight: theme.typography.weights.semibold,
                  color: theme.semantic.text.primary,
                  marginBottom: theme.spacing.xs / 2,
                }}
              >
                {activity.title}
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: theme.typography.size.sm,
                  color: theme.semantic.text.secondary,
                  marginBottom: theme.spacing.xs / 2,
                }}
              >
                {activity.subtitle}
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: theme.typography.size.xs,
                  color: theme.semantic.text.secondary,
                }}
              >
                {activity.timestamp}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
  },
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
})
