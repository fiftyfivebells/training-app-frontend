import { router } from 'expo-router'
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import type { Mood, MoodCategoryKey } from '@/domains/moods/moods.types'
import { DIM_FILL } from '@/domains/moods/moods.constants'
import { useTheme } from '@/theme/useTheme'

interface MoodWidgetProps {
  value: number | null
  selectedMood: Mood | null
  hasError: boolean
  errorMessage?: string
  onLayout?: (e: LayoutChangeEvent) => void
}

function quadrantColor(q: MoodCategoryKey, colors: ReturnType<typeof useTheme>['colors']): string {
  const map: Record<MoodCategoryKey, string> = {
    'high-pleasant':    colors.mood.highGood,
    'high-challenging': colors.mood.highTough,
    'low-pleasant':     colors.mood.lowGood,
    'low-challenging':  colors.mood.lowTough,
  }
  return map[q]
}

export function MoodWidget({
  value,
  selectedMood,
  hasError,
  errorMessage,
  onLayout,
}: MoodWidgetProps) {
  const { colors } = useTheme()

  return (
    <View style={styles.root} onLayout={onLayout}>
      <Text style={[styles.fieldLabel, { color: colors.text.tertiary }]}>MOOD</Text>
      <TouchableOpacity
        onPress={() => router.push('/mood-picker')}
        accessibilityLabel="Select mood"
        accessibilityRole="button"
        activeOpacity={0.8}
      >
        {value !== null && selectedMood ? (
          <View
            style={[
              styles.selected,
              {
                backgroundColor: DIM_FILL[selectedMood.quadrant],
                borderColor: quadrantColor(selectedMood.quadrant, colors),
              },
            ]}
          >
            <View style={styles.selectedLeft}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: quadrantColor(selectedMood.quadrant, colors) },
                ]}
              />
              <View style={styles.textBlock}>
                <Text style={[styles.moodName, { color: colors.text.primary }]}>
                  {selectedMood.label}
                </Text>
                <Text style={[styles.moodDesc, { color: colors.text.secondary }]}>
                  {selectedMood.description}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.changeBtn,
                { backgroundColor: colors.background.surface, borderColor: colors.border.default },
              ]}
            >
              <Text style={[styles.changeBtnText, { color: colors.text.secondary }]}>
                Change
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.empty,
              {
                backgroundColor: colors.background.surface,
                borderColor: hasError ? colors.semantic.errorFg : colors.border.default,
                borderStyle: hasError ? 'solid' : 'dashed',
                borderWidth: 1.5,
              },
            ]}
          >
            <View style={[styles.dotEmpty, { borderColor: colors.border.default }]} />
            <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>
              Tap to select your mood
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
          </View>
        )}
      </TouchableOpacity>
      {hasError && (
        <Text style={[styles.errorText, { color: colors.semantic.errorFg }]}>
          {errorMessage}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.6,
  },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dotEmpty: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    flexShrink: 0,
  },
  emptyText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  selected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  selectedLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
  },
  moodName: {
    fontSize: 15,
    fontWeight: '600',
  },
  moodDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  changeBtn: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
  },
})
