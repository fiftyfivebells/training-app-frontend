import { createMappedQueryHook } from '@/lib/hooks/createMappedQueryHook'

import { moodClient, MoodResponse } from '../api/moodsApi'
import { moodsKeys } from '../moods.constants'
import { Mood, moodResponseToMood } from '../moods.types'

export const useGetAllMoods = createMappedQueryHook<
  MoodResponse[],
  Mood[],
  readonly ['moods']
>(
  moodsKeys.all,
  () => moodClient.getAllMoods(),
  (responses: MoodResponse[]) =>
    responses.map((response) => moodResponseToMood(response)),
)
