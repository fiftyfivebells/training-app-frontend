import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@theme/index';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  variant?: 'default' | 'accent';
}

export function StatCard({ icon, label, value, subtext, variant = 'default' }: StatCardProps) {
  const isAccent = variant === 'accent';

  return (
    <View style={[styles.card, isAccent && styles.cardAccent]}>
      <View style={styles.iconWrapper}>{icon}</View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {subtext && <Text style={styles.subtext}>{subtext}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.sand,
  },
  cardAccent: {
    backgroundColor: colors.primary.DEFAULT + '10', // 10% opacity
    borderColor: colors.primary.DEFAULT + '30',
  },
  iconWrapper: {
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.stone.DEFAULT,
    textAlign: 'center',
  },
  subtext: {
    fontSize: typography.sizes.xs,
    color: colors.stone.DEFAULT,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
