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
import type { ThemeTokens } from '@/theme/tokens'
import { DIM_FILL } from '@/domains/moods/moods.constants'
import { useTheme } from '@/theme/useTheme'

interface MoodWidgetProps {
  value: number | null
  selectedMood: Mood | null
  hasError: boolean
  errorMessage?: string
  onLayout?: (e: LayoutChangeEvent) => void
}

function quadrantColor(q: MoodCategoryKey, moodTokens: ThemeTokens['mood']): string {
  const map: Record<MoodCategoryKey, string> = {
    'high-pleasant':    moodTokens.highGood,
    'high-challenging': moodTokens.highTough,
    'low-pleasant':     moodTokens.lowGood,
    'low-challenging':  moodTokens.lowTough,
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
  const { bg, text, rule, accent, mood, moodBg, semantic } = useTheme()

  return (
    <View style={styles.root} onLayout={onLayout}>
      <Text style={[styles.fieldLabel, { color: text.tertiary }]}>MOOD</Text>
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
                borderColor: quadrantColor(selectedMood.quadrant, mood),
              },
            ]}
          >
            <View style={styles.selectedLeft}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: quadrantColor(selectedMood.quadrant, mood) },
                ]}
              />
              <View style={styles.textBlock}>
                <Text style={[styles.moodName, { color: text.primary }]}>
                  {selectedMood.label}
                </Text>
                <Text style={[styles.moodDesc, { color: text.secondary }]}>
                  {selectedMood.description}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.changeBtn,
                { backgroundColor: bg.surface, borderColor: rule.default },
              ]}
            >
              <Text style={[styles.changeBtnText, { color: text.secondary }]}>
                Change
              </Text>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.empty,
              {
                backgroundColor: bg.surface,
                borderColor: hasError ? semantic.error : rule.default,
                borderStyle: hasError ? 'solid' : 'dashed',
                borderWidth: 1.5,
              },
            ]}
          >
            <View style={[styles.dotEmpty, { borderColor: rule.default }]} />
            <Text style={[styles.emptyText, { color: text.tertiary }]}>
              Tap to select your mood
            </Text>
            <Ionicons name="chevron-forward" size={16} color={text.tertiary} />
          </View>
        )}
      </TouchableOpacity>
      {hasError && (
        <Text style={[styles.errorText, { color: semantic.error }]}>
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
