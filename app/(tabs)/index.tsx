import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../src/theme';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning, Stephen! 🌅</Text>
          <Text style={styles.affirmation}>
            "Today is about building your foundation. Every step matters."
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>This Week</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Runs</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>15.2</Text>
              <Text style={styles.statLabel}>km</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>+2.8</Text>
              <Text style={styles.statLabel}>Avg Mood</Text>
            </View>
          </View>
        </View>

        {/* Recent Runs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Runs</Text>
          {/* Run cards will go here */}
          <Text style={styles.emptyState}>No runs logged yet. Start by logging your first run!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.brown.DEFAULT,
    marginBottom: spacing.sm,
  },
  affirmation: {
    fontSize: typography.sizes.base,
    color: colors.stone.DEFAULT,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  statsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.sand,
    shadowColor: colors.brown.DEFAULT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.charcoal,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.primary.DEFAULT,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.stone.DEFAULT,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.charcoal,
    marginBottom: spacing.md,
  },
  emptyState: {
    fontSize: typography.sizes.base,
    color: colors.stone.DEFAULT,
    textAlign: 'center',
    padding: spacing.xl,
    fontStyle: 'italic',
  },
});