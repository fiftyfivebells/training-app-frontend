import { createMappedQueryHook } from '@/lib/hooks/createMappedQueryHook'
import { MoodResponse, moodClient } from '../api/moodsApi'
import { Mood, moodResponseToMood } from '../moods.types'
import { moodsKeys } from '../moods.constants'

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
