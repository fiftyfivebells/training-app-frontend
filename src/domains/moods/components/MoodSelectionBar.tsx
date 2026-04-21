import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated from 'react-native-reanimated'
import type { AnimatedStyle } from 'react-native-reanimated'
import type { ViewStyle } from 'react-native'

import type { MoodCategoryKey } from '../moods.types'
import type { Cell } from '../utils/canvas'
import { useTheme } from '@/theme/useTheme'

interface MoodSelectionBarProps {
  selected: Cell | null
  quadColor: (q: MoodCategoryKey) => string
  dotAnimStyle: AnimatedStyle<ViewStyle>
  onConfirm: () => void
  paddingBottom: number
}

export function MoodSelectionBar({
  selected,
  quadColor,
  dotAnimStyle,
  onConfirm,
  paddingBottom,
}: MoodSelectionBarProps) {
  const { colors } = useTheme()

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.background.surface,
          borderTopColor: colors.border.subtle,
          minHeight: 82,
          paddingBottom,
        },
      ]}
    >
      <View style={styles.left}>
        <Animated.View
          style={[
            styles.dot,
            selected
              ? { backgroundColor: quadColor(selected.mood.quadrant), borderWidth: 0 }
              : {
                  backgroundColor: 'transparent',
                  borderWidth: 1.5,
                  borderStyle: 'dashed',
                  borderColor: colors.border.default,
                },
            dotAnimStyle,
          ]}
        />
        <View style={styles.textBlock}>
          {selected ? (
            <>
              <Text style={[styles.selectionName, { color: colors.text.primary }]}>
                {selected.mood.label}
              </Text>
              <Text style={[styles.selectionDesc, { color: colors.text.secondary }]}>
                {selected.mood.description}
              </Text>
            </>
          ) : (
            <Text style={[styles.selectionPrompt, { color: colors.text.tertiary }]}>
              Select how your run felt
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.confirmBtn,
          {
            backgroundColor: colors.copper.default,
            opacity: selected ? 1 : 0.3,
          },
        ]}
        onPress={onConfirm}
        disabled={!selected}
        accessibilityLabel="Confirm mood selection"
        accessibilityRole="button"
      >
        <Text style={[styles.confirmBtnText, { color: colors.background.base }]}>Confirm</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 16,
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
  selectionPrompt: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectionDesc: {
    fontSize: 12,
    marginTop: 1,
  },
  confirmBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
})
