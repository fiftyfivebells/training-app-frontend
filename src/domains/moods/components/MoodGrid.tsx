import React from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/ui/ThemedText'
import { useTheme } from '@/theme/ThemeProvider'

import { moodCategories, type MoodCategory } from '../moods.constants'
import type { MoodCategoryKey } from '../moods.types'
import { MoodQuadrant } from './MoodQuadrant'

type MoodGridProps = {
  selectedCategoryKey: MoodCategoryKey | null
  onSelectCategory: (key: MoodCategoryKey) => void
}

export const MoodGrid: React.FC<MoodGridProps> = ({
  selectedCategoryKey,
  onSelectCategory,
}) => {
  const theme = useTheme()
  const getCategory = (key: MoodCategoryKey): MoodCategory =>
    moodCategories.find((c) => c.key === key)!

  return (
    <View style={styles.wrapper}>
      <ThemedText
        style={{
          fontSize: theme.typography.size.md,
          fontWeight: theme.typography.weights.semibold,
          marginBottom: theme.spacing.sm,
          color: theme.semantic.text.primary,
        }}
      >
        How did this run feel?
      </ThemedText>

      <View style={styles.grid}>
        {moodCategories.map((category) => (
          <View key={category.key} style={[styles.gridItem, { padding: theme.spacing.sm }]}>
            <MoodQuadrant
              category={category}
              isSelected={selectedCategoryKey === category.key}
              onPress={() => {
                onSelectCategory(category.key)
              }}
            />
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    alignContent: 'stretch',
  },
  gridItem: {
    width: '50%',
    minHeight: 180,
  },
})
