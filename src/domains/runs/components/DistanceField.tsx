import type { DistanceUnit } from '@domains/runs/utils/distance'
import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'
import { ThemedTextInput } from '@/components/ui/ThemedTextInput'
import { useTheme } from '@/theme/ThemeProvider'
import { TextInput } from 'react-native-gesture-handler'

type DistanceFieldProps = {
  distance: string
  unit: DistanceUnit
  onChangeDistance: (value: string) => void
  onChangeUnit: (unit: DistanceUnit) => void
  inputRef?: React.RefObject<TextInput | null>
}

export const DistanceField: React.FC<DistanceFieldProps> = ({
  distance,
  unit,
  onChangeDistance,
  onChangeUnit,
  inputRef,
}) => {
  const theme = useTheme()

  return (
    <>
      <ThemedText
        style={{
          fontSize: theme.typography.size.sm,
          fontWeight: theme.typography.weights.semibold,
          marginBottom: theme.spacing.xs,
          color: theme.semantic.text.primary,
        }}
      >
        Distance
      </ThemedText>
      <View style={styles.row}>
        <ThemedTextInput
          style={[
            styles.distanceInput,
            {
              marginRight: theme.spacing.md,
              borderColor: theme.semantic.border.default,
              backgroundColor: theme.semantic.surface.card,
              padding: theme.spacing.sm,
              borderRadius: theme.radius.md,
              fontSize: theme.typography.size.md,
            },
          ]}
          value={distance}
          onChangeText={onChangeDistance}
          placeholder="5.2"
          keyboardType="numeric"
          ref={inputRef}
        />

        <View
          style={[
            styles.unitPicker,
            {
              backgroundColor: theme.semantic.surface.card,
              borderRadius: theme.radius.md,
              borderColor: theme.semantic.border.default,
            },
          ]}
        >
          {(['miles', 'km', 'meters'] as DistanceUnit[]).map((u) => (
            <Pressable
              key={u}
              onPress={() => {
                onChangeUnit(u)
              }}
              style={[
                styles.unitOption,
                u === 'meters' && styles.lastUnitOption,
                {
                  alignItems: 'center',
                  borderRightColor: theme.semantic.border.default,
                  paddingVertical: theme.spacing.xs,
                  paddingHorizontal: theme.spacing.sm,
                },
                unit === u && {
                  backgroundColor: theme.semantic.button.primary.bg,
                },
              ]}
            >
              <ThemedText
                style={[
                  {
                    fontSize: theme.typography.size.sm,
                    color: theme.semantic.text.primary,
                  },
                  unit === u && {
                    color: theme.semantic.button.primary.text,
                    fontWeight: theme.typography.weights.semibold,
                  },
                ]}
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
  row: { flexDirection: 'row', alignItems: 'center' },
  distanceInput: {
    minWidth: '10%',
    borderWidth: 1,
  },
  unitPicker: {
    justifyContent: 'space-around',
    maxWidth: '30%',
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
  },
  unitOption: { flex: 1, borderRightWidth: 1 },
  lastUnitOption: { borderRightWidth: 0 },
})
