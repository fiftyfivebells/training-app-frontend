import React from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { ThemedText } from '@/components/ui/ThemedText'
import { ThemedTextInput } from '@/components/ui/ThemedTextInput'
import { colors } from '@/theme'
import type { DistanceUnit } from '@domains/runs/utils/distance'

type DistanceFieldProps = {
  distance: string
  unit: DistanceUnit
  onChangeDistance: (value: string) => void
  onChangeUnit: (unit: DistanceUnit) => void
}

export const DistanceField: React.FC<DistanceFieldProps> = ({
  distance,
  unit,
  onChangeDistance,
  onChangeUnit,
}) => {
  return (
    <>
      <ThemedText style={styles.label}>Distance</ThemedText>
      <View style={styles.row}>
        <ThemedTextInput
          style={[styles.input, styles.distanceInput]}
          value={distance}
          onChangeText={onChangeDistance}
          placeholder="5.2"
          keyboardType="numeric"
        />

        <View style={styles.unitPicker}>
          {(['miles', 'km', 'meters'] as DistanceUnit[]).map((u) => (
            <Pressable
              key={u}
              onPress={() => onChangeUnit(u)}
              style={[styles.unitOption, unit === u && styles.unitOptionSelected]}
            >
              <ThemedText
                style={[styles.unitText, unit === u && styles.unitTextSelected]}
              >
                {u === 'miles' ? 'mi' : u === 'km' ? 'km' : 'm'}
              </ThemedText>
            </Pressable>
          ))}
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
  row: { flexDirection: 'row', alignItems: 'center' },
  input: {
    borderWidth: 1,
    borderColor: colors.stone.light,
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  distanceInput: { flex: 1, marginRight: 12 },
  unitPicker: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.stone.light,
    overflow: 'hidden',
  },
  unitOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: colors.stone.light,
  },
  unitOptionSelected: {
    backgroundColor: colors.primary.light,
  },
  unitText: {
    fontSize: 14,
    color: colors.charcoal,
  },
  unitTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
})
