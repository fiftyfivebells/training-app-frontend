import React from 'react'
import { StyleSheet, View } from 'react-native'
import { MoodQuadrant } from './MoodQuadrant'
import { moodCategories, type MoodCategory } from '../moods.constants'
import type { MoodCategoryKey } from '../moods.types'

import { ThemedText } from '@/components/ui/ThemedText'

type MoodGridProps = {
  selectedCategoryKey: MoodCategoryKey | null
  onSelectCategory: (key: MoodCategoryKey) => void
}

export const MoodGrid: React.FC<MoodGridProps> = ({
  selectedCategoryKey,
  onSelectCategory,
}) => {
  const getCategory = (key: MoodCategoryKey): MoodCategory =>
    moodCategories.find((c) => c.key === key)!

  return (
    <View style={styles.wrapper}>
      <ThemedText style={styles.prompt}>How did this run feel?</ThemedText>

      <View style={styles.grid}>
        {moodCategories.map((category) => (
          <View key={category.key} style={styles.gridItem}>
            <MoodQuadrant
              category={category}
              isSelected={selectedCategoryKey === category.key}
              onPress={() => onSelectCategory(category.key)}
            />
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  prompt: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    alignContent: 'stretch',
  },
  gridItem: {
    width: '50%',
    padding: 8,
    minHeight: 180,
  },
})
