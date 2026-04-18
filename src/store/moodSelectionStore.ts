import { create } from 'zustand'

interface MoodSelectionState {
  moodId: number | null
  set: (moodId: number) => void
  clear: () => void
}

export const useMoodSelectionStore = create<MoodSelectionState>()((setState) => ({
  moodId: null,
  set: (moodId) => setState({ moodId }),
  clear: () => setState({ moodId: null }),
}))
