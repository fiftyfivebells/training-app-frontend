import React, { useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import { MoodGrid } from '@domains/moods/components/MoodGrid'
import { MoodPickerModal } from '@domains/moods/components/MoodPickerModal'
import { MoodSelectedChip } from '@domains/moods/components/MoodSelectedChip'
import { useGetAllMoods } from '@domains/moods/hooks/useGetAllMoods'
import type { Mood, MoodCategoryKey } from '@domains/moods/moods.types'
import { colors } from '@/theme'

type MoodFieldProps = {
  mood: Mood | null
  onChange: (mood: Mood | null) => void
}

export const MoodField: React.FC<MoodFieldProps> = ({ mood, onChange }) => {
  const [activeQuadrant, setActiveQuadrant] = React.useState<MoodCategoryKey | null>(null)
  const [isMoodModalOpen, setIsMoodModalOpen] = React.useState(false)

  const { data: allMoods = [] } = useGetAllMoods()

  const moodsForQuadrant = useMemo(() => {
    if (!activeQuadrant) return []
    return allMoods.filter((m) => m.quadrant === activeQuadrant)
  }, [allMoods, activeQuadrant])

  return (
    <View style={styles.container}>
      <MoodGrid
        selectedCategoryKey={activeQuadrant}
        onSelectCategory={(key) => {
          setActiveQuadrant(key)
          setIsMoodModalOpen(true)
        }}
      />

      {mood && <MoodSelectedChip mood={mood} />}

      <MoodPickerModal
        visible={isMoodModalOpen}
        moods={moodsForQuadrant}
        onClose={() => setIsMoodModalOpen(false)}
        onSelect={(selected) => {
          onChange(selected)
          setIsMoodModalOpen(false)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    backgroundColor: colors.transparent,
  },
})
