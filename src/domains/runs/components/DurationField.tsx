import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/components/ui/ThemedText'
import { ThemedTextInput } from '@/components/ui/ThemedTextInput'
import { colors } from '@/theme'

type DurationFieldProps = {
  hours: string
  minutes: string
  seconds: string
  onChangeHours: (value: string) => void
  onChangeMinutes: (value: string) => void
  onChangeSeconds: (value: string) => void
  normalizedLabel: string
}

export const DurationField: React.FC<DurationFieldProps> = ({
  hours,
  minutes,
  seconds,
  onChangeHours,
  onChangeMinutes,
  onChangeSeconds,
  normalizedLabel,
}) => {
  return (
    <>
      <ThemedText style={styles.label}>Duration</ThemedText>

      <View style={styles.durationContainer}>
        <View style={styles.timeRow}>
          <ThemedTextInput
            style={[styles.input, styles.timeInput]}
            value={hours}
            onChangeText={onChangeHours}
            placeholder="HH"
            keyboardType="number-pad"
            maxLength={2}
          />
          <ThemedText style={styles.timeSeparator}>:</ThemedText>

          <ThemedTextInput
            style={[styles.input, styles.timeInput]}
            value={minutes}
            onChangeText={onChangeMinutes}
            placeholder="MM"
            keyboardType="number-pad"
            maxLength={2}
          />
          <ThemedText style={styles.timeSeparator}>:</ThemedText>

          <ThemedTextInput
            style={[styles.input, styles.timeInput]}
            value={seconds}
            onChangeText={onChangeSeconds}
            placeholder="SS"
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>

        <View style={styles.totalTimeWrapper}>
          <ThemedText style={styles.totalTimeLabel}>Total</ThemedText>
          <ThemedText style={styles.totalTimeValue}>{normalizedLabel}</ThemedText>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: colors.charcoal,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.stone.light,
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeInput: { width: 60, textAlign: 'center', marginRight: 4 },
  timeSeparator: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 6,
    color: colors.charcoal,
  },
  totalTimeWrapper: { marginLeft: 16, alignItems: 'flex-start' },
  totalTimeLabel: {
    fontSize: 12,
    color: colors.stone.light,
    marginBottom: 2,
  },
  totalTimeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.charcoal,
  },
})
